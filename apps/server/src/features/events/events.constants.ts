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
}
