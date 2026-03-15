import { jsPDF } from 'jspdf';

import type { ExportPreset } from '@kaeri/shared/schemas/export-preset.schema';

import type { ScriptDoc } from '@~/db/models/script.model';

/**
 * Page dimensions in points (72 points = 1 inch)
 */
const PAGE_DIMENSIONS = {
  LETTER: { width: 612, height: 792 },
  A4: { width: 595.28, height: 841.89 },
  LEGAL: { width: 612, height: 1008 },
} as const;

interface iTiptapNode {
  type: string;
  content?: iTiptapNode[];
  text?: string;
}

/**
 * Parsed scene information for call sheet
 */
interface iSceneBreakdown {
  sceneNumber: number;
  heading: string;
  intExt: 'INT' | 'EXT' | 'INT/EXT' | 'UNKNOWN';
  location: string;
  timeOfDay: string;
  characters: string[];
  pageStart: number;
  estimatedPages: number;
}

/**
 * Service for generating call sheet / breakdown exports
 */
export class CallSheetGeneratorService {
  private doc: jsPDF | null = null;

  private currentY = 0;

  private pageNumber = 1;

  private pageWidth = 0;

  private pageHeight = 0;

  private contentWidth = 0;

  private marginLeft = 0;

  private marginRight = 0;

  private marginTop = 0;

  private marginBottom = 0;

