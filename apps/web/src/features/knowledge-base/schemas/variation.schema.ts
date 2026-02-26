import z from 'zod';

export const variationFormSchema = z.object({
  scriptId: z.string().min(1, 'Script is required'),
  label: z.string().trim().min(1, 'Label is required').max(100, 'Label must be 100 characters or less'),
  notes: z.string().trim().max(500, 'Notes must be 500 characters or less'),
  age: z.union([z.string(), z.number()]).transform((val) => (val === '' ? undefined : val)),
  appearance: z.string().trim().max(500, 'Appearance must be 500 characters or less'),
  traits: z.array(z.string()),
});

export type VariationFormData = z.infer<typeof variationFormSchema>;
