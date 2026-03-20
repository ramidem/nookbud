import { z } from 'zod';

// ============================================
// SCHEMA CONSTANTS
// ============================================
const CURRENCY_CODE_LENGTH = 3;
const MAX_DESCRIPTION_LENGTH = 500;
const MAX_LOCATION_LENGTH = 500;
const MAX_NOTES_LENGTH = 2000;
const MAX_TITLE_LENGTH = 200;
const MAX_TERMS_LENGTH = 10000;
const MAX_BODY_LENGTH = 10000;
const INVALID_DATE_FORMAT = 'Invalid date format';
const TITLE_REQUIRED = TITLE_REQUIRED;

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
  currency: z.string().length(CURRENCY_CODE_LENGTH, 'Currency must be 3-letter ISO code'),
  customSplitPercent: z.number().min(0).max(100).optional(),
  description: z.string().min(1, 'Description is required').max(MAX_DESCRIPTION_LENGTH),
  paidBy: z.string().min(1, 'Paid by is required'),
  receiptAttached: z.boolean(),
  splitType: splitTypeSchema,
});

// ============================================
// EVENT
// ============================================
export const eventContentSchema = z.object({
  endTime: z.string().datetime('Invalid end time').optional(),
  location: z.string().max(MAX_LOCATION_LENGTH).optional(),
  notes: z.string().max(MAX_NOTES_LENGTH).optional(),
  responsibleParent: z.string().min(1, 'Responsible parent is required'),
  startTime: z.string().datetime('Invalid start time'),
  title: z.string().min(1, TITLE_REQUIRED).max(MAX_TITLE_LENGTH),
});

// ============================================
// AGREEMENT
// ============================================
export const agreementContentSchema = z.object({
  effectiveDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, INVALID_DATE_FORMAT),
  expirationDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, INVALID_DATE_FORMAT)
    .optional(),
  termsText: z.string().min(1, 'Terms are required').max(MAX_TERMS_LENGTH),
  title: z.string().min(1, TITLE_REQUIRED).max(MAX_TITLE_LENGTH),
});

// ============================================
// COMMUNICATION
// ============================================
export const communicationImportanceSchema = z.enum(['normal', 'high']);

export const communicationContentSchema = z.object({
  body: z.string().min(1, 'Message is required').max(MAX_BODY_LENGTH),
  importance: communicationImportanceSchema,
  subject: z.string().min(1, 'Subject is required').max(MAX_TITLE_LENGTH),
});

// ============================================
// UPLOAD
// ============================================
export const documentTypeSchema = z.enum(['medical', 'school', 'legal', 'other']);

export const uploadContentSchema = z.object({
  description: z.string().max(MAX_NOTES_LENGTH).optional(),
  documentType: documentTypeSchema,
  title: z.string().min(1, TITLE_REQUIRED).max(MAX_TITLE_LENGTH),
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
