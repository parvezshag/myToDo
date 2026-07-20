export const APP_NAME = 'Todo App';
export const DB_NAME = 'todo.db';

export const COLUMN_IDS = ['todo', 'in_progress', 'completed'] as const;

export const PROGRESS_OPTIONS = [0, 25, 50, 75, 100] as const;

export const CATEGORIES = [
  'Work',
  'Personal',
  'Health',
  'Finance',
  'Education',
  'Shopping',
  'Travel',
  'Other',
] as const;

export const SUGGESTED_TAGS = [
  'urgent',
  'important',
  'meeting',
  'email',
  'call',
  'idea',
  'follow-up',
  'research',
] as const;
