import { and, desc, eq, isNull } from 'drizzle-orm';

import { AuditService } from './audit.service';
import { SpaceService } from './space.service';
import { UserService } from './user.service';

import { db } from '@/database';
import { tasks, type Task, type TaskPriority, type TaskStatus } from '@/database/schema';

const UUID_RADIX = 16;
const UUID_VARIANT_MASK = 0x3;
const UUID_VARIANT_VALUE = 0x8;

const ENTITY_TYPE_TASK = 'task' as const;
const ERROR_NO_CURRENT_USER = 'No current user';
const ERROR_NOT_A_MEMBER = 'You are not a member of this Space';
const ERROR_VIEWER_CANNOT_WRITE = 'Viewers cannot create or modify tasks';
const ERROR_TASK_NOT_FOUND = 'Task not found';
const ERROR_ONLY_OWNER_DELETE = 'Only the Space owner can delete tasks';

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * UUID_RADIX) | 0;
    const v = c === 'x' ? r : (r & UUID_VARIANT_MASK) | UUID_VARIANT_VALUE;

    return v.toString(UUID_RADIX);
  });
}

export type TaskFilters = {
  assignedTo?: string;
  childId?: string;
  status?: TaskStatus;
};

export type CreateTaskData = {
  assignedTo?: string;
  childId?: string;
  description?: string;
  dueDate?: Date;
  priority?: TaskPriority;
  title: string;
};

export type UpdateTaskData = {
  assignedTo?: string | null;
  childId?: string | null;
  description?: string | null;
  dueDate?: Date | null;
  priority?: TaskPriority;
  title?: string;
};

async function verifyWriteAccess(spaceId: string, userId: string): Promise<void> {
  const role = await SpaceService.getUserRole(spaceId, userId);
  if (!role) throw new Error(ERROR_NOT_A_MEMBER);
  if (role === 'viewer') throw new Error(ERROR_VIEWER_CANNOT_WRITE);
}

export const TaskService = {
  async completeTask(taskId: string): Promise<Task> {
    const userId = UserService.getCurrentUserId();
    if (!userId) throw new Error(ERROR_NO_CURRENT_USER);

    const task = await TaskService.getById(taskId);
    if (!task) throw new Error(ERROR_TASK_NOT_FOUND);

    await verifyWriteAccess(task.spaceId, userId);

    const now = new Date();
    await db
      .update(tasks)
      .set({ completedAt: now, completedBy: userId, status: 'done', updatedAt: now })
      .where(eq(tasks.id, taskId));

    await AuditService.log({
      action: 'update',
      entityId: taskId,
      entityType: ENTITY_TYPE_TASK,
      metadata: { previousStatus: task.status, status: 'done' },
      userId,
    });

    const [updated] = await db.select().from(tasks).where(eq(tasks.id, taskId));

    return updated;
  },

  async createTask(spaceId: string, data: CreateTaskData): Promise<Task> {
    const userId = UserService.getCurrentUserId();
    if (!userId) throw new Error(ERROR_NO_CURRENT_USER);

    await verifyWriteAccess(spaceId, userId);

    const id = generateUUID();
    const now = new Date();

    await db.insert(tasks).values({
      assignedTo: data.assignedTo ?? null,
      childId: data.childId ?? null,
      createdAt: now,
      createdBy: userId,
      description: data.description ?? null,
      dueDate: data.dueDate ?? null,
      id,
      priority: data.priority ?? 'medium',
      spaceId,
      status: 'open',
      title: data.title,
      updatedAt: now,
    });

    await AuditService.log({
      action: 'create',
      entityId: id,
      entityType: ENTITY_TYPE_TASK,
      metadata: { priority: data.priority ?? 'medium', title: data.title },
      userId,
    });

    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));

    return task;
  },

  async deleteTask(taskId: string): Promise<void> {
    const userId = UserService.getCurrentUserId();
    if (!userId) throw new Error(ERROR_NO_CURRENT_USER);

    const task = await TaskService.getById(taskId);
    if (!task) throw new Error(ERROR_TASK_NOT_FOUND);

    const role = await SpaceService.getUserRole(task.spaceId, userId);
    if (!role) throw new Error(ERROR_NOT_A_MEMBER);
    if (role !== 'owner') throw new Error(ERROR_ONLY_OWNER_DELETE);

    await db.update(tasks).set({ deletedAt: new Date() }).where(eq(tasks.id, taskId));

    await AuditService.log({
      action: 'soft_delete',
      entityId: taskId,
      entityType: ENTITY_TYPE_TASK,
      metadata: { title: task.title },
      userId,
    });
  },

  async getById(taskId: string): Promise<Task | null> {
    const [task] = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, taskId), isNull(tasks.deletedAt)));

    return task ?? null;
  },

  async listTasks(spaceId: string, filters?: TaskFilters): Promise<Task[]> {
    const conditions = [eq(tasks.spaceId, spaceId), isNull(tasks.deletedAt)];

    if (filters?.status) {
      conditions.push(eq(tasks.status, filters.status));
    }
    if (filters?.assignedTo) {
      conditions.push(eq(tasks.assignedTo, filters.assignedTo));
    }
    if (filters?.childId) {
      conditions.push(eq(tasks.childId, filters.childId));
    }

    return db
      .select()
      .from(tasks)
      .where(and(...conditions))
      .orderBy(desc(tasks.createdAt));
  },

  async reopenTask(taskId: string): Promise<Task> {
    const userId = UserService.getCurrentUserId();
    if (!userId) throw new Error(ERROR_NO_CURRENT_USER);

    const task = await TaskService.getById(taskId);
    if (!task) throw new Error(ERROR_TASK_NOT_FOUND);

    await verifyWriteAccess(task.spaceId, userId);

    const now = new Date();
    await db
      .update(tasks)
      .set({ completedAt: null, completedBy: null, status: 'open', updatedAt: now })
      .where(eq(tasks.id, taskId));

    await AuditService.log({
      action: 'update',
      entityId: taskId,
      entityType: ENTITY_TYPE_TASK,
      metadata: { previousStatus: task.status, status: 'open' },
      userId,
    });

    const [updated] = await db.select().from(tasks).where(eq(tasks.id, taskId));

    return updated;
  },

  async updateTask(taskId: string, data: UpdateTaskData): Promise<Task> {
    const userId = UserService.getCurrentUserId();
    if (!userId) throw new Error(ERROR_NO_CURRENT_USER);

    const task = await TaskService.getById(taskId);
    if (!task) throw new Error(ERROR_TASK_NOT_FOUND);

    await verifyWriteAccess(task.spaceId, userId);

    const now = new Date();
    const updates: Record<string, unknown> = { updatedAt: now };

    if (data.title !== undefined) updates.title = data.title;
    if (data.description !== undefined) updates.description = data.description;
    if (data.priority !== undefined) updates.priority = data.priority;
    if (data.dueDate !== undefined) updates.dueDate = data.dueDate;
    if (data.assignedTo !== undefined) updates.assignedTo = data.assignedTo;
    if (data.childId !== undefined) updates.childId = data.childId;

    await db.update(tasks).set(updates).where(eq(tasks.id, taskId));

    await AuditService.log({
      action: 'update',
      entityId: taskId,
      entityType: ENTITY_TYPE_TASK,
      metadata: { changes: Object.keys(updates).filter((k) => k !== 'updatedAt') },
      userId,
    });

    const [updated] = await db.select().from(tasks).where(eq(tasks.id, taskId));

    return updated;
  },
};
