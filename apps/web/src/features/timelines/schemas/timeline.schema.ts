import z from 'zod';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const timelineFormSchema = z.object({
  label: z.string().trim().min(1, 'Label is required').max(200, 'Label must be 200 characters or less'),
  timestamp: z
    .string()
    .trim()
    .refine((val) => !val || DATE_REGEX.test(val), {
      message: 'Use YYYY-MM-DD format',
    }),
});

export type TimelineFormData = z.infer<typeof timelineFormSchema>;
