/* eslint-disable max-classes-per-file */
import { getModelForClass, modelOptions, prop } from '@typegoose/typegoose';
import type { DocumentType } from '@typegoose/typegoose';

import { RequiredTimeStamps } from '../base-classes';
import { ObjectIdString } from '../helpers';

class AppearanceClass {
  @prop({ required: true })
  public scriptId!: string;

  @prop({ required: true })
  public sceneRef!: string;

  @prop()
  public locationId?: string;
}

@modelOptions({ schemaOptions: { collection: 'locations', timestamps: true } })
class LocationClass extends RequiredTimeStamps {
  @prop({ default: () => ObjectIdString() })
  public _id!: string;

  @prop({ required: true, index: true })
  public seriesId!: string;

  @prop({ required: true, index: true })
  public name!: string;

  @prop()
  public description?: string;

  @prop({ type: () => [String], default: [] })
  public tags?: string[];

  @prop({ type: () => [AppearanceClass], default: [] })
  public appearances?: AppearanceClass[];
}

export const LocationModel = getModelForClass(LocationClass);
export type LocationDoc = DocumentType<LocationClass>;
