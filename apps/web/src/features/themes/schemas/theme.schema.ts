import z from 'zod';

export const themeFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
  description: z.string().trim().max(1000, 'Description must be 1000 characters or less'),
  color: z.string().trim(),
  visualMotifs: z.array(z.string()),
});

export const themeEditSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
  description: z.string().trim().max(1000, 'Description must be 1000 characters or less'),
  color: z
    .string()
    .refine((val) => val === '' || /^#[0-9A-Fa-f]{6}$/.test(val), 'Color must be a valid hex color (e.g., #FF5733)'),
});

export type ThemeFormData = z.infer<typeof themeFormSchema>;
export type ThemeEditData = z.infer<typeof themeEditSchema>;
