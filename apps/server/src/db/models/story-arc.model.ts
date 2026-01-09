/* eslint-disable max-classes-per-file */
import { getModelForClass, modelOptions, prop } from '@typegoose/typegoose';
import type { DocumentType } from '@typegoose/typegoose';

import { ObjectIdString } from '../helpers';

class ArcBeatClass {
  @prop({ default: () => ObjectIdString() })
  public id!: string;

  @prop({ required: true })
  public order!: number;

  @prop({ required: true })
  public description!: string;

  @prop()
  public scriptId?: string;

  @prop()
  public sceneId?: string;
}

class ArcCharacterRoleClass {
  @prop({ required: true })
  public characterId!: string;

  @prop({ required: true })
  public role!: string;
}

@modelOptions({ schemaOptions: { collection: 'story-arcs', timestamps: true } })
class StoryArcClass {
  @prop({ default: () => ObjectIdString() })
  public _id!: string;

  @prop({ required: true, index: true })
  public seriesId!: string;

  @prop({ required: true })
  public name!: string;

  @prop({ default: '' })
  public description!: string;

  @prop({ required: true, enum: ['planned', 'in_progress', 'completed', 'abandoned'], index: true })
  public status!: 'planned' | 'in_progress' | 'completed' | 'abandoned';

  @prop()
  public startScriptId?: string;

  @prop()
  public endScriptId?: string;

  @prop({ type: () => [ArcBeatClass], default: [] })
  public keyBeats!: ArcBeatClass[];

  @prop()
  public resolution?: string;

  @prop({ type: () => [ArcCharacterRoleClass], default: [] })
  public characters!: ArcCharacterRoleClass[];

  @prop({ type: () => [String], default: [] })
  public themeIds!: string[];

  public createdAt!: Date;

  public updatedAt!: Date;
}

export const StoryArcModel = getModelForClass(StoryArcClass);
export type StoryArcDoc = DocumentType<StoryArcClass>;
