import { getModelForClass, modelOptions, prop } from '@typegoose/typegoose';
import type { DocumentType } from '@typegoose/typegoose';

import { RequiredTimeStamps } from '../base-classes';
import { ObjectIdString } from '../helpers';

@modelOptions({ schemaOptions: { collection: 'canvas_edges', timestamps: true } })
class CanvasEdgeClass extends RequiredTimeStamps {
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
}

export const CanvasEdgeModel = getModelForClass(CanvasEdgeClass);
export type CanvasEdgeDoc = DocumentType<CanvasEdgeClass>;
