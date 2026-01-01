import { getModelForClass, modelOptions, prop } from '@typegoose/typegoose';
import type { DocumentType } from '@typegoose/typegoose';

import { ObjectIdString } from '../helpers';

@modelOptions({ schemaOptions: { collection: 'audit_entries', timestamps: true } })
class AuditEntryClass {
  @prop({ default: () => ObjectIdString() })
  public _id!: string;

  @prop({ required: true, index: true })
  public seriesId!: string;

  @prop({ required: true, index: true })
  public entityType!: string;

  @prop({ required: true, index: true })
  public entityId!: string;

  @prop({ required: true, enum: ['CREATE', 'UPDATE', 'DELETE'] })
  public action!: 'CREATE' | 'UPDATE' | 'DELETE';

  @prop({ required: true })
  public actorId!: string;

  @prop({ required: true, index: true, default: () => new Date() })
  public timestamp!: Date;

  @prop({ type: () => Object })
  public before?: Record<string, unknown>;

  @prop({ type: () => Object })
  public after?: Record<string, unknown>;

  public createdAt!: Date;

  public updatedAt!: Date;
}

export const AuditEntryModel = getModelForClass(AuditEntryClass);
export type AuditEntryDoc = DocumentType<AuditEntryClass>;
