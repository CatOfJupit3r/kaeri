import { getModelForClass, modelOptions, prop } from '@typegoose/typegoose';
import type { DocumentType } from '@typegoose/typegoose';

import { RequiredTimeStamps } from '../base-classes';
import { ObjectIdString } from '../helpers';

@modelOptions({ schemaOptions: { collection: 'workspaces', timestamps: true } })
class WorkspaceClass extends RequiredTimeStamps {
  @prop({ default: () => ObjectIdString() })
  public _id!: string;

  @prop({ required: true })
  public name!: string;

  @prop()
  public description?: string;

  /**
   * Marks this as a personal workspace (auto-created for each user).
   * Personal workspaces cannot be deleted and have special behavior.
   */
  @prop({ default: false, index: true })
  public isPersonal!: boolean;

  /**
   * User ID of the workspace creator (for personal workspace lookups).
   * The actual owner is determined by WorkspaceMember with role=OWNER.
   */
  @prop({ index: true })
  public creatorId?: string;
}

export const WorkspaceModel = getModelForClass(WorkspaceClass);
export type WorkspaceDoc = DocumentType<WorkspaceClass>;
