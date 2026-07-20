import { taskService } from './taskService';
import { save } from '@tauri-apps/plugin-dialog';
import { writeTextFile } from '@tauri-apps/plugin-fs';
import type { Task } from '@/types/task';

function taskToRow(task: Task): Record<string, string> {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    due_date: task.due_date ?? '',
    category: task.category,
    tags: JSON.stringify(task.tags),
    progress: String(task.progress),
    notes: task.notes,
    estimated_time: task.estimated_time?.toString() ?? '',
    actual_time: task.actual_time?.toString() ?? '',
    color: task.color,
    created_at: task.created_at,
    updated_at: task.updated_at,
  };
}

export async function exportToJSON(): Promise<void> {
  const data = await taskService.exportTasks();
  const json = JSON.stringify(data, null, 2);
  const path = await save({
    defaultPath: 'todo-export.json',
    filters: [{ name: 'JSON', extensions: ['json'] }],
  });
  if (path) {
    await writeTextFile(path, json);
  }
}

export async function exportToCSV(): Promise<void> {
  const data = await taskService.exportTasks();
  const headers = [
    'id', 'title', 'description', 'status', 'priority',
    'due_date', 'category', 'tags', 'progress', 'notes',
    'estimated_time', 'actual_time', 'color', 'created_at', 'updated_at',
  ];
  const rows = data.tasks.map((t) => {
    const row = taskToRow(t);
    return headers.map((h) => `"${(row[h] ?? '').replace(/"/g, '""')}"`).join(',');
  });
  const csv = [headers.join(','), ...rows].join('\n');
  const path = await save({
    defaultPath: 'todo-export.csv',
    filters: [{ name: 'CSV', extensions: ['csv'] }],
  });
  if (path) {
    await writeTextFile(path, csv);
  }
}
