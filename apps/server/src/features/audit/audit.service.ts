import { injectable, inject } from 'tsyringe';

import { AuditEntryModel } from '@~/db/models/audit-entry.model';
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
      await AuditEntryModel.create({
        seriesId: options.seriesId,
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
}
