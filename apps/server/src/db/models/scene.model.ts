/* eslint-disable max-classes-per-file */
import { getModelForClass, modelOptions, prop } from '@typegoose/typegoose';
import type { DocumentType } from '@typegoose/typegoose';

import { RequiredTimeStamps } from '../base-classes';
import { ObjectIdString } from '../helpers';

class SceneBeatClass {
  @prop({ required: true })
  public order!: number;

  @prop({ required: true })
  public description!: string;
}

@modelOptions({
  schemaOptions: {
    collection: 'scenes',
    timestamps: true,
  },
})
class SceneClass extends RequiredTimeStamps {
  @prop({ default: () => ObjectIdString() })
  public _id!: string;

  @prop({ required: true, index: true })
  public seriesId!: string;

  @prop({ required: true, index: true })
  public scriptId!: string;

  @prop({ required: true })
  public sceneNumber!: number;

  @prop({ required: true })
  public heading!: string;

  @prop({ index: true })
  public locationId?: string;

  @prop()
  public timeOfDay?: string;

  @prop()
  public duration?: string;

  @prop()
  public emotionalTone?: string;

  @prop()
  public conflict?: string;

  @prop({ type: () => [SceneBeatClass], default: [] })
  public beats!: SceneBeatClass[];

  @prop({ type: () => [String], default: [] })
  public characterIds!: string[];

  @prop({ type: () => [String], default: [] })
  public propIds!: string[];

  @prop()
  public lighting?: string;

  @prop()
  public sound?: string;

  @prop()
  public camera?: string;

  @prop()
  public storyNotes?: string;

  @prop()
  public storyboardUrl?: string;

  @prop({ default: () => new Date() })
  public lastEditedAt!: Date;
}

export const SceneModel = getModelForClass(SceneClass);
export type SceneDoc = DocumentType<SceneClass>;

// Create compound unique index for (scriptId, sceneNumber) after model is created
SceneModel.schema.index({ scriptId: 1, sceneNumber: 1 }, { unique: true });
