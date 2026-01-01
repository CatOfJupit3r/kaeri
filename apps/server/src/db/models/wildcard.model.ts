import { getModelForClass, modelOptions, prop } from '@typegoose/typegoose';
import type { DocumentType } from '@typegoose/typegoose';

import { ObjectIdString } from '../helpers';

@modelOptions({ schemaOptions: { collection: 'wildcards', timestamps: true } })
class WildCardClass {
  @prop({ default: () => ObjectIdString() })
  public _id!: string;

  @prop({ required: true, index: true })
  public seriesId!: string;

  @prop({ required: true, index: true })
  public title!: string;

  @prop()
  public body?: string;

  @prop({ index: true })
  public tag?: string;

  public createdAt!: Date;

  public updatedAt!: Date;
}

export const WildCardModel = getModelForClass(WildCardClass);
export type WildCardDoc = DocumentType<WildCardClass>;
