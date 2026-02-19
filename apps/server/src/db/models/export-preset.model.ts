/* eslint-disable max-classes-per-file */
import { getModelForClass, modelOptions, prop } from '@typegoose/typegoose';
import type { DocumentType } from '@typegoose/typegoose';

import { RequiredTimeStamps } from '../base-classes';
import { ObjectIdString } from '../helpers';

/**
 * Embedded class for block-specific style configuration
 */
class BlockStyleClass {
  @prop({ default: 12 })
  public fontSize!: number;

  @prop({ default: false })
  public bold!: boolean;

  @prop({ default: false })
  public italic!: boolean;

  @prop({ default: false })
  public uppercase!: boolean;

  @prop({ default: 'left' })
  public alignment!: 'left' | 'center' | 'right';

  @prop({ default: 0 })
  public marginLeft!: number;

  @prop({ default: 0 })
  public marginRight!: number;

  @prop({ default: 12 })
  public spaceBefore!: number;

  @prop({ default: 0 })
  public spaceAfter!: number;

  @prop({ default: '#000000' })
  public color!: string;
}

/**
 * Embedded class for page margins
 */
class PageMarginsClass {
  @prop({ default: 1 })
  public top!: number;

  @prop({ default: 1 })
  public bottom!: number;

  @prop({ default: 1.5 })
  public left!: number;

  @prop({ default: 1 })
  public right!: number;
}

/**
 * Embedded class for header/footer configuration
 */
class HeaderFooterClass {
  @prop({ default: true })
  public showPageNumbers!: boolean;

  @prop({ default: 'top-right' })
  public pageNumberPosition!: 'top-right' | 'top-center' | 'bottom-right' | 'bottom-center';

  @prop({ default: false })
  public showTitle!: boolean;

  @prop({ default: false })
  public showDate!: boolean;

  @prop()
  public customHeaderText?: string;

  @prop()
  public customFooterText?: string;
}

/**
 * Export preset model for storing PDF export style configurations
 * Users can create multiple presets with different styling options
 */
@modelOptions({ schemaOptions: { collection: 'export_presets', timestamps: true } })
class ExportPresetClass extends RequiredTimeStamps {
  @prop({ default: () => ObjectIdString() })
  public _id!: string;

  @prop({ required: true, index: true })
  public userId!: string;

  @prop({ required: true })
  public name!: string;

  @prop()
  public description?: string;

  @prop({ default: false })
  public isSystem!: boolean;

  // Page settings
  @prop({ default: 'LETTER' })
  public pageSize!: 'LETTER' | 'A4' | 'LEGAL';

  @prop({ type: () => PageMarginsClass, _id: false, default: () => ({}) })
  public margins!: PageMarginsClass;

  @prop({ type: () => HeaderFooterClass, _id: false, default: () => ({}) })
  public headerFooter!: HeaderFooterClass;

  // Typography
  @prop({ default: 'Courier' })
  public fontFamily!: 'Courier' | 'CourierPrime' | 'Arial' | 'TimesNewRoman' | 'Helvetica';

  @prop({ default: 12 })
  public baseFontSize!: number;

  @prop({ default: 1 })
  public lineHeight!: number;

  // Block-specific styles
  @prop({
    type: () => BlockStyleClass,
    _id: false,
    default: () => ({ bold: true, uppercase: true, spaceBefore: 24, spaceAfter: 12 }),
  })
  public sceneHeadingStyle!: BlockStyleClass;

  @prop({ type: () => BlockStyleClass, _id: false, default: () => ({}) })
  public actionStyle!: BlockStyleClass;

  @prop({ type: () => BlockStyleClass, _id: false, default: () => ({ bold: true, uppercase: true, marginLeft: 2.2 }) })
  public characterStyle!: BlockStyleClass;

  @prop({ type: () => BlockStyleClass, _id: false, default: () => ({ marginLeft: 1, marginRight: 1.5 }) })
  public dialogueStyle!: BlockStyleClass;

  @prop({
    type: () => BlockStyleClass,
    _id: false,
    default: () => ({ italic: true, marginLeft: 1.6, marginRight: 2.1 }),
  })
  public parentheticalStyle!: BlockStyleClass;

  @prop({
    type: () => BlockStyleClass,
    _id: false,
    default: () => ({ bold: true, uppercase: true, alignment: 'right' }),
  })
  public transitionStyle!: BlockStyleClass;
}

export const ExportPresetModel = getModelForClass(ExportPresetClass);
export type ExportPresetDoc = DocumentType<ExportPresetClass>;
