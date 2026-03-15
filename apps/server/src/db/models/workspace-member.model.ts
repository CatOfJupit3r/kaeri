import { getModelForClass, index, modelOptions, prop } from '@typegoose/typegoose';
import type { DocumentType } from '@typegoose/typegoose';

import type { WorkspaceRole } from '@kaeri/shared';
import { WORKSPACE_ROLES } from '@kaeri/shared';

import { ObjectIdString } from '../helpers';

@index({ workspaceId: 1, userId: 1 }, { unique: true })
@modelOptions({ schemaOptions: { collection: 'workspace_members' } })
class WorkspaceMemberClass {
  @prop({ default: () => ObjectIdString() })
  public _id!: string;

  @prop({ required: true, index: true })
  public workspaceId!: string;

  @prop({ required: true, index: true })
  public userId!: string;

  @prop({
    required: true,
    enum: Object.values(WORKSPACE_ROLES),
    type: String,
  })
  public role!: WorkspaceRole;

  @prop({ required: true, default: () => new Date() })
  public joinedAt!: Date;
}

export const WorkspaceMemberModel = getModelForClass(WorkspaceMemberClass);
export type WorkspaceMemberDoc = DocumentType<WorkspaceMemberClass>;
