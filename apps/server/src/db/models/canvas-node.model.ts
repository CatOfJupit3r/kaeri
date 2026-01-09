/* eslint-disable max-classes-per-file */
import { getModelForClass, modelOptions, prop } from '@typegoose/typegoose';
import type { DocumentType } from '@typegoose/typegoose';

import { RequiredTimeStamps } from '../base-classes';
import { ObjectIdString } from '../helpers';

class PositionClass {
  @prop({ required: true })
  public x!: number;

  @prop({ required: true })
  public y!: number;
}

@modelOptions({ schemaOptions: { collection: 'canvas_nodes', timestamps: true } })
class CanvasNodeClass extends RequiredTimeStamps {
  @prop({ default: () => ObjectIdString() })
  public _id!: string;

  @prop({ required: true, index: true })
  public seriesId!: string;

  @prop({ required: true, enum: ['text', 'shape', 'note'] })
  public type!: 'text' | 'shape' | 'note';

  @prop({ required: true })
  public content!: string;

  @prop({ required: true, type: () => PositionClass })
  public position!: PositionClass;

  @prop({ type: () => Object })
  public style?: Record<string, unknown>;
}

export const CanvasNodeModel = getModelForClass(CanvasNodeClass);
export type CanvasNodeDoc = DocumentType<CanvasNodeClass>;
