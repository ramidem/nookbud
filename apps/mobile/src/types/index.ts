/**
 * NookBud — TypeScript interfaces for Firebase/Firestore
 * Replaces Drizzle ORM schema types after SQLite removal.
 * These mirror the Firestore document schemas in docs/firebase-spec.md
 */

// Re-export pre-existing component and entry-content types
export * from './component.type';
export * from './entry-content.types';

// ---------------------------------------------------------------------------
// Shared
// ---------------------------------------------------------------------------

/** Firebase Timestamp (compatible with Date or Firestore Timestamp) */
export type Timestamp = Date;

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export const USER_ROLES = ['mother', 'father', 'guardian', 'other'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const USER_ROLE_DISPLAY: Record<UserRole, string> = {
  father: 'Father',
  guardian: 'Guardian',
  mother: 'Mother',
  other: 'Other',
};

export interface User {
  id: string; // Firebase Auth UID
  firstName: string;
  lastName: string;
  middleName?: string;
  email?: string;
  role?: UserRole;
  timezone: string;
  defaultCurrency: string;
  createdAt: Timestamp;
  // Legacy compat
  displayName?: string;
}

export type NewUser = Omit<User, 'createdAt'> & { createdAt?: Timestamp };

// ---------------------------------------------------------------------------
// Spaces
// ---------------------------------------------------------------------------

export interface Space {
  id: string;
  name: string;
  emoji: string;
  color: string;
  createdBy: string; // userId
  createdAt: Timestamp;
  updatedAt: Timestamp;
  archivedAt?: Timestamp | null;
}

export type NewSpace = Omit<Space, 'id' | 'createdAt' | 'updatedAt'> & {
  id?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

// ---------------------------------------------------------------------------
// Space Members
// ---------------------------------------------------------------------------

export const SPACE_ROLES = ['owner', 'editor', 'viewer'] as const;
export type SpaceRole = (typeof SPACE_ROLES)[number];

export const SPACE_MEMBER_LABELS = [
  'co-parent',
  'guardian',
  'grandparent',
  'relative',
  'lawyer',
  'social-worker',
  'assistant',
  'other',
] as const;

export type SpaceMemberLabel = (typeof SPACE_MEMBER_LABELS)[number];

export const SPACE_MEMBER_LABEL_DISPLAY: Record<SpaceMemberLabel, string> = {
  assistant: 'Assistant',
  'co-parent': 'Co-parent',
  grandparent: 'Grandparent',
  guardian: 'Guardian',
  lawyer: 'Lawyer',
  other: 'Other',
  relative: 'Relative',
  'social-worker': 'Social Worker',
};

export interface SpaceMember {
  id: string;
  userId: string;
  spaceId: string;
  role: SpaceRole;
  label?: SpaceMemberLabel;
  invitedBy?: string; // userId
  joinedAt: Timestamp;
}

export type NewSpaceMember = Omit<SpaceMember, 'id' | 'joinedAt'> & {
  id?: string;
  joinedAt?: Timestamp;
};

// ---------------------------------------------------------------------------
// Children
// ---------------------------------------------------------------------------

export const CHILD_ROLES = [
  'father',
  'mother',
  'step-father',
  'step-mother',
  'grandfather',
  'grandmother',
  'guardian',
  'foster-parent',
  'aunt-uncle',
  'other',
] as const;

export type ChildRole = (typeof CHILD_ROLES)[number];

export const CHILD_ROLE_DISPLAY: Record<ChildRole, string> = {
  'aunt-uncle': 'Aunt / Uncle',
  father: 'Father',
  'foster-parent': 'Foster Parent',
  grandfather: 'Grandfather',
  grandmother: 'Grandmother',
  guardian: 'Guardian',
  mother: 'Mother',
  other: 'Other',
  'step-father': 'Step-father',
  'step-mother': 'Step-mother',
};

export interface Child {
  id: string;
  spaceId: string;
  name: string;
  dateOfBirth?: Timestamp;
  role?: ChildRole;
  createdAt: Timestamp;
}

export type NewChild = Omit<Child, 'id' | 'createdAt'> & { id?: string; createdAt?: Timestamp };

// ---------------------------------------------------------------------------
// Entries
// ---------------------------------------------------------------------------

export const ENTRY_TYPES = ['expense', 'event', 'agreement', 'communication', 'upload'] as const;
export type EntryType = (typeof ENTRY_TYPES)[number];

export const ENTRY_STATUSES = ['active', 'soft_deleted'] as const;
export type EntryStatus = (typeof ENTRY_STATUSES)[number];

export interface Entry {
  id: string;
  spaceId: string;
  childId?: string | null;
  type: EntryType;
  status: EntryStatus;
  createdBy: string; // userId
  currentVersionId: string;
  createdAt: Timestamp;
}

export type NewEntry = Omit<Entry, 'id' | 'createdAt'> & { id?: string; createdAt?: Timestamp };

// ---------------------------------------------------------------------------
// Entry Versions
// ---------------------------------------------------------------------------

export interface EntryVersion {
  id: string;
  entryId: string;
  versionNumber: number;
  contentJson: string; // JSON string of typed content
  diffJson?: string | null; // JSON diff from previous version
  createdBy: string; // userId
  createdAt: Timestamp;
}

export type NewEntryVersion = Omit<EntryVersion, 'id' | 'createdAt'> & {
  id?: string;
  createdAt?: Timestamp;
};

// ---------------------------------------------------------------------------
// Attachments
// ---------------------------------------------------------------------------

export interface Attachment {
  id: string;
  entryVersionId: string;
  originalFilename: string;
  mimeType: string;
  fileSizeBytes: number;
  fileHash: string; // SHA-256
  storagePath: string; // Firebase Storage path
  uploadedBy: string; // userId
  uploadedAt: Timestamp;
}

export type NewAttachment = Omit<Attachment, 'id' | 'uploadedAt'> & {
  id?: string;
  uploadedAt?: Timestamp;
};

// ---------------------------------------------------------------------------
// Acknowledgments
// ---------------------------------------------------------------------------

export const ACKNOWLEDGMENT_STATUSES = ['pending', 'acknowledged', 'disputed'] as const;
export type AcknowledgmentStatus = (typeof ACKNOWLEDGMENT_STATUSES)[number];

export interface Acknowledgment {
  id: string;
  entryId: string;
  status: AcknowledgmentStatus;
  actedBy?: string | null; // userId
  comment?: string | null;
  createdAt: Timestamp;
}

export type NewAcknowledgment = Omit<Acknowledgment, 'id' | 'createdAt'> & {
  id?: string;
  createdAt?: Timestamp;
};

// ---------------------------------------------------------------------------
// Disputes
// ---------------------------------------------------------------------------

export interface Dispute {
  id: string;
  entryId: string;
  raisedBy: string; // userId
  reasonText: string;
  createdAt: Timestamp;
}

export interface DisputeResponse {
  id: string;
  disputeId: string;
  respondedBy: string; // userId
  responseText: string;
  createdAt: Timestamp;
}

export type NewDispute = Omit<Dispute, 'id' | 'createdAt'> & { id?: string; createdAt?: Timestamp };
export type NewDisputeResponse = Omit<DisputeResponse, 'id' | 'createdAt'> & {
  id?: string;
  createdAt?: Timestamp;
};

// ---------------------------------------------------------------------------
// Audit Logs
// ---------------------------------------------------------------------------

export const AUDIT_ACTIONS = [
  'create',
  'update',
  'soft_delete',
  'delete',
  'leave',
  'acknowledge',
  'dispute',
  'respond',
  'generate_invite',
  'accept_invite',
  'assign_role',
  'remove_member',
  'transfer_ownership',
  'upload',
  'archive',
  'unarchive',
] as const;
export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export const AUDIT_ENTITY_TYPES = [
  'user',
  'relationship',
  'space',
  'child',
  'entry',
  'attachment',
  'acknowledgment',
  'dispute',
  'dispute_response',
  'resource',
  'task',
] as const;
export type AuditEntityType = (typeof AUDIT_ENTITY_TYPES)[number];

export interface AuditLog {
  id: string;
  userId: string;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  metadataJson?: string | null;
  createdAt: Timestamp;
}

export type NewAuditLog = Omit<AuditLog, 'id' | 'createdAt'> & {
  id?: string;
  createdAt?: Timestamp;
};

// ---------------------------------------------------------------------------
// Resources
// ---------------------------------------------------------------------------

export const RESOURCE_CATEGORIES = [
  'medical',
  'school',
  'legal',
  'financial',
  'identity',
  'insurance',
  'other',
] as const;
export type ResourceCategory = (typeof RESOURCE_CATEGORIES)[number];

export const RESOURCE_CATEGORY_DISPLAY: Record<ResourceCategory, string> = {
  financial: 'Financial',
  identity: 'Identity',
  insurance: 'Insurance',
  legal: 'Legal',
  medical: 'Medical',
  other: 'Other',
  school: 'School',
};

export interface Resource {
  id: string;
  spaceId: string;
  childId?: string | null;
  title: string;
  description?: string | null;
  category: ResourceCategory;
  originalFilename: string;
  mimeType: string;
  fileSizeBytes: number;
  fileHash: string;
  storagePath: string; // Firebase Storage path
  uploadedBy: string; // userId
  createdAt: Timestamp;
  deletedAt?: Timestamp | null;
}

export type NewResource = Omit<Resource, 'id' | 'createdAt'> & {
  id?: string;
  createdAt?: Timestamp;
};

// ---------------------------------------------------------------------------
// Tasks
// ---------------------------------------------------------------------------

export const TASK_STATUSES = ['open', 'in_progress', 'done'] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_STATUS_DISPLAY: Record<TaskStatus, string> = {
  done: 'Done',
  in_progress: 'In Progress',
  open: 'Open',
};

export const TASK_PRIORITIES = ['low', 'medium', 'high'] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export const TASK_PRIORITY_DISPLAY: Record<TaskPriority, string> = {
  high: 'High',
  low: 'Low',
  medium: 'Medium',
};

export interface Task {
  id: string;
  spaceId: string;
  childId?: string | null;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo?: string | null; // userId
  dueDate?: Timestamp | null;
  completedBy?: string | null; // userId
  completedAt?: Timestamp | null;
  createdBy: string; // userId
  createdAt: Timestamp;
  updatedAt: Timestamp;
  deletedAt?: Timestamp | null;
}

export type NewTask = Omit<Task, 'id' | 'createdAt' | 'updatedAt'> & {
  id?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

// ---------------------------------------------------------------------------
// Legacy compat — Relationship (bridges old 2-parent model to Spaces)
// ---------------------------------------------------------------------------

export interface Relationship {
  id: string;
  parentAId: string;
  parentBId: string | null;
  inviteToken: string | null;
  inviteExpiresAt: Date | null;
  createdAt: Date;
}
