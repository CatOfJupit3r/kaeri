import { injectable, inject } from 'tsyringe';

import { AuditEntryModel } from '@~/db/models/audit-entry.model';
import { SeriesModel } from '@~/db/models/series.model';
import { TOKENS } from '@~/di/tokens';
import type { LoggerFactory, iWithLogger } from '@~/features/logger/logger.types';

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE';
export type AuditEntityType =
  | 'character'
  | 'location'
  | 'prop'
  | 'timeline'
  | 'wildcard'
  | 'scene'
  | 'theme'
  | 'story-arc';

interface iAuditLogOptions {
  seriesId: string;
  entityType: AuditEntityType;
  entityId: string;
  action: AuditAction;
  actorId: string;
  before?: object;
  after?: object;
}

interface iFormattedAuditEntry {
  _id: string;
  seriesId: string;
  workspaceId?: string;
  entityType: string;
  entityId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  actorId: string;
  timestamp: Date;
}

/**
 * Service for logging audit entries for entity mutations
 */
@injectable()
export class AuditService implements iWithLogger {
  public logger: ReturnType<LoggerFactory['create']>;

  constructor(@inject(TOKENS.LoggerFactory) loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.create('audit-service');
  }

  /**
   * Log an entity creation
   */
  public async logCreate(
    seriesId: string,
    entityType: AuditEntityType,
    entityId: string,
    actorId: string,
    entityData: object,
  ) {
    await this.log({
      seriesId,
      entityType,
      entityId,
      action: 'CREATE',
      actorId,
      after: entityData,
    });
  }

  /**
   * Log an entity update
   */
  public async logUpdate(
    seriesId: string,
    entityType: AuditEntityType,
    entityId: string,
    actorId: string,
    before: object,
    after: object,
  ) {
    await this.log({
      seriesId,
      entityType,
      entityId,
      action: 'UPDATE',
      actorId,
      before,
      after,
    });
  }

  /**
   * Log an entity deletion
   */
  public async logDelete(
    seriesId: string,
    entityType: AuditEntityType,
    entityId: string,
    actorId: string,
    entityData: object,
  ) {
    await this.log({
      seriesId,
      entityType,
      entityId,
      action: 'DELETE',
      actorId,
      before: entityData,
    });
  }

  /**
   * Internal logging method
   */
  private async log(options: iAuditLogOptions) {
    try {
      // Derive workspaceId from the series
      let workspaceId: string | undefined;
      try {
        const series = await SeriesModel.findById(options.seriesId, { workspaceId: 1 }).lean();
        workspaceId = series?.workspaceId;
      } catch {
        // Ignore lookup errors - workspaceId is optional
      }

      await AuditEntryModel.create({
        seriesId: options.seriesId,
        workspaceId,
        entityType: options.entityType,
        entityId: options.entityId,
        action: options.action,
        actorId: options.actorId,
        timestamp: new Date(),
        before: options.before,
        after: options.after,
      });

      this.logger.debug('Audit entry created', {
        seriesId: options.seriesId,
        workspaceId,
        entityType: options.entityType,
        entityId: options.entityId,
        action: options.action,
      });
    } catch (error) {
      // Log error but don't fail the main operation
      this.logger.error('Failed to create audit entry', {
        error: (error as Error).message,
        ...options,
      });
    }
  }

  /**
   * Get paginated activity entries for a workspace
   */
  public async getWorkspaceActivity(
    workspaceId: string,
    options: { limit?: number; offset?: number } = {},
  ): Promise<{ entries: iFormattedAuditEntry[]; total: number }> {
    const limit = Math.min(options.limit ?? 20, 100);
    const offset = options.offset ?? 0;

    const [entries, total] = await Promise.all([
      AuditEntryModel.find({ workspaceId }).sort({ timestamp: -1 }).skip(offset).limit(limit).lean(),
      AuditEntryModel.countDocuments({ workspaceId }),
    ]);

    return {
      entries: entries.map((e) => this.formatAuditEntry(e)),
      total,
    };
  }

  /**
   * Get paginated activity entries for a series
   */
  public async getSeriesActivity(
    seriesId: string,
    options: { limit?: number; offset?: number } = {},
  ): Promise<{ entries: iFormattedAuditEntry[]; total: number }> {
    const limit = Math.min(options.limit ?? 20, 100);
    const offset = options.offset ?? 0;

    const [entries, total] = await Promise.all([
      AuditEntryModel.find({ seriesId }).sort({ timestamp: -1 }).skip(offset).limit(limit).lean(),
      AuditEntryModel.countDocuments({ seriesId }),
    ]);

    return {
      entries: entries.map((e) => this.formatAuditEntry(e)),
      total,
    };
  }

  /**
   * Format an audit entry for API response
   */
  private formatAuditEntry(entry: {
    _id: string;
    seriesId: string;
    workspaceId?: string;
    entityType: string;
    entityId: string;
    action: string;
    actorId: string;
    timestamp: Date;
  }): iFormattedAuditEntry {
    return {
      _id: entry._id,
      seriesId: entry.seriesId,
      workspaceId: entry.workspaceId,
      entityType: entry.entityType,
      entityId: entry.entityId,
      action: entry.action as 'CREATE' | 'UPDATE' | 'DELETE',
      actorId: entry.actorId,
      timestamp: entry.timestamp,
    };
  }
}
