import type { ScriptDoc } from '@~/db/models/script.model';

interface iTiptapNode {
  type: string;
  content?: iTiptapNode[];
  text?: string;
}

/**
 * Block type formatting for plain text export
 */
const BLOCK_FORMATTERS = {
  'scene-heading': (text: string, sceneNum: number) => `\n${sceneNum}. ${text.toUpperCase()}\n`,
  action: (text: string) => `${text}\n`,
  character: (text: string) => `\n    ${text.toUpperCase()}\n`,
  dialogue: (text: string) => `  ${text}\n`,
  parenthetical: (text: string) => `   (${text})\n`,
  transition: (text: string) => `\n${text.toUpperCase().padStart(60)}\n`,
} as const;

/**
 * Service for generating plain text exports of scripts
 */
export class PlainTextGeneratorService {
  /**
   * Generate plain text from script content
   */
  public async generatePlainText(script: ScriptDoc): Promise<{ data: string; sizeBytes: number }> {
    // Parse content as JSON if it's stored as string
    const content = typeof script.content === 'string' ? JSON.parse(script.content) : script.content;

    if (!content?.content || content.type !== 'doc') {
      return { data: '', sizeBytes: 0 };
    }

    let output = '';
    let sceneNumber = 0;

    // Add title header
    output += `${script.title.toUpperCase()}\n`;
    output += `${'='.repeat(script.title.length)}\n\n`;

    // Process each node
    for (const node of content.content as iTiptapNode[]) {
      const blockType = node.type as keyof typeof BLOCK_FORMATTERS;
      const formatter = BLOCK_FORMATTERS[blockType];

      if (formatter) {
        const text = this.extractText(node).trim();
        if (text) {
          if (blockType === 'scene-heading') {
            sceneNumber += 1;
            output += formatter(text, sceneNumber);
          } else {
            output += (formatter as (text: string) => string)(text);
          }
        }
      }
    }

    // Calculate size in bytes (UTF-8)
    const sizeBytes = new TextEncoder().encode(output).length;

    // Convert to base64 for consistent API response
    const base64Data = Buffer.from(output, 'utf-8').toString('base64');

    return { data: base64Data, sizeBytes };
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
}
