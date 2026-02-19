import { jsPDF } from 'jspdf';

import type { BlockStyle, ExportPreset, ExportScriptPdfOptions } from '@kaeri/shared/schemas/export-preset.schema';

import type { ScriptDoc } from '@~/db/models/script.model';

/**
 * Page dimensions in points (72 points = 1 inch)
 */
const PAGE_DIMENSIONS = {
  LETTER: { width: 612, height: 792 },
  A4: { width: 595.28, height: 841.89 },
  LEGAL: { width: 612, height: 1008 },
} as const;

/**
 * Tiptap block type to style mapping
 */
const BLOCK_TYPE_TO_STYLE_KEY = {
  'scene-heading': 'sceneHeadingStyle',
  action: 'actionStyle',
  character: 'characterStyle',
  dialogue: 'dialogueStyle',
  parenthetical: 'parentheticalStyle',
  transition: 'transitionStyle',
} as const;

type TiptapBlockType = keyof typeof BLOCK_TYPE_TO_STYLE_KEY;

interface iTiptapNode {
  type: string;
  content?: iTiptapNode[];
  text?: string;
  marks?: Array<{ type: string }>;
}

interface iTiptapDoc {
  type: 'doc';
  content: iTiptapNode[];
}

/**
 * Service for generating PDF exports of scripts
 */
export class PdfGeneratorService {
  private doc: jsPDF | null = null;

  private currentY = 0;

  private pageNumber = 1;

  private preset: ExportPreset | null = null;

  private pageWidth = 0;

  private pageHeight = 0;

  private contentWidth = 0;

  private marginLeft = 0;

  private marginRight = 0;

  private marginTop = 0;

  private marginBottom = 0;

  private sceneNumber = 0;

