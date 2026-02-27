import z from 'zod';

export const characterConnectionSchema = z.object({
  characterId: z.string(),
  connection: z.string(),
});

export const themeEvolutionSchema = z.object({
  scriptId: z.string(),
  notes: z.string(),
});

export const themeFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
  description: z.string().trim().max(1000, 'Description must be 1000 characters or less'),
  color: z.string().trim(),
  visualMotifs: z.array(z.string()),
  relatedCharacters: z.array(characterConnectionSchema),
  evolution: z.array(themeEvolutionSchema),
});

export const themeEditSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
  description: z.string().trim().max(1000, 'Description must be 1000 characters or less'),
  color: z
    .string()
    .refine((val) => val === '' || /^#[0-9A-Fa-f]{6}$/.test(val), 'Color must be a valid hex color (e.g., #FF5733)'),
  visualMotifs: z.array(z.string()),
  relatedCharacters: z.array(characterConnectionSchema),
  evolution: z.array(themeEvolutionSchema),
});

export type CharacterConnection = z.infer<typeof characterConnectionSchema>;
export type ThemeEvolution = z.infer<typeof themeEvolutionSchema>;
export type ThemeFormData = z.infer<typeof themeFormSchema>;
export type ThemeEditData = z.infer<typeof themeEditSchema>;
