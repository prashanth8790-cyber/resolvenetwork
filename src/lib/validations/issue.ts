import { z } from 'zod';

export const createIssueSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  categoryId: z.string().min(1, 'Category is required'),
  wardId: z.string().min(1, 'Ward is required'),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  address: z.string().min(3, 'Address is required'),
  images: z.array(z.string().url('Invalid image URL')).max(3, 'Maximum 3 images allowed').optional().default([]),
});

export const updateIssueStatusSchema = z.object({
  status: z.enum([
    'SUBMITTED',
    'UNDER_REVIEW',
    'VERIFIED',
    'ASSIGNED',
    'IN_PROGRESS',
    'RESOLVED',
    'CLOSED',
    'REJECTED',
    'REOPENED',
  ]),
  assignedToId: z.string().optional(),
  beforeImage: z.string().optional(),
  afterImage: z.string().optional(),
  note: z.string().optional(),
  reopenReason: z.string().optional(),
});

export const createCommentSchema = z.object({
  text: z.string().min(1, 'Comment text cannot be empty').max(1000),
});

export type CreateIssueInput = z.infer<typeof createIssueSchema>;
export type UpdateIssueStatusInput = z.infer<typeof updateIssueStatusSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
