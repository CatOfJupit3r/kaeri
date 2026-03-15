/**
 * Features contracts - canvas, continuity, export, theme
 */
import canvasContract from '../canvas.contract';
import continuityContract from '../continuity.contract';
import exportContract from '../export.contract';
import themeContract from '../theme.contract';

export const FEATURES_CONTRACT = {
  canvas: canvasContract,
  continuity: continuityContract,
  export: exportContract,
  theme: themeContract,
};

export type FeaturesContract = typeof FEATURES_CONTRACT;
