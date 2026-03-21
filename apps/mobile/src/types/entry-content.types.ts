/**
 * Entry content types for all 5 entry types.
 * These define the structure of content_json in entry_versions.
 */

// ============================================
// EXPENSE
// ============================================
export type ExpenseCategory =
  | 'childcare'
  | 'medical'
  | 'education'
  | 'clothing'
  | 'activities'
  | 'food'
  | 'transportation'
  | 'other';

export type SplitType = '50/50' | 'custom' | 'full';

export type ExpenseContent = {
  /** Amount in minor units (cents/pence) */
  amount: number;
  /** ISO 4217 currency code */
  currency: string;
  /** Description of the expense */
  description: string;
  /** Category */
  category: ExpenseCategory;
  /** Who paid - 'me' or other parent's user ID */
  paidBy: string;
  /** How to split the expense */
  splitType: SplitType;
  /** Custom split percentage (0-100) when splitType is 'custom' */
  customSplitPercent?: number;
  /** Whether a receipt is attached */
  receiptAttached: boolean;
};

// ============================================
// EVENT
// ============================================
export type EventContent = {
  /** Event title */
  title: string;
  /** Start date/time (ISO string) */
  startTime: string;
  /** End date/time (ISO string, optional) */
  endTime?: string;
  /** Location (free text) */
  location?: string;
  /** Responsible parent user ID */
  responsibleParent: string;
  /** Additional notes */
  notes?: string;
};

// ============================================
// AGREEMENT
// ============================================
export type AgreementContent = {
  /** Agreement title */
  title: string;
  /** Full terms text */
  termsText: string;
  /** When the agreement takes effect (ISO date string) */
  effectiveDate: string;
  /** When the agreement expires (ISO date string, optional) */
  expirationDate?: string;
};

// ============================================
// COMMUNICATION
// ============================================
export type CommunicationImportance = 'normal' | 'high';

export type CommunicationContent = {
  /** Subject line */
  subject: string;
  /** Message body */
  body: string;
  /** Importance level */
  importance: CommunicationImportance;
};

// ============================================
// UPLOAD
// ============================================
export type DocumentType = 'medical' | 'school' | 'legal' | 'other';

export type UploadContent = {
  /** Document title */
  title: string;
  /** Description */
  description?: string;
  /** Document type */
  documentType: DocumentType;
};

// ============================================
// UNION TYPE
// ============================================
export type EntryContent =
  | { type: 'expense'; data: ExpenseContent }
  | { type: 'event'; data: EventContent }
  | { type: 'agreement'; data: AgreementContent }
  | { type: 'communication'; data: CommunicationContent }
  | { type: 'upload'; data: UploadContent };
