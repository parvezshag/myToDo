export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'archived' | 'hold';
export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';
export type TaskProgress = 0 | 25 | 50 | 75 | 100;

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  category: string;
  tags: string[];
  progress: TaskProgress;
  notes: string;
  estimated_time: number | null;
  actual_time: number | null;
  color: string;
  is_pinned: boolean;
  is_recurring: boolean;
  recurring_rule: string;
  parent_id: string | null;
  dependencies: string[];
  order_index: number;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  archived_at: string | null;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  due_date?: string | null;
  category?: string;
  tags?: string[];
  progress?: TaskProgress;
  notes?: string;
  estimated_time?: number | null;
  color?: string;
  parent_id?: string | null;
  dependencies?: string[];
}

export interface UpdateTaskInput {
  id: string;
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  due_date?: string | null;
  category?: string;
  tags?: string[];
  progress?: TaskProgress;
  notes?: string;
  estimated_time?: number | null;
  actual_time?: number | null;
  color?: string;
  is_pinned?: boolean;
  is_recurring?: boolean;
  recurring_rule?: string;
  parent_id?: string | null;
  dependencies?: string[];
  order_index?: number;
}

export interface ReorderInput {
  id: string;
  status: TaskStatus;
  order_index: number;
}

export interface TaskHistory {
  id: string;
  task_id: string;
  action: string;
  old_value: string | null;
  new_value: string | null;
  timestamp: string;
}
