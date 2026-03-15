/* eslint-disable no-underscore-dangle */
/* eslint-disable max-classes-per-file */
import { getModelForClass, index, modelOptions, pre, prop } from '@typegoose/typegoose';
import type { DocumentType } from '@typegoose/typegoose';

import { VersionedEntity } from '../base-classes';
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

@pre<PropClass>('save', function incrementVersion() {
  if (!this.isNew) {
    this._version = (this._version || 1) + 1;
    this._lastModifiedAt = new Date();
  }
})
@index({ seriesId: 1, _version: 1 })
@modelOptions({ schemaOptions: { collection: 'props', timestamps: true } })
class PropClass extends VersionedEntity {
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
