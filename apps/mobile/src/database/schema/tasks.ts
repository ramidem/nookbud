import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { children } from './children';
import { spaces } from './spaces';
import { users } from './users';

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

export const tasks = sqliteTable('tasks', {
  assignedTo: text('assigned_to').references(() => users.id),

  childId: text('child_id').references(() => children.id),

  completedAt: integer('completed_at', { mode: 'timestamp' }),

  completedBy: text('completed_by').references(() => users.id),

  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),

  createdBy: text('created_by')
    .notNull()
    .references(() => users.id),

  deletedAt: integer('deleted_at', { mode: 'timestamp' }),

  description: text('description'),

  dueDate: integer('due_date', { mode: 'timestamp' }),

  id: text('id').primaryKey(),

  priority: text('priority').notNull().$type<TaskPriority>().default('medium'),

  spaceId: text('space_id')
    .notNull()
    .references(() => spaces.id),

  status: text('status').notNull().$type<TaskStatus>().default('open'),

  title: text('title').notNull(),

  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
