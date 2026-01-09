/* eslint-disable max-classes-per-file */
import { getModelForClass, modelOptions, prop } from '@typegoose/typegoose';
import type { DocumentType } from '@typegoose/typegoose';

import { RequiredTimeStamps } from '../base-classes';
import { ObjectIdString } from '../helpers';

class TimelineLinkClass {
  @prop({ required: true })
  public entityType!: string;

  @prop({ required: true })
  public entityId!: string;
}

@modelOptions({ schemaOptions: { collection: 'timeline_entries', timestamps: true } })
class TimelineEntryClass extends RequiredTimeStamps {
  @prop({ default: () => ObjectIdString() })
  public _id!: string;

  @prop({ required: true, index: true })
  public seriesId!: string;

  @prop({ required: true })
  public label!: string;

  @prop({ index: true })
  public order?: number;

  @prop()
  public timestamp?: string;

  @prop({ type: () => [TimelineLinkClass], default: [] })
  public links?: TimelineLinkClass[];
}

export const TimelineEntryModel = getModelForClass(TimelineEntryClass);
export type TimelineEntryDoc = DocumentType<TimelineEntryClass>;
