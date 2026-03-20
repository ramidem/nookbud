import { z } from 'zod';

// ============================================
// EXPENSE
// ============================================
export const expenseCategorySchema = z.enum([
  'childcare',
  'medical',
  'education',
  'clothing',
  'activities',
  'food',
  'transportation',
  'other',
]);

export const splitTypeSchema = z.enum(['50/50', 'custom', 'full']);

export const expenseContentSchema = z.object({
  amount: z.number().int().positive('Amount must be positive'),
  category: expenseCategorySchema,
  currency: z.string().length(3, 'Currency must be 3-letter ISO code'),
  customSplitPercent: z.number().min(0).max(100).optional(),
  description: z.string().min(1, 'Description is required').max(500),
  paidBy: z.string().min(1, 'Paid by is required'),
  receiptAttached: z.boolean(),
  splitType: splitTypeSchema,
});

// ============================================
// EVENT
// ============================================
export const eventContentSchema = z.object({
  endTime: z.string().datetime('Invalid end time').optional(),
  location: z.string().max(500).optional(),
  notes: z.string().max(2000).optional(),
  responsibleParent: z.string().min(1, 'Responsible parent is required'),
  startTime: z.string().datetime('Invalid start time'),
  title: z.string().min(1, 'Title is required').max(200),
});

// ============================================
// AGREEMENT
// ============================================
export const agreementContentSchema = z.object({
  effectiveDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  expirationDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format')
    .optional(),
  termsText: z.string().min(1, 'Terms are required').max(10000),
  title: z.string().min(1, 'Title is required').max(200),
});

// ============================================
// COMMUNICATION
// ============================================
export const communicationImportanceSchema = z.enum(['normal', 'high']);

export const communicationContentSchema = z.object({
  body: z.string().min(1, 'Message is required').max(10000),
  importance: communicationImportanceSchema,
  subject: z.string().min(1, 'Subject is required').max(200),
});

// ============================================
// UPLOAD
// ============================================
export const documentTypeSchema = z.enum(['medical', 'school', 'legal', 'other']);

export const uploadContentSchema = z.object({
  description: z.string().max(2000).optional(),
  documentType: documentTypeSchema,
  title: z.string().min(1, 'Title is required').max(200),
});

// ============================================
// VALIDATION HELPERS
// ============================================
export function validateExpense(data: unknown) {
  return expenseContentSchema.safeParse(data);
}

export function validateEvent(data: unknown) {
  return eventContentSchema.safeParse(data);
}

export function validateAgreement(data: unknown) {
  return agreementContentSchema.safeParse(data);
}

export function validateCommunication(data: unknown) {
  return communicationContentSchema.safeParse(data);
}

export function validateUpload(data: unknown) {
  return uploadContentSchema.safeParse(data);
}

// Type exports from schemas
export type ExpenseContentSchema = z.infer<typeof expenseContentSchema>;
export type EventContentSchema = z.infer<typeof eventContentSchema>;
export type AgreementContentSchema = z.infer<typeof agreementContentSchema>;
export type CommunicationContentSchema = z.infer<typeof communicationContentSchema>;
export type UploadContentSchema = z.infer<typeof uploadContentSchema>;
