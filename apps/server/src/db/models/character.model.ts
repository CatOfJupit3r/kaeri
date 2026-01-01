/* eslint-disable max-classes-per-file */
import { getModelForClass, modelOptions, prop } from '@typegoose/typegoose';
import type { DocumentType } from '@typegoose/typegoose';

import { ObjectIdString } from '../helpers';

// Nested classes for embedded documents
class RelationshipClass {
  @prop({ required: true })
  public targetId!: string;

  @prop({ required: true })
  public type!: string;

  @prop()
  public note?: string;
}

class VariationClass {
  @prop({ required: true })
  public scriptId!: string;

  @prop({ required: true })
  public label!: string;

  @prop()
  public notes?: string;
}

class AppearanceClass {
  @prop({ required: true })
  public scriptId!: string;

  @prop({ required: true })
  public sceneRef!: string;

  @prop()
  public locationId?: string;
}

@modelOptions({ schemaOptions: { collection: 'characters', timestamps: true } })
class CharacterClass {
  @prop({ default: () => ObjectIdString() })
  public _id!: string;

  @prop({ required: true, index: true })
  public seriesId!: string;

  @prop({ required: true, index: true })
  public name!: string;

  @prop()
  public description?: string;

  @prop({ type: () => [String], default: [] })
  public traits?: string[];

  @prop({ type: () => [RelationshipClass], default: [] })
  public relationships?: RelationshipClass[];

  @prop({ type: () => [VariationClass], default: [] })
  public variations?: VariationClass[];

  @prop({ type: () => [AppearanceClass], default: [] })
  public appearances?: AppearanceClass[];

  @prop()
  public avatarUrl?: string;

  public createdAt!: Date;

  public updatedAt!: Date;
}

export const CharacterModel = getModelForClass(CharacterClass);
export type CharacterDoc = DocumentType<CharacterClass>;
export type RelationshipDoc = RelationshipClass;
export type VariationDoc = VariationClass;
export type AppearanceDoc = AppearanceClass;
