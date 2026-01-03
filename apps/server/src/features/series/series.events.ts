import { EVENTS } from '../events/events.constants';

export const SERIES_EVENTS = {
  CREATED: EVENTS.SERIES_CREATED,
  UPDATED: EVENTS.SERIES_UPDATED,
  DELETED: EVENTS.SERIES_DELETED,
} as const;
