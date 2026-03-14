import { getModelForClass, modelOptions, prop, index } from '@typegoose/typegoose';
import type { DocumentType } from '@typegoose/typegoose';

import type { EpisodeStatus } from '@kaeri/shared/contract/episode.contract';
import { EPISODE_STATUS } from '@kaeri/shared/contract/episode.contract';

import { RequiredTimeStamps } from '../base-classes';
import { ObjectIdString } from '../helpers';

@modelOptions({ schemaOptions: { collection: 'episodes', timestamps: true } })
@index({ seriesId: 1, seasonNumber: 1, episodeNumber: 1 }, { unique: true })
@index({ seriesId: 1, seasonNumber: 1 })
class EpisodeClass extends RequiredTimeStamps {
  @prop({ default: () => ObjectIdString() })
  public _id!: string;

  @prop({ required: true })
  public seriesId!: string;

  @prop({ required: true, default: 1 })
  public seasonNumber!: number;

  @prop({ required: true })
  public episodeNumber!: number;

  @prop({ required: true })
  public title!: string;

  @prop()
  public description?: string;

  @prop({ type: () => [String], default: [] })
  public scriptIds!: string[];

  @prop({ enum: Object.values(EPISODE_STATUS), default: EPISODE_STATUS.outline })
  public status!: EpisodeStatus;

  @prop()
  public airDate?: Date;
}

export const EpisodeModel = getModelForClass(EpisodeClass);
export type EpisodeDoc = DocumentType<EpisodeClass>;
