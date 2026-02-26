import z from 'zod';

export const characterRelationshipSchema = z.object({
  targetId: z.string(),
  type: z.string(),
  note: z.string().optional(),
});

export const characterAppearanceSchema = z.object({
  scriptId: z.string(),
  sceneRef: z.string(),
  locationId: z.string().optional(),
});

export const characterFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
  description: z.string().trim().max(500, 'Description must be 500 characters or less'),
  avatarUrl: z
    .string()
    .trim()
    .refine((val) => !val || z.string().url().safeParse(val).success, {
      message: 'Must be a valid URL',
    }),
  traits: z.array(z.string()),
  relationships: z.array(characterRelationshipSchema),
  appearances: z.array(characterAppearanceSchema),
});

export type CharacterFormData = z.infer<typeof characterFormSchema>;
