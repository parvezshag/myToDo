import { invoke } from '@tauri-apps/api/core';
import type { Task, TaskHistory } from '@/types/task';

export const taskService = {
  getAll: () => invoke<Task[]>('get_tasks'),

  getById: (id: string) => invoke<Task>('get_task_by_id', { id }),

  getHistory: (taskId?: string) => invoke<TaskHistory[]>('get_task_history', { taskId: taskId ?? null }),

  count: () => invoke<number>('count_tasks'),

  seedSample: () => invoke<number>('seed_sample_tasks'),

  exportTasks: () => invoke<{ tasks: Task[]; history: TaskHistory[] }>('export_tasks'),

  importTasks: (data: { tasks: Task[]; history: TaskHistory[] }) =>
    invoke('import_tasks', { data }),
};
