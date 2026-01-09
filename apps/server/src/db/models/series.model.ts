import { getModelForClass, modelOptions, prop } from '@typegoose/typegoose';
import type { DocumentType } from '@typegoose/typegoose';

import { RequiredTimeStamps } from '../base-classes';
import { ObjectIdString } from '../helpers';

@modelOptions({ schemaOptions: { collection: 'series', timestamps: true } })
class SeriesClass extends RequiredTimeStamps {
  @prop({ default: () => ObjectIdString() })
  public _id!: string;

  @prop({ required: true })
  public title!: string;

  @prop()
  public genre?: string;

  @prop()
  public logline?: string;

  @prop()
  public coverUrl?: string;

  @prop({ default: () => new Date() })
  public lastEditedAt!: Date;

  // Future-ready fields for multi-user support
  @prop()
  public workspaceId?: string;

  @prop({ type: () => [String] })
  public roles?: string[];
}

export const SeriesModel = getModelForClass(SeriesClass);
export type SeriesDoc = DocumentType<SeriesClass>;
