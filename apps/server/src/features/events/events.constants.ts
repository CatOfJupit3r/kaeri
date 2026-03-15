import z from 'zod';

const EventsSchema = z.enum([
  'BETA_EVENT',
  // SERIES_EVENTS
  'SERIES_CREATED',
  'SERIES_UPDATED',
  'SERIES_DELETED',
  // STORY_ARC_EVENTS
  'STORY_ARC_CREATED',
  'STORY_ARC_UPDATED',
  'STORY_ARC_DELETED',
  // KNOWLEDGE_BASE
  'KNOWLEDGE_BASE_CHARACTER_ACTION',
  'KNOWLEDGE_BASE_LOCATION_ACTION',
  'KNOWLEDGE_BASE_PROP_ACTION',
  'KNOWLEDGE_BASE_TIMELINE_ACTION',
  'KNOWLEDGE_BASE_WILDCARD_ACTION',
  // CANVAS
  'NODES_UPSERTED',
  'EDGES_UPSERTED',
  'NODES_DELETED',
  'EDGES_DELETED',
  // COLLABORATION - WORKSPACE
  'WORKSPACE_CREATED',
  'WORKSPACE_UPDATED',
  'WORKSPACE_DELETED',
  // COLLABORATION - MEMBERSHIP
  'MEMBER_ADDED',
  'MEMBER_REMOVED',
  'MEMBER_ROLE_CHANGED',
  'OWNERSHIP_TRANSFERRED',
  // COLLABORATION - INVITATIONS
  'INVITATION_SENT',
  'INVITATION_ACCEPTED',
  'INVITATION_DECLINED',
  'INVITATION_REVOKED',
  // COLLABORATION - SERIES
  'SERIES_TRANSFERRED',
]);

export const EVENTS = EventsSchema.enum;
export type EventType = z.infer<typeof EventsSchema>;

export interface iBetaEventPayload {
  userId: string;
}

interface iSeriesCreatedPayload {
  seriesId: string;
}
interface iSeriesUpdatedPayload {
  seriesId: string;
}
interface iSeriesDeletedPayload {
  seriesId: string;
}

interface iStoryArcCreatedPayload {
  storyArcId: string;
  seriesId: string;
}
interface iStoryArcUpdatedPayload {
  storyArcId: string;
  seriesId: string;
}
interface iStoryArcDeletedPayload {
  storyArcId: string;
  seriesId: string;
}

export interface iKnowledgeBaseActionPayload {
  seriesId: string;
  entityId: string;
  action: 'created' | 'updated' | 'deleted';
}

interface iCanvasChangedPayload {
  seriesId: string;
}

// Collaboration event payloads
export interface iWorkspaceCreatedPayload {
  workspaceId: string;
  creatorId: string;
}

export interface iWorkspaceUpdatedPayload {
  workspaceId: string;
  updatedById: string;
}

export interface iWorkspaceDeletedPayload {
  workspaceId: string;
  deletedById: string;
}

export interface iMemberAddedPayload {
  workspaceId: string;
  userId: string;
  role: string;
  invitedById?: string;
}

export interface iMemberRemovedPayload {
  workspaceId: string;
  userId: string;
  removedById: string;
}

export interface iMemberRoleChangedPayload {
  workspaceId: string;
  userId: string;
  previousRole: string;
  newRole: string;
  changedById: string;
}

export interface iOwnershipTransferredPayload {
  workspaceId: string;
  oldOwnerId: string;
  newOwnerId: string;
}

export interface iInvitationSentPayload {
  invitationId: string;
  workspaceId: string;
  email: string;
  invitedById: string;
}

export interface iInvitationAcceptedPayload {
  invitationId: string;
  workspaceId: string;
  userId: string;
}

export interface iInvitationDeclinedPayload {
  invitationId: string;
  workspaceId: string;
}

export interface iInvitationRevokedPayload {
  invitationId: string;
  workspaceId: string;
  revokedById: string;
}

export interface iSeriesTransferredPayload {
  seriesId: string;
  fromWorkspaceId: string;
  toWorkspaceId: string;
  transferredById: string;
}

export interface iEventPayloadMap {
  [EVENTS.BETA_EVENT]: iBetaEventPayload;
  [EVENTS.SERIES_CREATED]: iSeriesCreatedPayload;
  [EVENTS.SERIES_UPDATED]: iSeriesUpdatedPayload;
  [EVENTS.SERIES_DELETED]: iSeriesDeletedPayload;
  [EVENTS.STORY_ARC_CREATED]: iStoryArcCreatedPayload;
  [EVENTS.STORY_ARC_UPDATED]: iStoryArcUpdatedPayload;
  [EVENTS.STORY_ARC_DELETED]: iStoryArcDeletedPayload;
  [EVENTS.KNOWLEDGE_BASE_CHARACTER_ACTION]: iKnowledgeBaseActionPayload;
  [EVENTS.KNOWLEDGE_BASE_LOCATION_ACTION]: iKnowledgeBaseActionPayload;
  [EVENTS.KNOWLEDGE_BASE_PROP_ACTION]: iKnowledgeBaseActionPayload;
  [EVENTS.KNOWLEDGE_BASE_TIMELINE_ACTION]: iKnowledgeBaseActionPayload;
  [EVENTS.KNOWLEDGE_BASE_WILDCARD_ACTION]: iKnowledgeBaseActionPayload;
  [EVENTS.NODES_UPSERTED]: iCanvasChangedPayload;
  [EVENTS.EDGES_UPSERTED]: iCanvasChangedPayload;
  [EVENTS.NODES_DELETED]: iCanvasChangedPayload;
  [EVENTS.EDGES_DELETED]: iCanvasChangedPayload;
  // Collaboration events
  [EVENTS.WORKSPACE_CREATED]: iWorkspaceCreatedPayload;
  [EVENTS.WORKSPACE_UPDATED]: iWorkspaceUpdatedPayload;
  [EVENTS.WORKSPACE_DELETED]: iWorkspaceDeletedPayload;
  [EVENTS.MEMBER_ADDED]: iMemberAddedPayload;
  [EVENTS.MEMBER_REMOVED]: iMemberRemovedPayload;
  [EVENTS.MEMBER_ROLE_CHANGED]: iMemberRoleChangedPayload;
  [EVENTS.OWNERSHIP_TRANSFERRED]: iOwnershipTransferredPayload;
  [EVENTS.INVITATION_SENT]: iInvitationSentPayload;
  [EVENTS.INVITATION_ACCEPTED]: iInvitationAcceptedPayload;
  [EVENTS.INVITATION_DECLINED]: iInvitationDeclinedPayload;
  [EVENTS.INVITATION_REVOKED]: iInvitationRevokedPayload;
  [EVENTS.SERIES_TRANSFERRED]: iSeriesTransferredPayload;
}
