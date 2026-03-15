import z from 'zod';

/**
 * Invitation status enum - tracks lifecycle of workspace invitations
 */
export const invitationStatusSchema = z.enum(['PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'REVOKED']);
export const INVITATION_STATUS = invitationStatusSchema.enum;
export type InvitationStatus = z.infer<typeof invitationStatusSchema>;

/**
 * Invitation status metadata for UI display
 */
export const INVITATION_STATUS_META = {
  [INVITATION_STATUS.PENDING]: {
    label: 'Pending',
    description: 'Awaiting response from invitee',
    color: 'yellow',
  },
  [INVITATION_STATUS.ACCEPTED]: {
    label: 'Accepted',
    description: 'Invitation has been accepted',
    color: 'green',
  },
  [INVITATION_STATUS.DECLINED]: {
    label: 'Declined',
    description: 'Invitation was declined by invitee',
    color: 'red',
  },
  [INVITATION_STATUS.EXPIRED]: {
    label: 'Expired',
    description: 'Invitation has expired (7 days)',
    color: 'gray',
  },
  [INVITATION_STATUS.REVOKED]: {
    label: 'Revoked',
    description: 'Invitation was revoked by workspace admin',
    color: 'gray',
  },
} as const satisfies Record<InvitationStatus, { label: string; description: string; color: string }>;

/**
 * Default invitation expiration in days
 */
export const INVITATION_EXPIRATION_DAYS = 7;
