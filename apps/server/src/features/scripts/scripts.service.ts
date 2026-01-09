import { inject, injectable } from 'tsyringe';
import type z from 'zod';

import { errorCodes } from '@kaeri/shared';
import { createScriptInputSchema, updateScriptPatchSchema } from '@kaeri/shared/contract/scripts.contract';

import { ScriptModel } from '@~/db/models/script.model';
import { SeriesModel } from '@~/db/models/series.model';
import { TOKENS } from '@~/di/tokens';
import { ORPCBadRequestError, ORPCNotFoundError } from '@~/lib/orpc-error-wrapper';

import type { iWithLogger, LoggerFactory } from '../logger/logger.types';

type CreateScriptInput = z.infer<typeof createScriptInputSchema>;
type UpdateScriptPatch = z.infer<typeof updateScriptPatchSchema>;

@injectable()
export class ScriptsService implements iWithLogger {
  public readonly logger: iWithLogger['logger'];

  constructor(@inject(TOKENS.LoggerFactory) loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.create('scripts-service');
  }

  public async create(data: CreateScriptInput) {
    // Verify series exists
    const series = await SeriesModel.findById(data.seriesId);
    if (!series) {
      throw ORPCNotFoundError(errorCodes.SERIES_NOT_FOUND);
    }

    if (!data.title?.trim()) {
      throw ORPCBadRequestError(errorCodes.SCRIPT_TITLE_REQUIRED);
    }

    const script = await ScriptModel.create({
      seriesId: data.seriesId,
      title: data.title,
      authors: data.authors ?? [],
      genre: data.genre,
      logline: data.logline,
      coverUrl: data.coverUrl,
      content: '',
      contentVersion: 1,
      lastEditedAt: new Date(),
    });

    // Update series lastEditedAt
    series.lastEditedAt = new Date();
    await series.save();

    this.logger.info('Script created', { scriptId: script._id, seriesId: data.seriesId, title: script.title });
    return script;
  }

  public async update(scriptId: string, patch: UpdateScriptPatch) {
    const script = await ScriptModel.findById(scriptId);
    if (!script) {
      throw ORPCNotFoundError(errorCodes.SCRIPT_NOT_FOUND);
    }

    if (patch.title !== undefined) script.title = patch.title;
    if (patch.authors !== undefined) script.authors = patch.authors;
    if (patch.genre !== undefined) script.genre = patch.genre;
    if (patch.logline !== undefined) script.logline = patch.logline;
    if (patch.coverUrl !== undefined) script.coverUrl = patch.coverUrl;

    script.lastEditedAt = new Date();
    await script.save();

    // Update series lastEditedAt
    await SeriesModel.findByIdAndUpdate(script.seriesId, { lastEditedAt: new Date() });

    this.logger.info('Script updated', { scriptId: script._id });
    return script;
  }

  public async delete(scriptId: string) {
    const script = await ScriptModel.findById(scriptId);
    if (!script) {
      throw ORPCNotFoundError(errorCodes.SCRIPT_NOT_FOUND);
    }

    await ScriptModel.deleteOne({ _id: scriptId });

    // Update series lastEditedAt
    await SeriesModel.findByIdAndUpdate(script.seriesId, { lastEditedAt: new Date() });

    this.logger.info('Script deleted', { scriptId });
    return { success: true };
  }

  public async listBySeries(seriesId: string, limit = 20, offset = 0) {
    // Verify series exists
    const series = await SeriesModel.findById(seriesId);
    if (!series) {
      throw ORPCNotFoundError(errorCodes.SERIES_NOT_FOUND);
    }

    const [items, total] = await Promise.all([
      ScriptModel.find({ seriesId })
        .select('_id seriesId title authors genre logline coverUrl lastEditedAt')
        .sort({ lastEditedAt: -1 })
        .limit(limit)
        .skip(offset)
        .lean(),
      ScriptModel.countDocuments({ seriesId }),
    ]);

    return { items, total };
  }

  public async get(scriptId: string) {
    const script = await ScriptModel.findById(scriptId);
    if (!script) {
      throw ORPCNotFoundError(errorCodes.SCRIPT_NOT_FOUND);
    }
    return script;
  }

  public async saveContent(scriptId: string, content: string, cursor?: { line: number; column: number }) {
    const script = await ScriptModel.findById(scriptId);
    if (!script) {
      throw ORPCNotFoundError(errorCodes.SCRIPT_NOT_FOUND);
    }

    script.content = content;
    script.lastEditedAt = new Date();
    await script.save();

    // Update series lastEditedAt
    await SeriesModel.findByIdAndUpdate(script.seriesId, { lastEditedAt: new Date() });

    this.logger.info('Script content saved', { scriptId, contentLength: content.length, cursor });
    return { lastEditedAt: script.lastEditedAt };
  }
}
