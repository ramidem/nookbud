import { UserService } from './user.service';

import type { Task, TaskPriority, TaskStatus } from '@/types';

const ERROR_NO_CURRENT_USER = 'No current user';
const ERROR_NOT_A_MEMBER = 'You are not a member of this Space';
const ERROR_VIEWER_CANNOT_WRITE = 'Viewers cannot create or modify tasks';
const ERROR_TASK_NOT_FOUND = 'Task not found';
const ERROR_ONLY_OWNER_DELETE = 'Only the Space owner can delete tasks';
const ERROR_NOT_IMPLEMENTED = 'Not yet implemented';

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

export const TaskService = {
  async completeTask(_taskId: string): Promise<Task> {
    // TODO: Firebase — implement with Firestore
    const userId = UserService.getCurrentUserId();
    if (!userId) throw new Error(ERROR_NO_CURRENT_USER);
    void ERROR_TASK_NOT_FOUND;
    void ERROR_NOT_A_MEMBER;
    void ERROR_VIEWER_CANNOT_WRITE;

    throw new Error(ERROR_NOT_IMPLEMENTED);
  },

  async createTask(_spaceId: string, _data: CreateTaskData): Promise<Task> {
    // TODO: Firebase — implement with Firestore
    const userId = UserService.getCurrentUserId();
    if (!userId) throw new Error(ERROR_NO_CURRENT_USER);
    void ERROR_NOT_A_MEMBER;
    void ERROR_VIEWER_CANNOT_WRITE;

    throw new Error(ERROR_NOT_IMPLEMENTED);
  },

  async deleteTask(_taskId: string): Promise<void> {
    // TODO: Firebase — implement with Firestore
    const userId = UserService.getCurrentUserId();
    if (!userId) throw new Error(ERROR_NO_CURRENT_USER);
    void ERROR_TASK_NOT_FOUND;
    void ERROR_ONLY_OWNER_DELETE;
  },

  async getById(_taskId: string): Promise<Task | null> {
    // TODO: Firebase — implement with Firestore
    return null;
  },

  async listTasks(_spaceId: string, _filters?: TaskFilters): Promise<Task[]> {
    // TODO: Firebase — implement with Firestore
    return [];
  },

  async reopenTask(_taskId: string): Promise<Task> {
    // TODO: Firebase — implement with Firestore
    const userId = UserService.getCurrentUserId();
    if (!userId) throw new Error(ERROR_NO_CURRENT_USER);
    void ERROR_TASK_NOT_FOUND;

    throw new Error(ERROR_NOT_IMPLEMENTED);
  },

  async updateTask(_taskId: string, _data: UpdateTaskData): Promise<Task> {
    // TODO: Firebase — implement with Firestore
    const userId = UserService.getCurrentUserId();
    if (!userId) throw new Error(ERROR_NO_CURRENT_USER);
    void ERROR_TASK_NOT_FOUND;

    throw new Error(ERROR_NOT_IMPLEMENTED);
  },
};
