/* eslint-disable no-underscore-dangle */
/* eslint-disable max-classes-per-file */
import { getModelForClass, index, modelOptions, pre, prop } from '@typegoose/typegoose';
import type { DocumentType } from '@typegoose/typegoose';

import { VersionedEntity } from '../base-classes';
import { ObjectIdString } from '../helpers';

@modelOptions({ schemaOptions: { _id: false } })
class EntityLinkClass {
  @prop({ required: true })
  public entityId!: string;

  @prop({ required: true, enum: ['character', 'location', 'prop', 'scene', 'theme', 'storyArc'] })
  public entityType!: 'character' | 'location' | 'prop' | 'scene' | 'theme' | 'storyArc';

  @prop()
  public note?: string;
}

@pre<ResearchClass>('save', function incrementVersion() {
  if (!this.isNew) {
    this._version = (this._version || 1) + 1;
    this._lastModifiedAt = new Date();
  }
})
@index({ seriesId: 1, _version: 1 })
@index({ title: 'text', content: 'text' })
@modelOptions({ schemaOptions: { collection: 'research', timestamps: true } })
class ResearchClass extends VersionedEntity {
  @prop({ default: () => ObjectIdString() })
  public _id!: string;

  @prop({ required: true, index: true })
  public seriesId!: string;

  @prop({ required: true, index: true })
  public title!: string;

  @prop({ default: '' })
  public content!: string;

  @prop({ type: () => [String], default: [] })
  public tags?: string[];

  @prop({ type: () => [EntityLinkClass], default: [] })
  public entityLinks?: EntityLinkClass[];
}

export type ResearchDoc = DocumentType<ResearchClass>;
export const ResearchModel = getModelForClass(ResearchClass);
export default ResearchModel;
