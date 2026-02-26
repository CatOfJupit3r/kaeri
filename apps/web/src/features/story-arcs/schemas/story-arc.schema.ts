import z from 'zod';

export const storyArcStatusSchema = z.enum(['planned', 'in_progress', 'completed', 'abandoned']);

export const storyArcFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
  description: z.string().trim().max(1000, 'Description must be 1000 characters or less'),
  status: storyArcStatusSchema,
  startScriptId: z.string(),
  endScriptId: z.string(),
  resolution: z.string().trim().max(1000, 'Resolution must be 1000 characters or less'),
});

export type StoryArcFormData = z.infer<typeof storyArcFormSchema>;
export type StoryArcStatus = z.infer<typeof storyArcStatusSchema>;
