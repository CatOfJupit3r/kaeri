import z from 'zod';

export const sceneBeatSchema = z.object({
  order: z.number(),
  description: z.string(),
});

export const sceneFormSchema = z.object({
  scriptId: z.string().min(1, 'Script is required'),
  heading: z.string().trim().min(1, 'Heading is required').max(200, 'Heading must be 200 characters or less'),
  locationId: z.string(),
  timeOfDay: z.string(),
  duration: z.string(),
  emotionalTone: z.string(),
  conflict: z.string(),
  beats: z.array(sceneBeatSchema),
  characterIds: z.array(z.string()),
  propIds: z.array(z.string()),
  lighting: z.string(),
  sound: z.string(),
  camera: z.string(),
  storyNotes: z.string(),
  storyboardUrl: z
    .string()
    .trim()
    .refine((val) => !val || z.string().url().safeParse(val).success, {
      message: 'Must be a valid URL',
    }),
});

// Edit panel schema (without scriptId since it's not editable)
export const sceneEditSchema = z.object({
  heading: z.string().trim().min(1, 'Heading is required').max(200, 'Heading must be 200 characters or less'),
  locationId: z.string(),
  timeOfDay: z.string(),
  duration: z.string().max(50, 'Duration must be 50 characters or less'),
  emotionalTone: z.string().max(100, 'Emotional tone must be 100 characters or less'),
  conflict: z.string().max(500, 'Conflict must be 500 characters or less'),
  lighting: z.string().max(200, 'Lighting must be 200 characters or less'),
  sound: z.string().max(200, 'Sound must be 200 characters or less'),
  camera: z.string().max(200, 'Camera must be 200 characters or less'),
  storyNotes: z.string().max(2000, 'Story notes must be 2000 characters or less'),
  storyboardUrl: z.string().refine((val) => val === '' || /^https?:\/\/.+/.test(val), 'Must be a valid URL'),
  characterIds: z.array(z.string()),
  propIds: z.array(z.string()),
});

export type SceneFormData = z.infer<typeof sceneFormSchema>;
export type SceneEditData = z.infer<typeof sceneEditSchema>;
