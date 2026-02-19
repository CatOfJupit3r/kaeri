import z from 'zod';

/**
 * Page size options for PDF export
 */
export const pageSizeSchema = z.enum(['LETTER', 'A4', 'LEGAL']);
export const PAGE_SIZES = pageSizeSchema.enum;
export type PageSize = z.infer<typeof pageSizeSchema>;

/**
 * Font family options for PDF export
 */
export const fontFamilySchema = z.enum(['Courier', 'CourierPrime', 'Arial', 'TimesNewRoman', 'Helvetica']);
export const FONT_FAMILIES = fontFamilySchema.enum;
export type FontFamily = z.infer<typeof fontFamilySchema>;

/**
 * Block type style configuration for PDF export
 * Defines how each screenplay block type should be formatted
 */
export const blockStyleSchema = z.object({
  /** Font size in points */
  fontSize: z.number().min(8).max(24).default(12),
  /** Whether text should be bold */
  bold: z.boolean().default(false),
  /** Whether text should be italic */
  italic: z.boolean().default(false),
  /** Whether text should be uppercase */
  uppercase: z.boolean().default(false),
  /** Text alignment */
  alignment: z.enum(['left', 'center', 'right']).default('left'),
  /** Left margin in inches (added to page margin) */
  marginLeft: z.number().min(0).max(4).default(0),
  /** Right margin in inches (added to page margin) */
  marginRight: z.number().min(0).max(4).default(0),
  /** Space before block in points */
  spaceBefore: z.number().min(0).max(72).default(12),
  /** Space after block in points */
  spaceAfter: z.number().min(0).max(72).default(0),
  /** Text color in hex format */
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .default('#000000'),
});

export type BlockStyle = z.infer<typeof blockStyleSchema>;

/**
 * Page margin configuration in inches
 */
export const pageMarginsSchema = z.object({
  top: z.number().min(0.25).max(3).default(1),
  bottom: z.number().min(0.25).max(3).default(1),
  left: z.number().min(0.25).max(3).default(1.5),
  right: z.number().min(0.25).max(3).default(1),
});

export type PageMargins = z.infer<typeof pageMarginsSchema>;

/**
 * Header/footer configuration for PDF export
 */
export const headerFooterSchema = z.object({
  /** Whether to show page numbers */
  showPageNumbers: z.boolean().default(true),
  /** Position of page numbers */
  pageNumberPosition: z.enum(['top-right', 'top-center', 'bottom-right', 'bottom-center']).default('top-right'),
  /** Whether to show script title in header */
  showTitle: z.boolean().default(false),
  /** Whether to include date in header/footer */
  showDate: z.boolean().default(false),
  /** Custom header text (optional) */
  customHeaderText: z.string().max(100).optional(),
  /** Custom footer text (optional) */
  customFooterText: z.string().max(100).optional(),
});

export type HeaderFooter = z.infer<typeof headerFooterSchema>;

/**
 * Full export preset configuration
 * Defines all styling options for PDF screenplay export
 */
export const exportPresetSchema = z.object({
  _id: z.string(),
  /** User who owns this preset */
  userId: z.string(),
  /** Display name for the preset */
  name: z.string().min(1).max(100),
  /** Optional description */
  description: z.string().max(500).optional(),
  /** Whether this is a default/system preset (read-only for users) */
  isSystem: z.boolean().default(false),

  // Page settings
  pageSize: pageSizeSchema.default('LETTER'),
  margins: pageMarginsSchema.default({ top: 1, bottom: 1, left: 1.5, right: 1 }),
  headerFooter: headerFooterSchema.default({
    showPageNumbers: true,
    pageNumberPosition: 'top-right',
    showTitle: false,
    showDate: false,
  }),

  // Typography
  fontFamily: fontFamilySchema.default('Courier'),
  /** Base font size in points */
  baseFontSize: z.number().min(8).max(18).default(12),
  /** Line height multiplier */
  lineHeight: z.number().min(1).max(3).default(1),

  // Block-specific styles (overrides base font settings)
  sceneHeadingStyle: blockStyleSchema.default({
    fontSize: 12,
    bold: true,
    uppercase: true,
    alignment: 'left',
    marginLeft: 0,
    marginRight: 0,
    spaceBefore: 24,
    spaceAfter: 12,
    color: '#000000',
    italic: false,
  }),
  actionStyle: blockStyleSchema.default({
    fontSize: 12,
    bold: false,
    uppercase: false,
    alignment: 'left',
    marginLeft: 0,
    marginRight: 0,
    spaceBefore: 12,
    spaceAfter: 0,
    color: '#000000',
    italic: false,
  }),
  characterStyle: blockStyleSchema.default({
    fontSize: 12,
    bold: true,
    uppercase: true,
    alignment: 'left',
    marginLeft: 2.2,
    marginRight: 0,
    spaceBefore: 12,
    spaceAfter: 0,
    color: '#000000',
    italic: false,
  }),
  dialogueStyle: blockStyleSchema.default({
    fontSize: 12,
    bold: false,
    uppercase: false,
    alignment: 'left',
    marginLeft: 1,
    marginRight: 1.5,
    spaceBefore: 0,
    spaceAfter: 0,
    color: '#000000',
    italic: false,
  }),
  parentheticalStyle: blockStyleSchema.default({
    fontSize: 12,
    bold: false,
    uppercase: false,
    italic: true,
    alignment: 'left',
    marginLeft: 1.6,
    marginRight: 2.1,
    spaceBefore: 0,
    spaceAfter: 0,
    color: '#000000',
  }),
  transitionStyle: blockStyleSchema.default({
    fontSize: 12,
    bold: true,
    uppercase: true,
    alignment: 'right',
    marginLeft: 0,
    marginRight: 0,
    spaceBefore: 12,
    spaceAfter: 12,
    color: '#000000',
    italic: false,
  }),

  // Metadata
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ExportPreset = z.infer<typeof exportPresetSchema>;

/**
 * Input schema for creating a new export preset
 */
export const createExportPresetInputSchema = exportPresetSchema.omit({
  _id: true,
  userId: true,
  isSystem: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateExportPresetInput = z.infer<typeof createExportPresetInputSchema>;

/**
 * Input schema for updating an export preset
 */
export const updateExportPresetInputSchema = createExportPresetInputSchema.partial().extend({
  presetId: z.string(),
});

export type UpdateExportPresetInput = z.infer<typeof updateExportPresetInputSchema>;

/**
 * Options passed when exporting a script to PDF
 */
export const exportScriptPdfOptionsSchema = z.object({
  scriptId: z.string(),
  /** Preset ID to use, or use inline options */
  presetId: z.string().optional(),
  /** Include line numbers on each page */
  includeLineNumbers: z.boolean().default(false),
  /** Include scene numbers */
  includeSceneNumbers: z.boolean().default(true),
  /** Mark as draft with watermark */
  includeDraftWatermark: z.boolean().default(false),
  /** Custom watermark text */
  watermarkText: z.string().max(50).optional(),
});

export type ExportScriptPdfOptions = z.infer<typeof exportScriptPdfOptionsSchema>;
