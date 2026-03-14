/* eslint-disable max-classes-per-file */
import { getModelForClass, index, modelOptions, prop } from '@typegoose/typegoose';
import type { DocumentType } from '@typegoose/typegoose';

import { RequiredTimeStamps } from '../base-classes';
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

@index({ title: 'text', content: 'text' })
@modelOptions({ schemaOptions: { collection: 'research', timestamps: true } })
class ResearchClass extends RequiredTimeStamps {
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
