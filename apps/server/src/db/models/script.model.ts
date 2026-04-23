/* eslint-disable no-underscore-dangle */
import { getModelForClass, modelOptions, pre, prop } from '@typegoose/typegoose';
import type { DocumentType } from '@typegoose/typegoose';

import { VersionedEntity } from '../base-classes';
import { ObjectIdString } from '../helpers';

@pre<ScriptClass>('save', function incrementVersion() {
  if (!this.isNew) {
    this._version = (this._version || 1) + 1;
    this._lastModifiedAt = new Date();
  }
})
@modelOptions({ schemaOptions: { collection: 'scripts', timestamps: true } })
class ScriptClass extends VersionedEntity {
  @prop({ default: () => ObjectIdString() })
  public _id!: string;

  @prop({ required: true, index: true })
  public seriesId!: string;

  @prop({ required: true })
  public title!: string;

  @prop({ type: () => [String], default: [] })
  public authors?: string[];

  @prop()
  public genre?: string;

  @prop()
  public logline?: string;

  @prop()
  public coverUrl?: string;

  @prop({ default: '' })
  public content!: string;

  @prop({ default: () => new Date() })
  public lastEditedAt!: Date;
}

export const ScriptModel = getModelForClass(ScriptClass);
export type ScriptDoc = DocumentType<ScriptClass>;
