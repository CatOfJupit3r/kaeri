import { getModelForClass, modelOptions, prop } from '@typegoose/typegoose';
import type { DocumentType } from '@typegoose/typegoose';

import type { SeriesType } from '@kaeri/shared/contract/series.contract';
import { SERIES_TYPES } from '@kaeri/shared/contract/series.contract';

import { RequiredTimeStamps } from '../base-classes';
import { ObjectIdString } from '../helpers';

@modelOptions({ schemaOptions: { collection: 'series', timestamps: true } })
class SeriesClass extends RequiredTimeStamps {
  @prop({ default: () => ObjectIdString() })
  public _id!: string;

  @prop({ required: true })
  public title!: string;

  @prop({ enum: Object.values(SERIES_TYPES), default: SERIES_TYPES.standalone })
  public type!: SeriesType;

  @prop()
  public genre?: string;

  @prop()
  public logline?: string;

  @prop()
  public coverUrl?: string;

  @prop({ default: () => new Date() })
  public lastEditedAt!: Date;

  /**
   * Workspace this series belongs to.
   * Every series must belong to exactly one workspace.
   */
  @prop({ required: true, index: true })
  public workspaceId!: string;
}

export const SeriesModel = getModelForClass(SeriesClass);
export type SeriesDoc = DocumentType<SeriesClass>;
