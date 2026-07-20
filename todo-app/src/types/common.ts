import type { TaskPriority } from './task';

export interface DropResult {
  id: string;
  source: { status: string; index: number };
  destination: { status: string; index: number } | null;
}

export interface Stats {
  total: number;
  completed: number;
  remaining: number;
  productivity: number;
  completion_rate: number;
}

export interface WeeklyStats {
  total_completed: number;
  daily_counts: { date: string; count: number }[];
}

export interface Streak {
  current: number;
  longest: number;
}

export type FilterType = 'all' | 'todo' | 'in_progress' | 'completed' | 'high_priority' | 'today' | 'overdue';

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  critical: '#e81123',
  high: '#ff8c00',
  medium: '#ffaa44',
  low: '#60cdff',
};

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export const STATUS_LABELS: Record<string, string> = {
  todo: 'Todo',
  in_progress: 'In Progress',
  completed: 'Completed',
  archived: 'Archived',
};
