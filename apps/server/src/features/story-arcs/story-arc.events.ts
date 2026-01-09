import { EVENTS } from '../events/events.constants';

export const STORY_ARC_EVENTS = {
  CREATED: EVENTS.STORY_ARC_CREATED,
  UPDATED: EVENTS.STORY_ARC_UPDATED,
  DELETED: EVENTS.STORY_ARC_DELETED,
} as const;