  /**
   * Generate PDF from script content using preset styling
   */
  public async generatePdf(
    script: ScriptDoc,
    preset: ExportPreset,
    options: ExportScriptPdfOptions,
  ): Promise<{ data: string; sizeBytes: number }> {
    this.preset = preset;
    this.sceneNumber = 0;

    // Initialize page dimensions
    const pageDim = PAGE_DIMENSIONS[preset.pageSize];
    this.pageWidth = pageDim.width;
    this.pageHeight = pageDim.height;
    this.marginLeft = preset.margins.left * 72;
    this.marginRight = preset.margins.right * 72;
    this.marginTop = preset.margins.top * 72;
    this.marginBottom = preset.margins.bottom * 72;
    this.contentWidth = this.pageWidth - this.marginLeft - this.marginRight;

    // Create PDF document
    // eslint-disable-next-line new-cap
    this.doc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: [this.pageWidth, this.pageHeight],
    });

    // Set default font
    this.setFont(preset.fontFamily, false, false);
    this.doc.setFontSize(preset.baseFontSize);

    // Start position
    this.currentY = this.marginTop;
    this.pageNumber = 1;

    // Parse and render content
    const content = this.parseContent(script.content);
    if (content) {
      this.renderDocument(content, options);
    } else {
      // Empty script - add placeholder
      this.doc.setFontSize(14);
      this.doc.text('(empty script)', this.marginLeft, this.currentY);
    }

    // Add header/footer if enabled
    this.addHeadersFooters(script.title, options);

    // Add draft watermark if requested
    if (options.includeDraftWatermark) {
      this.addWatermark(options.watermarkText ?? 'DRAFT');
    }

    // Get output
    const pdfOutput = this.doc.output('datauristring');
    // Remove data URI prefix to get just base64
    const base64Data = pdfOutput.split(',')[1] ?? pdfOutput;
    const sizeBytes = Math.round((base64Data.length * 3) / 4);

    return { data: base64Data, sizeBytes };
  }

  private parseContent(content: string): iTiptapDoc | null {
    if (!content || content.trim() === '') {
      return null;
    }

    try {
      return JSON.parse(content) as iTiptapDoc;
    } catch {
      // Content is plain text, convert to simple action blocks
      return {
        type: 'doc',
        content: content.split('\n').map((line) => ({
          type: 'action',
          content: [{ type: 'text', text: line }],
        })),
      };
    }
  }

  private renderDocument(doc: iTiptapDoc, options: ExportScriptPdfOptions) {
    if (!doc.content) return;

    for (const node of doc.content) {
      this.renderNode(node, options);
    }
  }

  private renderNode(node: iTiptapNode, options: ExportScriptPdfOptions) {
    const blockType = node.type as TiptapBlockType;
    const styleKey = BLOCK_TYPE_TO_STYLE_KEY[blockType];

    if (!styleKey || !this.preset) {
      // Unknown block type, skip
      return;
    }

    const style = this.preset[styleKey] as BlockStyle;
    const text = this.extractText(node);

    if (!text.trim()) return;

    // Check for scene heading to increment scene number
    if (blockType === 'scene-heading' && options.includeSceneNumbers) {
      this.sceneNumber += 1;
    }

    // Apply space before
    this.currentY += style.spaceBefore;

    // Check if we need a new page
    const lineHeight = style.fontSize * (this.preset.lineHeight || 1) * 1.2;
    const estimatedLines = this.estimateLines(text, style);
    const requiredHeight = estimatedLines * lineHeight;

    if (this.currentY + requiredHeight > this.pageHeight - this.marginBottom) {
      this.newPage();
    }

    // Render the block
    this.renderBlock(text, style, blockType, options);

    // Apply space after
    this.currentY += style.spaceAfter;
  }

  private renderBlock(text: string, style: BlockStyle, blockType: TiptapBlockType, options: ExportScriptPdfOptions) {
    if (!this.doc || !this.preset) return;

    // Set font style
    this.setFont(this.preset.fontFamily, style.bold, style.italic);
    this.doc.setFontSize(style.fontSize);

    // Set text color
    const color = this.hexToRgb(style.color);
    this.doc.setTextColor(color.r, color.g, color.b);

    // Calculate x position and width based on alignment and margins
    const blockMarginLeft = style.marginLeft * 72;
    const blockMarginRight = style.marginRight * 72;
    const blockWidth = this.contentWidth - blockMarginLeft - blockMarginRight;
    let xPos = this.marginLeft + blockMarginLeft;

    // Transform text if uppercase
    let displayText = style.uppercase ? text.toUpperCase() : text;

    // Add scene number for scene headings
    if (blockType === 'scene-heading' && options.includeSceneNumbers) {
      displayText = `${this.sceneNumber}. ${displayText}`;
    }

    // Handle alignment
    const align = style.alignment;
    if (align === 'center') {
      xPos = this.marginLeft + blockMarginLeft + blockWidth / 2;
    } else if (align === 'right') {
      xPos = this.pageWidth - this.marginRight - blockMarginRight;
    }

    // Split text for wrapping
    const lineHeight = style.fontSize * (this.preset.lineHeight || 1) * 1.2;
    const lines: string[] = this.doc.splitTextToSize(displayText, blockWidth);

    for (const line of lines) {
      if (this.currentY + lineHeight > this.pageHeight - this.marginBottom) {
        this.newPage();
      }

      let textAlign: 'left' | 'center' | 'right' = 'left';
      if (align === 'center') {
        textAlign = 'center';
      } else if (align === 'right') {
        textAlign = 'right';
      }

      this.doc.text(line, xPos, this.currentY, { align: textAlign });

      this.currentY += lineHeight;
    }
  }

  private extractText(node: iTiptapNode): string {
    if (node.text) {
      return node.text;
    }

    if (node.content) {
      return node.content.map((child) => this.extractText(child)).join('');
    }

    return '';
  }

  private estimateLines(text: string, style: BlockStyle): number {
    if (!this.doc) return 1;

    const blockMarginLeft = style.marginLeft * 72;
    const blockMarginRight = style.marginRight * 72;
    const blockWidth = this.contentWidth - blockMarginLeft - blockMarginRight;

    const lines: string[] = this.doc.splitTextToSize(text, blockWidth);
    return lines.length;
  }

  private newPage() {
    if (!this.doc) return;

    this.doc.addPage();
    this.pageNumber += 1;
    this.currentY = this.marginTop;
  }

  private setFont(family: string, bold: boolean, italic: boolean) {
    if (!this.doc) return;

    // jsPDF font mapping - using built-in fonts
    let fontName = 'courier';
    let fontStyle = 'normal';

    if (family === 'Courier' || family === 'CourierPrime') {
      fontName = 'courier';
    } else if (family === 'Arial' || family === 'Helvetica') {
      fontName = 'helvetica';
    } else if (family === 'TimesNewRoman') {
      fontName = 'times';
    }

    if (bold && italic) {
      fontStyle = 'bolditalic';
    } else if (bold) {
      fontStyle = 'bold';
    } else if (italic) {
      fontStyle = 'italic';
    }

    this.doc.setFont(fontName, fontStyle);
  }

  private addHeadersFooters(title: string, _options: ExportScriptPdfOptions) {
    if (!this.doc || !this.preset) return;

    const { headerFooter } = this.preset;
    const totalPages = this.pageNumber;

    for (let i = 1; i <= totalPages; i += 1) {
      this.doc.setPage(i);
      this.doc.setFontSize(10);
      this.setFont(this.preset.fontFamily, false, false);
      this.doc.setTextColor(0, 0, 0);

      // Page numbers
      if (headerFooter.showPageNumbers && i > 1) {
        // Skip page number on first page (title page convention)
        const pageText = `${i}.`;
        const pos = headerFooter.pageNumberPosition;

        if (pos === 'top-right') {
          this.doc.text(pageText, this.pageWidth - this.marginRight, this.marginTop - 20, {
            align: 'right',
          });
        } else if (pos === 'top-center') {
          this.doc.text(pageText, this.pageWidth / 2, this.marginTop - 20, { align: 'center' });
        } else if (pos === 'bottom-right') {
          this.doc.text(pageText, this.pageWidth - this.marginRight, this.pageHeight - this.marginBottom + 30, {
            align: 'right',
          });
        } else if (pos === 'bottom-center') {
          this.doc.text(pageText, this.pageWidth / 2, this.pageHeight - this.marginBottom + 30, {
            align: 'center',
          });
        }
      }

      // Custom header text
      if (headerFooter.customHeaderText) {
        this.doc.text(headerFooter.customHeaderText, this.marginLeft, this.marginTop - 20);
      }

      // Title in header
      if (headerFooter.showTitle && i > 1) {
        this.doc.text(title, this.pageWidth / 2, this.marginTop - 20, { align: 'center' });
      }

      // Custom footer text
      if (headerFooter.customFooterText) {
        this.doc.text(headerFooter.customFooterText, this.marginLeft, this.pageHeight - this.marginBottom + 30);
      }

      // Date in footer
      if (headerFooter.showDate) {
        const dateStr = new Date().toLocaleDateString();
        this.doc.text(dateStr, this.pageWidth - this.marginRight, this.pageHeight - this.marginBottom + 30, {
          align: 'right',
        });
      }
    }
  }

  private addWatermark(text: string) {
    if (!this.doc) return;

    const totalPages = this.pageNumber;

    for (let i = 1; i <= totalPages; i += 1) {
      this.doc.setPage(i);
      this.doc.setFontSize(60);
      this.doc.setTextColor(200, 200, 200);
      this.setFont('Helvetica', true, false);

      // Diagonal watermark across center of page
      this.doc.text(text, this.pageWidth / 2, this.pageHeight / 2, {
        align: 'center',
        angle: 45,
      });
    }
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
      return {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      };
    }
    return { r: 0, g: 0, b: 0 };
  }
}
