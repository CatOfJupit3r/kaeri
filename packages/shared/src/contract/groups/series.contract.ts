/**
 * Series contracts - series and episode management
 */
import episodeContract from '../episode.contract';
import seriesContract from '../series.contract';
import storyArcContract from '../story-arc.contract';

export const SERIES_CONTRACT = {
  series: seriesContract,
  episode: episodeContract,
  storyArc: storyArcContract,
};

export type SeriesContract = typeof SERIES_CONTRACT;
