/* eslint-disable no-underscore-dangle */
import { getModelForClass, index, modelOptions, pre, prop } from '@typegoose/typegoose';
import type { DocumentType } from '@typegoose/typegoose';

import { VersionedEntity } from '../base-classes';
import { ObjectIdString } from '../helpers';

@pre<WildCardClass>('save', function incrementVersion() {
  if (!this.isNew) {
    this._version = (this._version || 1) + 1;
    this._lastModifiedAt = new Date();
  }
})
@index({ seriesId: 1, _version: 1 })
@modelOptions({ schemaOptions: { collection: 'wildcards', timestamps: true } })
class WildCardClass extends VersionedEntity {
  @prop({ default: () => ObjectIdString() })
  public _id!: string;

  @prop({ required: true, index: true })
  public seriesId!: string;

  @prop({ required: true, index: true })
  public title!: string;

  @prop()
  public body?: string;

  @prop({ index: true })
  public tag?: string;
}

export const WildCardModel = getModelForClass(WildCardClass);
export type WildCardDoc = DocumentType<WildCardClass>;
