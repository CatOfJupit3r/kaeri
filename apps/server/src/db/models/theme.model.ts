/* eslint-disable max-classes-per-file */
import { getModelForClass, modelOptions, prop } from '@typegoose/typegoose';
import type { DocumentType } from '@typegoose/typegoose';

import { ObjectIdString } from '../helpers';

class CharacterConnectionClass {
  @prop({ required: true })
  public characterId!: string;

  @prop({ required: true })
  public connection!: string;
}

class EvolutionEntryClass {
  @prop({ required: true })
  public scriptId!: string;

  @prop({ required: true })
  public notes!: string;
}

class AppearanceClass {
  @prop({ required: true })
  public scriptId!: string;

  @prop({ required: true })
  public sceneRef!: string;

  @prop()
  public quote?: string;
}

@modelOptions({ schemaOptions: { collection: 'themes', timestamps: true } })
class ThemeClass {
  @prop({ default: () => ObjectIdString() })
  public _id!: string;

  @prop({ required: true, index: true })
  public seriesId!: string;

  @prop({ required: true, index: true })
  public name!: string;

  @prop()
  public description?: string;

  @prop()
  public color?: string;

  @prop({ type: () => [String], default: [] })
  public visualMotifs?: string[];

  @prop({ type: () => [CharacterConnectionClass], default: [] })
  public relatedCharacters?: CharacterConnectionClass[];

  @prop({ type: () => [EvolutionEntryClass], default: [] })
  public evolution?: EvolutionEntryClass[];

  @prop({ type: () => [AppearanceClass], default: [] })
  public appearances?: AppearanceClass[];

  public createdAt!: Date;

  public updatedAt!: Date;
}

export const ThemeModel = getModelForClass(ThemeClass);
export type ThemeDoc = DocumentType<ThemeClass>;
export type CharacterConnectionDoc = CharacterConnectionClass;
export type EvolutionEntryDoc = EvolutionEntryClass;
export type AppearanceDoc = AppearanceClass;
