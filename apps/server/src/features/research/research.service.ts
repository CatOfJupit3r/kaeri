import { inject, injectable } from 'tsyringe';
import type z from 'zod';

import { errorCodes } from '@kaeri/shared';
import { createResearchValueSchema, updateResearchPatchSchema } from '@kaeri/shared/contract/research.contract';

import { ResearchModel } from '@~/db/models/research.model';
import { SeriesModel } from '@~/db/models/series.model';
import { TOKENS } from '@~/di/tokens';
import { ORPCBadRequestError, ORPCNotFoundError } from '@~/lib/orpc-error-wrapper';

import type { TypedEventBus } from '../events/event-bus';
import type { iWithLogger, LoggerFactory } from '../logger/logger.types';

type CreateResearchValue = z.infer<typeof createResearchValueSchema>;
type UpdateResearchPatch = z.infer<typeof updateResearchPatchSchema>;

@injectable()
export class ResearchService implements iWithLogger {
  public readonly logger: iWithLogger['logger'];

  constructor(
    @inject(TOKENS.LoggerFactory) loggerFactory: LoggerFactory,
    @inject(TOKENS.EventBus) private readonly eventBus: TypedEventBus,
  ) {
    this.logger = loggerFactory.create('research-service');
  }

  public async create(seriesId: string, data: CreateResearchValue) {
    const series = await SeriesModel.findById(seriesId);
    if (!series) {
      throw ORPCNotFoundError(errorCodes.SERIES_NOT_FOUND);
    }

    if (!data.title?.trim()) {
      throw ORPCBadRequestError(errorCodes.RESEARCH_TITLE_REQUIRED);
    }

    const research = await ResearchModel.create({
      seriesId,
      title: data.title,
      content: data.content ?? '',
      tags: data.tags ?? [],
      entityLinks: data.entityLinks ?? [],
    });

    this.logger.info('Research created', { researchId: research._id, seriesId, title: research.title });

    return research;
  }

  public async update(researchId: string, patch: UpdateResearchPatch) {
    const research = await ResearchModel.findById(researchId);
    if (!research) {
      throw ORPCNotFoundError(errorCodes.RESEARCH_NOT_FOUND);
    }

    if (patch.title !== undefined) {
      if (!patch.title?.trim()) {
        throw ORPCBadRequestError(errorCodes.RESEARCH_TITLE_REQUIRED);
      }
      research.title = patch.title;
    }

    if (patch.content !== undefined) research.content = patch.content;
    if (patch.tags !== undefined) research.tags = patch.tags;
    if (patch.entityLinks !== undefined) research.entityLinks = patch.entityLinks;

    await research.save();

    this.logger.info('Research updated', { researchId: research._id, seriesId: research.seriesId });

    return research;
  }

  public async delete(researchId: string) {
    const research = await ResearchModel.findById(researchId);
    if (!research) {
      throw ORPCNotFoundError(errorCodes.RESEARCH_NOT_FOUND);
    }

    await ResearchModel.deleteOne({ _id: researchId });

    this.logger.info('Research deleted', { researchId, seriesId: research.seriesId });

    return { success: true };
  }

  public async get(researchId: string) {
    const research = await ResearchModel.findById(researchId);
    if (!research) {
      throw ORPCNotFoundError(errorCodes.RESEARCH_NOT_FOUND);
    }
    return research;
  }

  public async list(seriesId: string, limit = 20, offset = 0) {
    const series = await SeriesModel.findById(seriesId);
    if (!series) {
      throw ORPCNotFoundError(errorCodes.SERIES_NOT_FOUND);
    }

    const [items, total] = await Promise.all([
      ResearchModel.find({ seriesId })
        .sort({ updatedAt: -1 })
        .skip(offset)
        .limit(limit + 1)
        .lean()
        .exec(),
      ResearchModel.countDocuments({ seriesId }),
    ]);

    const hasMore = items.length > limit;
    if (hasMore) {
      items.pop();
    }

    return {
      items,
      total,
      hasMore,
    };
  }

  public async search(seriesId: string, query: string, limit = 20, offset = 0) {
    const series = await SeriesModel.findById(seriesId);
    if (!series) {
      throw ORPCNotFoundError(errorCodes.SERIES_NOT_FOUND);
    }

    const searchFilter = {
      seriesId,
      $text: { $search: query },
    };

    const [items, total] = await Promise.all([
      ResearchModel.find(searchFilter, { score: { $meta: 'textScore' } })
        .sort({ score: { $meta: 'textScore' } })
        .skip(offset)
        .limit(limit + 1)
        .lean()
        .exec(),
      ResearchModel.countDocuments(searchFilter),
    ]);

    const hasMore = items.length > limit;
    if (hasMore) {
      items.pop();
    }

    return {
      items,
      total,
      hasMore,
    };
  }
}
