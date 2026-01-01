import { call } from '@orpc/server';
import { it, expect, describe } from 'bun:test';

import { appRouter } from './helpers/instance';
import { createUser } from './helpers/utilities';

describe('Canvas API', () => {
  describe('getCanvas', () => {
    it('should return empty canvas for new series', async () => {
      const { ctx } = await createUser();

      const series = await call(appRouter.series.createSeries, { title: 'Test Series' }, ctx());

      const canvas = await call(appRouter.canvas.getCanvas, { seriesId: series._id }, ctx());

      expect(canvas.nodes).toBeArray();
      expect(canvas.nodes.length).toBe(0);
      expect(canvas.edges).toBeArray();
      expect(canvas.edges.length).toBe(0);
    });

    it('should fail when series does not exist', async () => {
      const { ctx } = await createUser();

      try {
        await call(appRouter.canvas.getCanvas, { seriesId: '507f1f77bcf86cd799439011' }, ctx());
        expect(true).toBe(false);
      } catch (error: any) {
        expect(error.code).toBe('NOT_FOUND');
      }
    });
  });

  describe('upsertNodes', () => {
    it('should create new nodes', async () => {
      const { ctx } = await createUser();

      const series = await call(appRouter.series.createSeries, { title: 'Test Series' }, ctx());

      const nodes = [
        {
          _id: 'node-1',
          seriesId: series._id,
          type: 'text' as const,
          content: 'Main idea',
          position: { x: 100, y: 100 },
        },
        {
          _id: 'node-2',
          seriesId: series._id,
          type: 'shape' as const,
          content: 'Box',
          position: { x: 200, y: 200 },
        },
      ];

      const result = await call(appRouter.canvas.upsertNodes, { seriesId: series._id, nodes }, ctx());

      expect(result.length).toBe(2);
      expect(result.find((n) => n._id === 'node-1')).toBeDefined();
      expect(result.find((n) => n._id === 'node-2')).toBeDefined();
    });

    it('should update existing nodes', async () => {
      const { ctx } = await createUser();

      const series = await call(appRouter.series.createSeries, { title: 'Test Series' }, ctx());

      // Create initial node
      await call(
        appRouter.canvas.upsertNodes,
        {
          seriesId: series._id,
          nodes: [
            {
              _id: 'node-1',
              seriesId: series._id,
              type: 'text' as const,
              content: 'Original content',
              position: { x: 0, y: 0 },
            },
          ],
        },
        ctx(),
      );

      // Update the node
      const result = await call(
        appRouter.canvas.upsertNodes,
        {
          seriesId: series._id,
          nodes: [
            {
              _id: 'node-1',
              seriesId: series._id,
              type: 'text' as const,
              content: 'Updated content',
              position: { x: 50, y: 50 },
            },
          ],
        },
        ctx(),
      );

      expect(result.length).toBe(1);
      expect(result[0].content).toBe('Updated content');
      expect(result[0].position.x).toBe(50);
      expect(result[0].position.y).toBe(50);

      // Verify only one node exists
      const canvas = await call(appRouter.canvas.getCanvas, { seriesId: series._id }, ctx());
      expect(canvas.nodes.length).toBe(1);
    });

    it('should create nodes with style property', async () => {
      const { ctx } = await createUser();

      const series = await call(appRouter.series.createSeries, { title: 'Test Series' }, ctx());

      const nodes = [
        {
          _id: 'styled-node',
          seriesId: series._id,
          type: 'note' as const,
          content: 'Styled note',
          position: { x: 100, y: 100 },
          style: { color: '#ff0000', fontSize: 14, backgroundColor: '#ffffff' },
        },
      ];

      const result = await call(appRouter.canvas.upsertNodes, { seriesId: series._id, nodes }, ctx());

      expect(result[0].style).toEqual({ color: '#ff0000', fontSize: 14, backgroundColor: '#ffffff' });
    });

    it('should fail when series does not exist', async () => {
      const { ctx } = await createUser();

      try {
        await call(
          appRouter.canvas.upsertNodes,
          {
            seriesId: '507f1f77bcf86cd799439011',
            nodes: [
              {
                _id: 'node-1',
                seriesId: '507f1f77bcf86cd799439011',
                type: 'text' as const,
                content: 'Test',
                position: { x: 0, y: 0 },
              },
            ],
          },
          ctx(),
        );
        expect(true).toBe(false);
      } catch (error: any) {
        expect(error.code).toBe('NOT_FOUND');
      }
    });

    it('should update series lastEditedAt', async () => {
      const { ctx } = await createUser();

      const series = await call(appRouter.series.createSeries, { title: 'Test Series' }, ctx());

      await new Promise((r) => setTimeout(r, 10));

      await call(
        appRouter.canvas.upsertNodes,
        {
          seriesId: series._id,
          nodes: [
            {
              _id: 'node-1',
              seriesId: series._id,
              type: 'text' as const,
              content: 'Test',
              position: { x: 0, y: 0 },
            },
          ],
        },
        ctx(),
      );

      const updatedSeries = await call(appRouter.series.getSeries, { seriesId: series._id }, ctx());

      expect(new Date(updatedSeries.lastEditedAt).getTime()).toBeGreaterThan(new Date(series.lastEditedAt).getTime());
    });
  });

  describe('upsertEdges', () => {
    it('should create new edges', async () => {
      const { ctx } = await createUser();

      const series = await call(appRouter.series.createSeries, { title: 'Test Series' }, ctx());

      // First create nodes
      await call(
        appRouter.canvas.upsertNodes,
        {
          seriesId: series._id,
          nodes: [
            { _id: 'node-1', seriesId: series._id, type: 'text' as const, content: 'A', position: { x: 0, y: 0 } },
            { _id: 'node-2', seriesId: series._id, type: 'text' as const, content: 'B', position: { x: 100, y: 100 } },
          ],
        },
        ctx(),
      );

      const edges = [
        {
          _id: 'edge-1',
          seriesId: series._id,
          sourceId: 'node-1',
          targetId: 'node-2',
          label: 'connects to',
        },
      ];

      const result = await call(appRouter.canvas.upsertEdges, { seriesId: series._id, edges }, ctx());

      expect(result.length).toBe(1);
      expect(result[0].sourceId).toBe('node-1');
      expect(result[0].targetId).toBe('node-2');
      expect(result[0].label).toBe('connects to');
    });

    it('should update existing edges', async () => {
      const { ctx } = await createUser();

      const series = await call(appRouter.series.createSeries, { title: 'Test Series' }, ctx());

      // Create initial edge
      await call(
        appRouter.canvas.upsertEdges,
        {
          seriesId: series._id,
          edges: [{ _id: 'edge-1', seriesId: series._id, sourceId: 'A', targetId: 'B', label: 'original' }],
        },
        ctx(),
      );

      // Update the edge
      const result = await call(
        appRouter.canvas.upsertEdges,
        {
          seriesId: series._id,
          edges: [{ _id: 'edge-1', seriesId: series._id, sourceId: 'A', targetId: 'C', label: 'updated' }],
        },
        ctx(),
      );

      expect(result.length).toBe(1);
      expect(result[0].targetId).toBe('C');
      expect(result[0].label).toBe('updated');
    });

    it('should fail when series does not exist', async () => {
      const { ctx } = await createUser();

      try {
        await call(
          appRouter.canvas.upsertEdges,
          {
            seriesId: '507f1f77bcf86cd799439011',
            edges: [{ _id: 'edge-1', seriesId: '507f1f77bcf86cd799439011', sourceId: 'A', targetId: 'B' }],
          },
          ctx(),
        );
        expect(true).toBe(false);
      } catch (error: any) {
        expect(error.code).toBe('NOT_FOUND');
      }
    });
  });

  describe('deleteNodes', () => {
    it('should delete existing nodes', async () => {
      const { ctx } = await createUser();

      const series = await call(appRouter.series.createSeries, { title: 'Test Series' }, ctx());

      await call(
        appRouter.canvas.upsertNodes,
        {
          seriesId: series._id,
          nodes: [
            { _id: 'node-1', seriesId: series._id, type: 'text' as const, content: 'A', position: { x: 0, y: 0 } },
            { _id: 'node-2', seriesId: series._id, type: 'text' as const, content: 'B', position: { x: 100, y: 0 } },
          ],
        },
        ctx(),
      );

      const result = await call(appRouter.canvas.deleteNodes, { seriesId: series._id, nodeIds: ['node-1'] }, ctx());

      expect(result.success).toBe(true);

      const canvas = await call(appRouter.canvas.getCanvas, { seriesId: series._id }, ctx());

      expect(canvas.nodes.length).toBe(1);
      expect(canvas.nodes[0]._id).toBe('node-2');
    });

    it('should delete multiple nodes', async () => {
      const { ctx } = await createUser();

      const series = await call(appRouter.series.createSeries, { title: 'Test Series' }, ctx());

      await call(
        appRouter.canvas.upsertNodes,
        {
          seriesId: series._id,
          nodes: [
            { _id: 'node-1', seriesId: series._id, type: 'text' as const, content: 'A', position: { x: 0, y: 0 } },
            { _id: 'node-2', seriesId: series._id, type: 'text' as const, content: 'B', position: { x: 100, y: 0 } },
            { _id: 'node-3', seriesId: series._id, type: 'text' as const, content: 'C', position: { x: 200, y: 0 } },
          ],
        },
        ctx(),
      );

      await call(appRouter.canvas.deleteNodes, { seriesId: series._id, nodeIds: ['node-1', 'node-3'] }, ctx());

      const canvas = await call(appRouter.canvas.getCanvas, { seriesId: series._id }, ctx());

      expect(canvas.nodes.length).toBe(1);
      expect(canvas.nodes[0]._id).toBe('node-2');
    });

    it('should succeed even when nodeIds do not exist', async () => {
      const { ctx } = await createUser();

      const series = await call(appRouter.series.createSeries, { title: 'Test Series' }, ctx());

      const result = await call(
        appRouter.canvas.deleteNodes,
        { seriesId: series._id, nodeIds: ['non-existent'] },
        ctx(),
      );

      expect(result.success).toBe(true);
    });

    it('should fail when series does not exist', async () => {
      const { ctx } = await createUser();

      try {
        await call(appRouter.canvas.deleteNodes, { seriesId: '507f1f77bcf86cd799439011', nodeIds: ['node-1'] }, ctx());
        expect(true).toBe(false);
      } catch (error: any) {
        expect(error.code).toBe('NOT_FOUND');
      }
    });
  });

  describe('deleteEdges', () => {
    it('should delete existing edges', async () => {
      const { ctx } = await createUser();

      const series = await call(appRouter.series.createSeries, { title: 'Test Series' }, ctx());

      await call(
        appRouter.canvas.upsertEdges,
        {
          seriesId: series._id,
          edges: [
            { _id: 'edge-1', seriesId: series._id, sourceId: 'A', targetId: 'B' },
            { _id: 'edge-2', seriesId: series._id, sourceId: 'B', targetId: 'C' },
          ],
        },
        ctx(),
      );

      const result = await call(appRouter.canvas.deleteEdges, { seriesId: series._id, edgeIds: ['edge-1'] }, ctx());

      expect(result.success).toBe(true);

      const canvas = await call(appRouter.canvas.getCanvas, { seriesId: series._id }, ctx());

      expect(canvas.edges.length).toBe(1);
      expect(canvas.edges[0]._id).toBe('edge-2');
    });

    it('should fail when series does not exist', async () => {
      const { ctx } = await createUser();

      try {
        await call(appRouter.canvas.deleteEdges, { seriesId: '507f1f77bcf86cd799439011', edgeIds: ['edge-1'] }, ctx());
        expect(true).toBe(false);
      } catch (error: any) {
        expect(error.code).toBe('NOT_FOUND');
      }
    });
  });

  describe('Canvas Persistence', () => {
    it('should persist canvas state between retrievals', async () => {
      const { ctx } = await createUser();

      const series = await call(appRouter.series.createSeries, { title: 'Test Series' }, ctx());

      // Add nodes and edges
      await call(
        appRouter.canvas.upsertNodes,
        {
          seriesId: series._id,
          nodes: [
            { _id: 'node-1', seriesId: series._id, type: 'text' as const, content: 'Idea 1', position: { x: 0, y: 0 } },
            {
              _id: 'node-2',
              seriesId: series._id,
              type: 'shape' as const,
              content: 'Box',
              position: { x: 100, y: 100 },
            },
          ],
        },
        ctx(),
      );

      await call(
        appRouter.canvas.upsertEdges,
        {
          seriesId: series._id,
          edges: [{ _id: 'edge-1', seriesId: series._id, sourceId: 'node-1', targetId: 'node-2', label: 'leads to' }],
        },
        ctx(),
      );

      // Retrieve and verify
      const canvas = await call(appRouter.canvas.getCanvas, { seriesId: series._id }, ctx());

      expect(canvas.nodes.length).toBe(2);
      expect(canvas.edges.length).toBe(1);
      expect(canvas.nodes.find((n) => n._id === 'node-1')?.content).toBe('Idea 1');
      expect(canvas.nodes.find((n) => n._id === 'node-2')?.type).toBe('shape');
      expect(canvas.edges[0].label).toBe('leads to');
    });

    it('should isolate canvas between different series', async () => {
      const { ctx } = await createUser();

      const series1 = await call(appRouter.series.createSeries, { title: 'Series 1' }, ctx());

      const series2 = await call(appRouter.series.createSeries, { title: 'Series 2' }, ctx());

      await call(
        appRouter.canvas.upsertNodes,
        {
          seriesId: series1._id,
          nodes: [
            {
              _id: 'node-s1',
              seriesId: series1._id,
              type: 'text' as const,
              content: 'Series 1 node',
              position: { x: 0, y: 0 },
            },
          ],
        },
        ctx(),
      );

      await call(
        appRouter.canvas.upsertNodes,
        {
          seriesId: series2._id,
          nodes: [
            {
              _id: 'node-s2',
              seriesId: series2._id,
              type: 'note' as const,
              content: 'Series 2 node',
              position: { x: 0, y: 0 },
            },
          ],
        },
        ctx(),
      );

      const canvas1 = await call(appRouter.canvas.getCanvas, { seriesId: series1._id }, ctx());

      const canvas2 = await call(appRouter.canvas.getCanvas, { seriesId: series2._id }, ctx());

      expect(canvas1.nodes.length).toBe(1);
      expect(canvas1.nodes[0]._id).toBe('node-s1');

      expect(canvas2.nodes.length).toBe(1);
      expect(canvas2.nodes[0]._id).toBe('node-s2');
    });
  });
});
