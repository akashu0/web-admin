// src/lib/validations/faq.validation.ts
import { z } from 'zod';

// Base question schema
const questionSchema = z.object({
    question: z.string().min(5, 'Question must be at least 5 characters').max(500, 'Question must not exceed 500 characters'),
    answer: z.string().min(10, 'Answer must be at least 10 characters').max(2000, 'Answer must not exceed 2000 characters'),
    order: z.number().int().min(0),
});

// Schema for creating FAQ (used in form)
export const faqFormSchema = z.object({
    entityType: z.enum(['University', 'Course', 'Country'], {
        message: 'Entity type is required',
    }),
    title: z.string().min(1, 'Title is required').max(200, 'Title must not exceed 200 characters'),
    questions: z.array(questionSchema).min(1, 'At least one question is required'),
    status: z.enum(['active', 'inactive', 'draft']),
});

export type FAQFormData = z.infer<typeof faqFormSchema>;