  /**
   * Generate call sheet PDF from script content
   */
  public async generateCallSheet(
    script: ScriptDoc,
    preset: ExportPreset,
  ): Promise<{ data: string; sizeBytes: number }> {
    // Parse script to extract scene breakdowns
    const scenes = this.parseScriptForBreakdown(script);

    // Initialize page dimensions
    const pageDim = PAGE_DIMENSIONS[preset.pageSize];
    this.pageWidth = pageDim.width;
    this.pageHeight = pageDim.height;
    this.marginLeft = preset.margins.left * 72;
    this.marginRight = preset.margins.right * 72;
    this.marginTop = preset.margins.top * 72;
    this.marginBottom = preset.margins.bottom * 72;
    this.contentWidth = this.pageWidth - this.marginLeft - this.marginRight;
    this.currentY = this.marginTop;
    this.pageNumber = 1;

    // Create PDF document
    // eslint-disable-next-line new-cap
    this.doc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: [this.pageWidth, this.pageHeight],
    });

    // Set default font
    this.doc.setFont('helvetica', 'normal');

    // Generate title
    this.renderTitle(script.title);

    // Generate summary section
    this.renderSummary(scenes);

    // Generate scene breakdown table
    this.renderSceneBreakdownTable(scenes);

    // Generate character index
    this.renderCharacterIndex(scenes);

    // Generate location index
    this.renderLocationIndex(scenes);

    // Add page numbers
    this.addPageNumbers();

    // Get PDF data
    const pdfOutput = this.doc.output('datauristring');
    // Extract base64 data (remove data:application/pdf;base64, prefix)
    const base64Data = pdfOutput.split(',')[1];
    // Calculate approximate size
    const sizeBytes = Math.ceil((base64Data.length * 3) / 4);

    return { data: base64Data, sizeBytes };
  }

  /**
   * Parse script content to extract scene information
   */
  private parseScriptForBreakdown(script: ScriptDoc): iSceneBreakdown[] {
    const scenes: iSceneBreakdown[] = [];

    // Parse content as JSON if it's stored as string
    const content = typeof script.content === 'string' ? JSON.parse(script.content) : script.content;

    if (!content?.content || content.type !== 'doc') {
      return scenes;
    }

    let currentScene: iSceneBreakdown | null = null;
    let sceneNumber = 0;
    let currentPageEstimate = 1;
    let linesInScene = 0;

    for (const node of content.content as iTiptapNode[]) {
      if (node.type === 'scene-heading') {
        // Save previous scene if exists
        if (currentScene) {
          currentScene.estimatedPages = Math.max(0.125, linesInScene / 56); // ~56 lines per page
          scenes.push(currentScene);
          currentPageEstimate += currentScene.estimatedPages;
        }

        sceneNumber += 1;
        const headingText = this.extractText(node);
        const parsed = this.parseSceneHeading(headingText);

        currentScene = {
          sceneNumber,
          heading: headingText,
          intExt: parsed.intExt,
          location: parsed.location,
          timeOfDay: parsed.timeOfDay,
          characters: [],
          pageStart: currentPageEstimate,
          estimatedPages: 0,
        };
        linesInScene = 1;
      } else if (currentScene) {
        // Count lines for page estimation
        const text = this.extractText(node);
        linesInScene += Math.ceil(text.length / 60) || 1;

        // Extract character names
        if (node.type === 'character') {
          const charName = this.extractText(node).trim().toUpperCase();
          // Remove extensions like (V.O.), (O.S.), (CONT'D)
          const cleanName = charName.replaceAll(/\s*\([^)]*\)/g, '').trim();
          if (cleanName && !currentScene.characters.includes(cleanName)) {
            currentScene.characters.push(cleanName);
          }
        }
      }
    }

    // Save final scene
    if (currentScene) {
      currentScene.estimatedPages = Math.max(0.125, linesInScene / 56);
      scenes.push(currentScene);
    }

    return scenes;
  }

  /**
   * Parse scene heading to extract INT/EXT, location, and time of day
   */
  private parseSceneHeading(heading: string): {
    intExt: 'INT' | 'EXT' | 'INT/EXT' | 'UNKNOWN';
    location: string;
    timeOfDay: string;
  } {
    const upperHeading = heading.toUpperCase().trim();

    // Determine INT/EXT
    let intExt: 'INT' | 'EXT' | 'INT/EXT' | 'UNKNOWN' = 'UNKNOWN';
    let locationPart = upperHeading;

    if (upperHeading.startsWith('INT/EXT') || upperHeading.startsWith('I/E')) {
      intExt = 'INT/EXT';
      locationPart = upperHeading.replace(/^(INT\/EXT|I\/E)[.\s-]*/, '');
    } else if (upperHeading.startsWith('INT')) {
      intExt = 'INT';
      locationPart = upperHeading.replace(/^INT[.\s-]*/, '');
    } else if (upperHeading.startsWith('EXT')) {
      intExt = 'EXT';
      locationPart = upperHeading.replace(/^EXT[.\s-]*/, '');
    }

    // Extract time of day (usually at the end after a dash)
    const timePatterns = ['DAY', 'NIGHT', 'DAWN', 'DUSK', 'MORNING', 'AFTERNOON', 'EVENING', 'CONTINUOUS', 'LATER'];
    let timeOfDay = '';
    let location = locationPart;

    for (const time of timePatterns) {
      const timeRegex = new RegExp(`\\s*[-–—]\\s*${time}\\s*$`, 'i');
      if (timeRegex.test(location)) {
        timeOfDay = time;
        location = location.replace(timeRegex, '').trim();
        break;
      }
    }

    return { intExt, location: location.trim(), timeOfDay };
  }

  /**
   * Extract plain text from a Tiptap node
   */
  private extractText(node: iTiptapNode): string {
    if (node.text) {
      return node.text;
    }
    if (node.content) {
      return node.content.map((child) => this.extractText(child)).join('');
    }
    return '';
  }

  /**
   * Render call sheet title
   */
  private renderTitle(title: string) {
    if (!this.doc) return;

    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(18);
    this.doc.text('CALL SHEET / BREAKDOWN', this.pageWidth / 2, this.currentY, { align: 'center' });
    this.currentY += 24;

    this.doc.setFontSize(14);
    this.doc.text(title, this.pageWidth / 2, this.currentY, { align: 'center' });
    this.currentY += 20;

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`Generated: ${new Date().toLocaleDateString()}`, this.pageWidth / 2, this.currentY, {
      align: 'center',
    });
    this.currentY += 30;

    // Horizontal rule
    this.doc.setDrawColor(0);
    this.doc.setLineWidth(0.5);
    this.doc.line(this.marginLeft, this.currentY, this.pageWidth - this.marginRight, this.currentY);
    this.currentY += 20;
  }

  /**
   * Render summary statistics
   */
  private renderSummary(scenes: iSceneBreakdown[]) {
    if (!this.doc) return;

    const totalPages = scenes.reduce((sum, s) => sum + s.estimatedPages, 0);
    const intScenes = scenes.filter((s) => s.intExt === 'INT').length;
    const extScenes = scenes.filter((s) => s.intExt === 'EXT').length;
    const uniqueLocations = [...new Set(scenes.map((s) => s.location))].length;
    const uniqueCharacters = [...new Set(scenes.flatMap((s) => s.characters))].length;
    const dayScenes = scenes.filter((s) => s.timeOfDay === 'DAY').length;
    const nightScenes = scenes.filter((s) => s.timeOfDay === 'NIGHT').length;

    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(12);
    this.doc.text('SUMMARY', this.marginLeft, this.currentY);
    this.currentY += 16;

    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(10);

    const summaryLines = [
      `Total Scenes: ${scenes.length}`,
      `Estimated Page Count: ${totalPages.toFixed(1)}`,
      `Interior: ${intScenes} | Exterior: ${extScenes}`,
      `Day: ${dayScenes} | Night: ${nightScenes}`,
      `Unique Locations: ${uniqueLocations}`,
      `Speaking Characters: ${uniqueCharacters}`,
    ];

    for (const line of summaryLines) {
      this.doc.text(line, this.marginLeft + 20, this.currentY);
      this.currentY += 14;
    }

    this.currentY += 20;
  }

  /**
   * Render scene breakdown table
   */
  private renderSceneBreakdownTable(scenes: iSceneBreakdown[]) {
    if (!this.doc) return;

    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(12);
    this.doc.text('SCENE BREAKDOWN', this.marginLeft, this.currentY);
    this.currentY += 16;

    // Table headers
    const colWidths = [40, 50, 180, 60, 150];
    const headers = ['Scene', 'INT/EXT', 'Location', 'Time', 'Characters'];
    const tableStartX = this.marginLeft;

    this.doc.setFillColor(230, 230, 230);
    this.doc.rect(tableStartX, this.currentY - 10, this.contentWidth, 14, 'F');

    this.doc.setFontSize(9);
    let xPos = tableStartX + 4;
    for (let i = 0; i < headers.length; i += 1) {
      this.doc.text(headers[i], xPos, this.currentY);
      xPos += colWidths[i];
    }
    this.currentY += 14;

    // Table rows
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(8);

    for (const scene of scenes) {
      // Check if we need a new page
      if (this.currentY + 20 > this.pageHeight - this.marginBottom) {
        this.newPage();
      }

      xPos = tableStartX + 4;

      // Scene number
      this.doc.text(String(scene.sceneNumber), xPos, this.currentY);
      xPos += colWidths[0];

      // INT/EXT
      this.doc.text(scene.intExt, xPos, this.currentY);
      xPos += colWidths[1];

      // Location (truncate if too long)
      const locationText = scene.location.length > 28 ? `${scene.location.substring(0, 25)}...` : scene.location;
      this.doc.text(locationText, xPos, this.currentY);
      xPos += colWidths[2];

      // Time of day
      this.doc.text(scene.timeOfDay || '-', xPos, this.currentY);
      xPos += colWidths[3];

      // Characters (truncate if too many)
      const charsText = `${scene.characters.slice(0, 3).join(', ')}${scene.characters.length > 3 ? '...' : ''}`;
      this.doc.text(charsText || '-', xPos, this.currentY);

      this.currentY += 12;

      // Alternate row background
      if (scene.sceneNumber % 2 === 0) {
        this.doc.setFillColor(248, 248, 248);
        this.doc.rect(tableStartX, this.currentY - 10, this.contentWidth, 12, 'F');
      }
    }

    this.currentY += 20;
  }

  /**
   * Render character index showing which scenes each character appears in
   */
  private renderCharacterIndex(scenes: iSceneBreakdown[]) {
    if (!this.doc) return;

    // Check if we need a new page
    if (this.currentY + 80 > this.pageHeight - this.marginBottom) {
      this.newPage();
    }

    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(12);
    this.doc.text('CHARACTER INDEX', this.marginLeft, this.currentY);
    this.currentY += 16;

    // Build character-to-scenes map
    const charScenes = new Map<string, number[]>();
    for (const scene of scenes) {
      for (const char of scene.characters) {
        const existing = charScenes.get(char) ?? [];
        existing.push(scene.sceneNumber);
        charScenes.set(char, existing);
      }
    }

    // Sort by number of appearances (descending)
    const sortedChars = [...charScenes.entries()].sort((a, b) => b[1].length - a[1].length);

    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(9);

    for (const [charName, sceneNums] of sortedChars) {
      // Check if we need a new page
      if (this.currentY + 14 > this.pageHeight - this.marginBottom) {
        this.newPage();
      }

      const scenesText = sceneNums.join(', ');
      const truncatedScenes = scenesText.length > 60 ? `${scenesText.substring(0, 57)}...` : scenesText;

      this.doc.setFont('helvetica', 'bold');
      this.doc.text(charName, this.marginLeft + 10, this.currentY);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(`(${sceneNums.length}): Scenes ${truncatedScenes}`, this.marginLeft + 120, this.currentY);

      this.currentY += 12;
    }

    this.currentY += 20;
  }

  /**
   * Render location index showing which scenes occur at each location
   */
  private renderLocationIndex(scenes: iSceneBreakdown[]) {
    if (!this.doc) return;

    // Check if we need a new page
    if (this.currentY + 80 > this.pageHeight - this.marginBottom) {
      this.newPage();
    }

    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(12);
    this.doc.text('LOCATION INDEX', this.marginLeft, this.currentY);
    this.currentY += 16;

    // Build location-to-scenes map
    const locationScenes = new Map<string, number[]>();
    for (const scene of scenes) {
      const existing = locationScenes.get(scene.location) ?? [];
      existing.push(scene.sceneNumber);
      locationScenes.set(scene.location, existing);
    }

    // Sort by number of scenes (descending)
    const sortedLocations = [...locationScenes.entries()].sort((a, b) => b[1].length - a[1].length);

    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(9);

    for (const [location, sceneNums] of sortedLocations) {
      // Check if we need a new page
      if (this.currentY + 14 > this.pageHeight - this.marginBottom) {
        this.newPage();
      }

      const locText = location.length > 35 ? `${location.substring(0, 32)}...` : location;
      const scenesText = sceneNums.join(', ');
      const truncatedScenes = scenesText.length > 40 ? `${scenesText.substring(0, 37)}...` : scenesText;

      this.doc.setFont('helvetica', 'bold');
      this.doc.text(locText, this.marginLeft + 10, this.currentY);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(`(${sceneNums.length}): Scenes ${truncatedScenes}`, this.marginLeft + 180, this.currentY);

      this.currentY += 12;
    }
  }

  /**
   * Add page numbers to all pages
   */
  private addPageNumbers() {
    if (!this.doc) return;

    const totalPages = this.pageNumber;
    for (let i = 1; i <= totalPages; i += 1) {
      this.doc.setPage(i);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setFontSize(9);
      this.doc.text(
        `Page ${i} of ${totalPages}`,
        this.pageWidth - this.marginRight,
        this.pageHeight - this.marginBottom + 20,
        { align: 'right' },
      );
    }
  }

  /**
   * Start a new page
   */
  private newPage() {
    if (!this.doc) return;

    this.doc.addPage();
    this.pageNumber += 1;
    this.currentY = this.marginTop;
  }
}
