import { oc } from '@orpc/contract';
import z from 'zod';

import { canvasEdgeSchema, canvasNodeSchema } from './canvas.contract';
import {
  characterSchema,
  locationSchema,
  propSchema,
  timelineEntrySchema,
  wildCardSchema,
  appearanceSchema,
} from './knowledge-base.contract';
import { authProcedure } from './procedures';
import { scriptSummarySchema } from './scripts.contract';
import { seriesSchema } from './series.contract';

const exportScriptPdf = authProcedure
  .route({
    path: '/script-pdf',
    method: 'GET',
    summary: 'Export script as PDF',
    description:
      'Exports a screenplay-friendly PDF for a script. Implementations should stream binary data; this contract returns metadata placeholder.',
  })
  .input(z.object({ scriptId: z.string() }))
  .output(z.object({ ok: z.literal(true), fileType: z.literal('application/pdf') }));

const exportSeriesJson = authProcedure
  .route({
    path: '/series-json',
    method: 'GET',
    summary: 'Export series JSON backup',
    description: 'Exports series metadata, scripts summaries, KB entities, canvas, and continuity references as JSON.',
  })
  .input(z.object({ seriesId: z.string() }))
  .output(
    z.object({
      series: seriesSchema,
      scripts: z.array(scriptSummarySchema),
      characters: z.array(characterSchema),
      locations: z.array(locationSchema),
      props: z.array(propSchema),
      timeline: z.array(timelineEntrySchema),
      wildcards: z.array(wildCardSchema),
      appearances: z.array(appearanceSchema),
      canvas: z.object({ nodes: z.array(canvasNodeSchema), edges: z.array(canvasEdgeSchema) }),
    }),
  );

const exportContract = oc.prefix('/export').router({
  exportScriptPdf,
  exportSeriesJson,
});

export default exportContract;
