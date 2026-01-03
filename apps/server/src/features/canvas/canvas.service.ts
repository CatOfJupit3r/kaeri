import { injectable, inject } from 'tsyringe';

import { errorCodes } from '@kaeri/shared/enums/errors.enums';

import { CanvasEdgeModel } from '@~/db/models/canvas-edge.model';
import { CanvasNodeModel } from '@~/db/models/canvas-node.model';
import { SeriesModel } from '@~/db/models/series.model';
import { TOKENS } from '@~/di/tokens';
import type { LoggerFactory, iWithLogger } from '@~/features/logger/logger.types';
import { buildCacheKey, CACHE_TTL } from '@~/features/valkey/valkey.constants';
import { ORPCNotFoundError } from '@~/lib/orpc-error-wrapper';

import type { TypedEventBus } from '../events/event-bus';
import type { ValkeyService } from '../valkey/valkey.service';
import { CANVAS_EVENTS } from './canvas.events';

interface iCanvasNode {
  _id: string;
  seriesId: string;
  type: 'text' | 'shape' | 'note';
  content: string;
  position: { x: number; y: number };
  style?: Record<string, unknown>;
}

interface iCanvasEdge {
  _id: string;
  seriesId: string;
  sourceId: string;
  targetId: string;
  label?: string;
}

@injectable()
export class CanvasService implements iWithLogger {
  public logger: ReturnType<LoggerFactory['create']>;

  constructor(
    @inject(TOKENS.LoggerFactory) loggerFactory: LoggerFactory,
    @inject(TOKENS.ValkeyService) private readonly valkey: ValkeyService,
    @inject(TOKENS.EventBus) private readonly eventBus: TypedEventBus,
  ) {
    this.logger = loggerFactory.create('canvas-service');
  }

  /**
   * Get all canvas nodes and edges for a series
   */
  public async getCanvas(seriesId: string) {
    return this.valkey.cached(buildCacheKey.canvas(seriesId), CACHE_TTL.ENTITY_MEDIUM, async () => {
      this.logger.debug('Fetching canvas from database', { seriesId });
      const series = await SeriesModel.findById(seriesId);
      if (!series) {
        throw ORPCNotFoundError(errorCodes.SERIES_NOT_FOUND);
      }

      const [nodes, edges] = await Promise.all([
        CanvasNodeModel.find({ seriesId }).lean(),
        CanvasEdgeModel.find({ seriesId }).lean(),
      ]);

      this.logger.info('Canvas retrieved', { seriesId, nodeCount: nodes.length, edgeCount: edges.length });
      return { nodes, edges };
    });
  }

  /**
   * Upsert canvas nodes (bulk create/update)
   */
  public async upsertNodes(seriesId: string, nodes: iCanvasNode[]) {
    const series = await SeriesModel.findById(seriesId);
    if (!series) {
      throw ORPCNotFoundError(errorCodes.SERIES_NOT_FOUND);
    }

    const operations = nodes.map((node) => ({
      updateOne: {
        filter: { _id: node._id, seriesId },
        update: { $set: node },
        upsert: true,
      },
    }));

    await CanvasNodeModel.bulkWrite(operations);

    // Update series lastEditedAt
    await SeriesModel.updateOne({ _id: seriesId }, { lastEditedAt: new Date() });

    const updatedNodes = await CanvasNodeModel.find({
      _id: { $in: nodes.map((n) => n._id) },
      seriesId,
    }).lean();

    // Emit event for cache invalidation
    this.eventBus.emit(CANVAS_EVENTS.NODES_UPSERTED, { seriesId });
    this.logger.info('Canvas nodes upserted', { seriesId, nodeCount: nodes.length });

    return updatedNodes;
  }

  /**
   * Upsert canvas edges (bulk create/update)
   */
  public async upsertEdges(seriesId: string, edges: iCanvasEdge[]) {
    const series = await SeriesModel.findById(seriesId);
    if (!series) {
      throw ORPCNotFoundError(errorCodes.SERIES_NOT_FOUND);
    }

    const operations = edges.map((edge) => ({
      updateOne: {
        filter: { _id: edge._id, seriesId },
        update: { $set: edge },
        upsert: true,
      },
    }));

    await CanvasEdgeModel.bulkWrite(operations);

    // Update series lastEditedAt
    await SeriesModel.updateOne({ _id: seriesId }, { lastEditedAt: new Date() });

    const updatedEdges = await CanvasEdgeModel.find({
      _id: { $in: edges.map((e) => e._id) },
      seriesId,
    }).lean();

    // Emit event for cache invalidation
    this.eventBus.emit(CANVAS_EVENTS.EDGES_UPSERTED, { seriesId });
    this.logger.info('Canvas edges upserted', { seriesId, edgeCount: edges.length });

    return updatedEdges;
  }

  /**
   * Delete canvas nodes by IDs
   */
  public async deleteNodes(seriesId: string, nodeIds: string[]) {
    const series = await SeriesModel.findById(seriesId);
    if (!series) {
      throw ORPCNotFoundError(errorCodes.SERIES_NOT_FOUND);
    }

    const result = await CanvasNodeModel.deleteMany({ _id: { $in: nodeIds }, seriesId });

    // Update series lastEditedAt
    await SeriesModel.updateOne({ _id: seriesId }, { lastEditedAt: new Date() });

    // Emit event for cache invalidation
    this.eventBus.emit(CANVAS_EVENTS.NODES_DELETED, { seriesId });
    this.logger.info('Canvas nodes deleted', { seriesId, deletedCount: result.deletedCount });

    return { success: true };
  }

  /**
   * Delete canvas edges by IDs
   */
  public async deleteEdges(seriesId: string, edgeIds: string[]) {
    const series = await SeriesModel.findById(seriesId);
    if (!series) {
      throw ORPCNotFoundError(errorCodes.SERIES_NOT_FOUND);
    }

    const result = await CanvasEdgeModel.deleteMany({ _id: { $in: edgeIds }, seriesId });

    // Update series lastEditedAt
    await SeriesModel.updateOne({ _id: seriesId }, { lastEditedAt: new Date() });

    // Emit event for cache invalidation
    this.eventBus.emit(CANVAS_EVENTS.EDGES_DELETED, { seriesId });
    this.logger.info('Canvas edges deleted', { seriesId, deletedCount: result.deletedCount });

    return { success: true };
  }
}
