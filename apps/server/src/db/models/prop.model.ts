/* eslint-disable max-classes-per-file */
import { getModelForClass, modelOptions, prop } from '@typegoose/typegoose';
import type { DocumentType } from '@typegoose/typegoose';

import { RequiredTimeStamps } from '../base-classes';
import { ObjectIdString } from '../helpers';

class AssociationClass {
  @prop()
  public characterId?: string;

  @prop()
  public locationId?: string;

  @prop()
  public scriptId?: string;

  @prop()
  public note?: string;
}

@modelOptions({ schemaOptions: { collection: 'props', timestamps: true } })
class PropClass extends RequiredTimeStamps {
  @prop({ default: () => ObjectIdString() })
  public _id!: string;

  @prop({ required: true, index: true })
  public seriesId!: string;

  @prop({ required: true, index: true })
  public name!: string;

  @prop()
  public description?: string;

  @prop({ type: () => [AssociationClass], default: [] })
  public associations?: AssociationClass[];
}

export const PropModel = getModelForClass(PropClass);
export type PropDoc = DocumentType<PropClass>;
