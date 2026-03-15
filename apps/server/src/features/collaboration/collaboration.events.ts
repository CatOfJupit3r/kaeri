/**
 * Re-export collaboration events from central events.constants.ts
 * This file exists for backward compatibility and easier imports within collaboration feature.
 */
import { EVENTS } from '@~/features/events/events.constants';

// Re-export collaboration events for convenient imports
export const COLLABORATION_EVENTS = {
  // Workspace events
  WORKSPACE_CREATED: EVENTS.WORKSPACE_CREATED,
  WORKSPACE_UPDATED: EVENTS.WORKSPACE_UPDATED,
  WORKSPACE_DELETED: EVENTS.WORKSPACE_DELETED,

  // Member events
  MEMBER_ADDED: EVENTS.MEMBER_ADDED,
  MEMBER_REMOVED: EVENTS.MEMBER_REMOVED,
  MEMBER_ROLE_CHANGED: EVENTS.MEMBER_ROLE_CHANGED,
  OWNERSHIP_TRANSFERRED: EVENTS.OWNERSHIP_TRANSFERRED,

  // Invitation events
  INVITATION_SENT: EVENTS.INVITATION_SENT,
  INVITATION_ACCEPTED: EVENTS.INVITATION_ACCEPTED,
  INVITATION_DECLINED: EVENTS.INVITATION_DECLINED,
  INVITATION_REVOKED: EVENTS.INVITATION_REVOKED,

  // Series transfer events
  SERIES_TRANSFERRED: EVENTS.SERIES_TRANSFERRED,
} as const;
