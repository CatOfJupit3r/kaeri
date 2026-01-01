import { getModelForClass, modelOptions, prop } from '@typegoose/typegoose';
import type { DocumentType } from '@typegoose/typegoose';

import { ObjectIdString } from '../helpers';

@modelOptions({ schemaOptions: { collection: 'canvas_edges', timestamps: true } })
class CanvasEdgeClass {
  @prop({ default: () => ObjectIdString() })
  public _id!: string;

  @prop({ required: true, index: true })
  public seriesId!: string;

  @prop({ required: true, index: true })
  public sourceId!: string;

  @prop({ required: true, index: true })
  public targetId!: string;

  @prop()
  public label?: string;

  public createdAt!: Date;

  public updatedAt!: Date;
}

export const CanvasEdgeModel = getModelForClass(CanvasEdgeClass);
export type CanvasEdgeDoc = DocumentType<CanvasEdgeClass>;
