import crypto from 'node:crypto';
import { inject, injectable } from 'tsyringe';
import type z from 'zod';

import { errorCodes } from '@kaeri/shared';
import { createScriptInputSchema, updateScriptPatchSchema } from '@kaeri/shared/contract/scripts.contract';

import { SceneModel } from '@~/db/models/scene.model';
import { ScriptVersionModel } from '@~/db/models/script-version.model';
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

    await SceneModel.deleteMany({ scriptId });
    await ScriptVersionModel.deleteMany({ scriptId });
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

  // --- Version Management ---

  private hashContent(content: string): string {
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  private countWords(content: string): number {
    try {
      const parsed = JSON.parse(content) as { content?: Array<{ content?: Array<{ text?: string }> }> };
      if (!parsed.content) return 0;
      const text = parsed.content
        .flatMap((block) => block.content ?? [])
        .map((node) => node.text ?? '')
        .join(' ');
      return text.split(/\s+/).filter(Boolean).length;
    } catch {
      return content.split(/\s+/).filter(Boolean).length;
    }
  }

  private countBlocks(content: string): number {
    try {
      const parsed = JSON.parse(content) as { content?: unknown[] };
      return parsed.content?.length ?? 0;
    } catch {
      return 0;
    }
  }

  public async createVersion(scriptId: string, userId: string, options?: { name?: string }) {
    const script = await ScriptModel.findById(scriptId);
    if (!script) {
      throw ORPCNotFoundError(errorCodes.SCRIPT_NOT_FOUND);
    }

    // Guard against empty content
    if (!script.content || script.content === '""' || script.content === '{}') {
      throw ORPCBadRequestError(errorCodes.SCRIPT_EMPTY_CONTENT);
    }

    // Validate name length
    if (options?.name && options.name.length > 100) {
      throw ORPCBadRequestError(errorCodes.SCRIPT_VERSION_NAME_TOO_LONG);
    }

    const contentHash = this.hashContent(script.content);

    // Deduplicate: skip if latest version has same content
    const existingVersion = await ScriptVersionModel.findOne({ scriptId, contentHash }).lean();
    if (existingVersion) {
      throw ORPCBadRequestError(errorCodes.SCRIPT_CONTENT_UNCHANGED);
    }

    // Get next version number
    const lastVersion = await ScriptVersionModel.findOne({ scriptId }).sort({ version: -1 }).lean();
    const nextVersion = (lastVersion?.version ?? 0) + 1;

    const version = await ScriptVersionModel.create({
      scriptId,
      version: nextVersion,
      content: script.content,
      contentHash,
      createdBy: userId,
      name: options?.name,
      autoGenerated: !options?.name,
      wordCount: this.countWords(script.content),
      blockCount: this.countBlocks(script.content),
    });

    // Prune auto-generated versions beyond limit (keep latest 50)
    const AUTO_VERSION_LIMIT = 50;
    const autoVersionCount = await ScriptVersionModel.countDocuments({ scriptId, autoGenerated: true });
    if (autoVersionCount > AUTO_VERSION_LIMIT) {
      const oldestToKeep = await ScriptVersionModel.find({ scriptId, autoGenerated: true })
        .sort({ version: -1 })
        .skip(AUTO_VERSION_LIMIT)
        .limit(1)
        .lean();
      if (oldestToKeep.length > 0) {
        await ScriptVersionModel.deleteMany({
          scriptId,
          autoGenerated: true,
          version: { $lte: oldestToKeep[0].version },
        });
      }
    }

    this.logger.info('Script version created', { scriptId, version: nextVersion, name: options?.name });
    return version;
  }

  public async listVersions(scriptId: string, limit = 20, offset = 0) {
    const script = await ScriptModel.findById(scriptId);
    if (!script) {
      throw ORPCNotFoundError(errorCodes.SCRIPT_NOT_FOUND);
    }

    const [items, total] = await Promise.all([
      ScriptVersionModel.find({ scriptId })
        .select('_id scriptId version name createdBy createdAt autoGenerated wordCount blockCount')
        .sort({ version: -1 })
        .limit(limit)
        .skip(offset)
        .lean(),
      ScriptVersionModel.countDocuments({ scriptId }),
    ]);

    return { items, total };
  }

  public async getVersion(scriptId: string, versionId: string) {
    const version = await ScriptVersionModel.findOne({ _id: versionId, scriptId });
    if (!version) {
      throw ORPCNotFoundError(errorCodes.SCRIPT_VERSION_NOT_FOUND);
    }
    return version;
  }

  public async restoreVersion(scriptId: string, versionId: string, userId: string) {
    const script = await ScriptModel.findById(scriptId);
    if (!script) {
      throw ORPCNotFoundError(errorCodes.SCRIPT_NOT_FOUND);
    }

    const versionToRestore = await ScriptVersionModel.findOne({ _id: versionId, scriptId });
    if (!versionToRestore) {
      throw ORPCNotFoundError(errorCodes.SCRIPT_VERSION_NOT_FOUND);
    }

    // Create safety snapshot of current content before restoring
    const safetySnapshot = await this.createSafetySnapshot(script, userId);

    // Restore the content
    script.content = versionToRestore.content;
    script.lastEditedAt = new Date();
    await script.save();

    // Update series lastEditedAt
    await SeriesModel.findByIdAndUpdate(script.seriesId, { lastEditedAt: new Date() });

    this.logger.info('Script version restored', {
      scriptId,
      restoredVersion: versionToRestore.version,
      safetySnapshotId: safetySnapshot._id,
    });

    return {
      restoredVersion: versionToRestore.version,
      safetySnapshotId: String(safetySnapshot._id),
    };
  }

  public async deleteVersion(scriptId: string, versionId: string) {
    const version = await ScriptVersionModel.findOne({ _id: versionId, scriptId });
    if (!version) {
      throw ORPCNotFoundError(errorCodes.SCRIPT_VERSION_NOT_FOUND);
    }

    await ScriptVersionModel.deleteOne({ _id: versionId });
    this.logger.info('Script version deleted', { scriptId, versionId, version: version.version });
    return { success: true };
  }

  public async updateVersionName(scriptId: string, versionId: string, name: string) {
    if (name.length > 100) {
      throw ORPCBadRequestError(errorCodes.SCRIPT_VERSION_NAME_TOO_LONG);
    }

    const version = await ScriptVersionModel.findOne({ _id: versionId, scriptId });
    if (!version) {
      throw ORPCNotFoundError(errorCodes.SCRIPT_VERSION_NOT_FOUND);
    }

    version.name = name;
    version.autoGenerated = false;
    await version.save();

    this.logger.info('Script version renamed', { scriptId, versionId, name });
    return version;
  }

  private async createSafetySnapshot(script: { _id: string; content: string }, userId: string) {
    const contentHash = this.hashContent(script.content);

    // Skip if a version with identical content already exists
    const existing = await ScriptVersionModel.findOne({ scriptId: script._id, contentHash }).lean();
    if (existing) return existing;

    const lastVersion = await ScriptVersionModel.findOne({ scriptId: script._id }).sort({ version: -1 }).lean();
    const nextVersion = (lastVersion?.version ?? 0) + 1;

    return ScriptVersionModel.create({
      scriptId: script._id,
      version: nextVersion,
      content: script.content,
      contentHash,
      createdBy: userId,
      name: 'Auto-save before restore',
      autoGenerated: true,
      wordCount: this.countWords(script.content),
      blockCount: this.countBlocks(script.content),
    });
  }
}
