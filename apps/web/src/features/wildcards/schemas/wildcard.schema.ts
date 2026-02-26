import z from 'zod';

export const wildcardFormSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(100, 'Title must be 100 characters or less'),
  body: z.string().trim().max(1000, 'Content must be 1000 characters or less'),
  tag: z.string().trim().max(50, 'Tag must be 50 characters or less'),
});

export type WildcardFormData = z.infer<typeof wildcardFormSchema>;
