import z from 'zod';

export const locationFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
  description: z.string().trim().max(500, 'Description must be 500 characters or less'),
  tags: z.array(z.string()),
  associatedCharacterIds: z.array(z.string()),
  propIds: z.array(z.string()),
  productionNotes: z.string().trim().max(1000, 'Production notes must be 1000 characters or less'),
  mood: z.string().trim().max(100, 'Mood must be 100 characters or less'),
  timeOfDay: z.array(z.string()),
});

export type LocationFormData = z.infer<typeof locationFormSchema>;
