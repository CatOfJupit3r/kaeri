import { getModelForClass, index, modelOptions, prop } from '@typegoose/typegoose';
import type { DocumentType } from '@typegoose/typegoose';
import { customAlphabet } from 'nanoid';

import type { InvitationStatus, WorkspaceRole } from '@kaeri/shared';
import { INVITATION_EXPIRATION_DAYS, INVITATION_STATUS, WORKSPACE_ROLES } from '@kaeri/shared';

import { ObjectIdString } from '../helpers';

/**
 * Generate a URL-safe invitation code using nanoid
 * 21 characters with 64-char alphabet = ~126 bits of entropy
 */
const generateInviteCode = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_', 21);

/**
 * Calculate default expiration date (7 days from now)
 */
const getDefaultExpirationDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + INVITATION_EXPIRATION_DAYS);
  return date;
};

@index({ code: 1 }, { unique: true })
@index({ workspaceId: 1 })
@index({ invitedEmail: 1 })
@index({ status: 1 })
@index({ expiresAt: 1 })
@modelOptions({ schemaOptions: { collection: 'invitations', timestamps: true } })
class InvitationClass {
  @prop({ default: () => ObjectIdString() })
  public _id!: string;

  @prop({ required: true, index: true })
  public workspaceId!: string;

  @prop({ required: true, lowercase: true, trim: true })
  public invitedEmail!: string;

  @prop({ required: true })
  public invitedByUserId!: string;

  /**
   * Role to assign when invitation is accepted.
   * Cannot be OWNER - ownership is transferred, not invited.
   */
  @prop({
    required: true,
    enum: [WORKSPACE_ROLES.ADMIN, WORKSPACE_ROLES.EDITOR, WORKSPACE_ROLES.VIEWER],
    type: String,
    default: WORKSPACE_ROLES.EDITOR,
  })
  public role!: Exclude<WorkspaceRole, 'OWNER'>;

  /**
   * Unique, cryptographically random invitation code.
   * Used in invitation URLs for acceptance.
   */
  @prop({ required: true, unique: true, default: () => generateInviteCode() })
  public code!: string;

  @prop({
    required: true,
    enum: Object.values(INVITATION_STATUS),
    type: String,
    default: INVITATION_STATUS.PENDING,
  })
  public status!: InvitationStatus;

  @prop({ required: true, default: () => getDefaultExpirationDate() })
  public expiresAt!: Date;

  @prop()
  public acceptedAt?: Date;

  @prop({ required: true, default: () => new Date() })
  public createdAt!: Date;
}

export const InvitationModel = getModelForClass(InvitationClass);
export type InvitationDoc = DocumentType<InvitationClass>;
