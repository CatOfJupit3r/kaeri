import { getModelForClass, modelOptions, prop } from '@typegoose/typegoose';
import type { DocumentType } from '@typegoose/typegoose';

import { ObjectIdString } from '../helpers';

@modelOptions({ schemaOptions: { collection: 'scripts', timestamps: true } })
class ScriptClass {
  @prop({ default: () => ObjectIdString() })
  public _id!: string;

  @prop({ required: true, index: true })
  public seriesId!: string;

  @prop({ required: true })
  public title!: string;

  @prop({ type: () => [String], default: [] })
  public authors?: string[];

  @prop()
  public genre?: string;

  @prop()
  public logline?: string;

  @prop()
  public coverUrl?: string;

  @prop({ default: '' })
  public content!: string;

  @prop({ default: 1 })
  public contentVersion!: number;

  @prop({ default: () => new Date() })
  public lastEditedAt!: Date;

  public createdAt!: Date;

  public updatedAt!: Date;
}

export const ScriptModel = getModelForClass(ScriptClass);
export type ScriptDoc = DocumentType<ScriptClass>;
