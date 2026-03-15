/* eslint-disable no-underscore-dangle */
/* eslint-disable max-classes-per-file */
import { getModelForClass, index, modelOptions, pre, prop } from '@typegoose/typegoose';
import type { DocumentType } from '@typegoose/typegoose';

import { VersionedEntity } from '../base-classes';
import { ObjectIdString } from '../helpers';

class TimelineLinkClass {
  @prop({ required: true })
  public entityType!: string;

  @prop({ required: true })
  public entityId!: string;
}

@pre<TimelineEntryClass>('save', function incrementVersion() {
  if (!this.isNew) {
    this._version = (this._version || 1) + 1;
    this._lastModifiedAt = new Date();
  }
})
@index({ seriesId: 1, _version: 1 })
@modelOptions({ schemaOptions: { collection: 'timeline_entries', timestamps: true } })
class TimelineEntryClass extends VersionedEntity {
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
