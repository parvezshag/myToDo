import { create } from 'zustand';
import type { Task, CreateTaskInput, UpdateTaskInput, ReorderInput } from '@/types/task';
import type { FilterType } from '@/types/common';
import { invoke } from '@tauri-apps/api/core';
import { logger } from '@/utils/logger';

interface UndoAction {
  type: 'create' | 'update' | 'delete' | 'move';
  taskId: string;
  previousState?: Task;
  nextState?: Task;
}

interface TaskStore {
  tasks: Task[];
  filteredTasks: Task[];
  isLoading: boolean;
  searchQuery: string;
  activeFilter: FilterType;
  undoStack: UndoAction[];

  loadTasks: () => Promise<void>;
  addTask: (input: CreateTaskInput) => Promise<Task>;
  updateTask: (input: UpdateTaskInput) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  duplicateTask: (id: string) => Promise<Task>;
  archiveTask: (id: string) => Promise<Task>;
  moveTask: (
    id: string,
    status: Task['status'],
    orderIndex: number,
    orderedIds?: string[]
  ) => Promise<void>;

  setSearchQuery: (query: string) => void;
  setActiveFilter: (filter: FilterType) => void;
  applyFilters: () => void;

  undo: () => Promise<void>;
  pushUndo: (action: UndoAction) => void;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  filteredTasks: [],
  isLoading: false,
  searchQuery: '',
  activeFilter: 'all',
  undoStack: [],

  loadTasks: async () => {
    set({ isLoading: true });
    try {
      const tasks = await invoke('get_tasks') as Array<{ tags: string; dependencies: string } & Record<string, unknown>>;
      const parsed: Task[] = tasks.map((t) => ({
        ...t,
        tags: JSON.parse(t.tags),
        dependencies: JSON.parse(t.dependencies),
      })) as unknown as Task[];
      set({ tasks: parsed, isLoading: false });
      get().applyFilters();
    } catch {
      set({ isLoading: false });
    }
  },

  addTask: async (input) => {
    const payload: Record<string, unknown> = {
      ...input,
      tags: Array.isArray(input.tags) ? JSON.stringify(input.tags) : input.tags,
      dependencies: Array.isArray(input.dependencies) ? JSON.stringify(input.dependencies) : input.dependencies,
    };
    const result = await invoke('create_task', { input: payload }) as { tags: string; dependencies: string } & Record<string, unknown>;
    const parsed = {
      ...result,
      tags: JSON.parse(result.tags),
      dependencies: JSON.parse(result.dependencies),
    } as unknown as Task;
    set((state) => ({ tasks: [parsed, ...state.tasks] }));
    get().applyFilters();
    get().pushUndo({ type: 'create', taskId: parsed.id, nextState: parsed });
    return parsed;
  },

  updateTask: async (input) => {
    const payload: Record<string, unknown> = { id: input.id };
    if (input.tags) payload.tags = JSON.stringify(input.tags);
    if (input.dependencies) payload.dependencies = JSON.stringify(input.dependencies);
    if (input.title !== undefined) payload.title = input.title;
    if (input.description !== undefined) payload.description = input.description;
    if (input.status !== undefined) payload.status = input.status;
    if (input.priority !== undefined) payload.priority = input.priority;
    if (input.due_date !== undefined) payload.due_date = input.due_date;
    if (input.category !== undefined) payload.category = input.category;
    if (input.progress !== undefined) payload.progress = input.progress;
    if (input.notes !== undefined) payload.notes = input.notes;
    if (input.estimated_time !== undefined) payload.estimated_time = input.estimated_time;
    if (input.actual_time !== undefined) payload.actual_time = input.actual_time;
    if (input.color !== undefined) payload.color = input.color;
    if (input.is_pinned !== undefined) payload.is_pinned = input.is_pinned;
    if (input.is_recurring !== undefined) payload.is_recurring = input.is_recurring;
    if (input.recurring_rule !== undefined) payload.recurring_rule = input.recurring_rule;
    if (input.parent_id !== undefined) payload.parent_id = input.parent_id;
    if (input.order_index !== undefined) payload.order_index = input.order_index;

    const previousTask = get().tasks.find((t) => t.id === input.id);
    const resultU = await invoke('update_task', { input: payload }) as { tags: string; dependencies: string } & Record<string, unknown>;
    const parsed = {
      ...resultU,
      tags: JSON.parse(resultU.tags),
      dependencies: JSON.parse(resultU.dependencies),
    } as unknown as Task;
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === parsed.id ? parsed : t)),
    }));
    get().applyFilters();
    if (previousTask) {
      get().pushUndo({ type: 'update', taskId: parsed.id, previousState: previousTask, nextState: parsed });
    }
    return parsed;
  },

  deleteTask: async (id) => {
    const previousTask = get().tasks.find((t) => t.id === id);
    await invoke('delete_task', { id });
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
    }));
    get().applyFilters();
    if (previousTask) {
      get().pushUndo({ type: 'delete', taskId: id, previousState: previousTask });
    }
  },

  duplicateTask: async (id) => {
    const resultD = await invoke('duplicate_task', { id }) as { tags: string; dependencies: string } & Record<string, unknown>;
    const parsed = {
      ...resultD,
      tags: JSON.parse(resultD.tags),
      dependencies: JSON.parse(resultD.dependencies),
    } as unknown as Task;
    set((state) => ({ tasks: [parsed, ...state.tasks] }));
    get().applyFilters();
    return parsed;
  },

  archiveTask: async (id) => {
    const resultA = await invoke('archive_task', { id }) as { tags: string; dependencies: string } & Record<string, unknown>;
    const parsed = {
      ...resultA,
      tags: JSON.parse(resultA.tags),
      dependencies: JSON.parse(resultA.dependencies),
    } as unknown as Task;
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? parsed : t)),
    }));
    get().applyFilters();
    return parsed;
  },

  /**
   * Reorders the tasks in a column after a drag-and-drop operation.
   * `orderedIds` is the full ordered id list of the destination column
   * (including the moved task). The store optimistically re-indexes the
   * destination column and persists the batch to SQLite.
   */
  moveTask: async (id, status, orderIndex, orderedIds) => {
    const previousTasks = [...get().tasks];
    const previousTask = previousTasks.find((t) => t.id === id);
    const now = new Date().toISOString();

    // Optimistically update the local state: re-index the whole target column.
    set((state) => {
      const movedTask = state.tasks.find((t) => t.id === id);
      if (!movedTask) return {};

      const updated = state.tasks.map((t) => {
        if (t.id === id) {
          return { ...t, status, order_index: orderIndex, updated_at: now };
        }
        return t;
      });

      // Re-index the destination column to keep order_index compact and stable.
      const destOrdered = orderedIds
        ? orderedIds.map((tid, idx) => ({ tid, idx }))
        : null;

      const normalized = updated.map((t) => {
        if (!destOrdered) return t;
        const match = destOrdered.find((o) => o.tid === t.id);
        if (match && (t.status === status || t.id === id)) {
          return { ...t, order_index: match.idx };
        }
        return t;
      });

      return { tasks: normalized };
    });

    get().applyFilters();

    try {
      await invoke('reorder_tasks_batch', {
        status,
        orderedIds: orderedIds ?? [],
      });
    } catch (err) {
      logger.error('Failed to persist reorder:', err);
      // Roll back on failure.
      set({ tasks: previousTasks });
      get().applyFilters();
    }

    if (previousTask) {
      get().pushUndo({
        type: 'move',
        taskId: id,
        previousState: { ...previousTask },
        nextState: { ...previousTask, status, order_index: orderIndex },
      });
    }
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
    get().applyFilters();
  },

  setActiveFilter: (filter) => {
    set({ activeFilter: filter });
    get().applyFilters();
  },

  applyFilters: () => {
    const { tasks, searchQuery, activeFilter } = get();
    let filtered = [...tasks];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }

    filtered = filtered.filter((t) => t.status !== 'archived');

    switch (activeFilter) {
      case 'todo':
        filtered = filtered.filter((t) => t.status === 'todo');
        break;
      case 'in_progress':
        filtered = filtered.filter((t) => t.status === 'in_progress');
        break;
      case 'completed':
        filtered = filtered.filter((t) => t.status === 'completed');
        break;
      case 'high_priority':
        filtered = filtered.filter((t) => t.priority === 'critical' || t.priority === 'high');
        break;
      case 'today':
        filtered = filtered.filter((t) => {
          if (!t.due_date) return false;
          const d = new Date(t.due_date);
          const now = new Date();
          return (
            d.getDate() === now.getDate() &&
            d.getMonth() === now.getMonth() &&
            d.getFullYear() === now.getFullYear()
          );
        });
        break;
      case 'overdue':
        filtered = filtered.filter((t) => {
          if (!t.due_date || t.status === 'completed') return false;
          return new Date(t.due_date) < new Date();
        });
        break;
    }

    set({ filteredTasks: filtered });
  },

  pushUndo: (action) => {
    set((state) => ({
      undoStack: [...state.undoStack.slice(-49), action],
    }));
  },

  undo: async () => {
    const stack = get().undoStack;
    if (stack.length === 0) return;
    const action = stack[stack.length - 1];
    set((state) => ({ undoStack: state.undoStack.slice(0, -1) }));

    try {
      switch (action.type) {
        case 'create':
          if (action.taskId) {
            await invoke('delete_task', { id: action.taskId });
            set((state) => ({
              tasks: state.tasks.filter((t) => t.id !== action.taskId),
            }));
          }
          break;
        case 'delete':
          if (action.previousState) {
            await invoke('create_task', { input: action.previousState });
            set((state) => ({
              tasks: [...state.tasks, action.previousState!],
            }));
          }
          break;
        case 'update':
        case 'move':
          if (action.previousState) {
            const prev = action.previousState;
            await invoke('update_task', {
              input: {
                id: prev.id,
                title: prev.title,
                status: prev.status,
                order_index: prev.order_index,
              },
            });
            set((state) => ({
              tasks: state.tasks.map((t) =>
                t.id === prev.id ? prev : t
              ),
            }));
          }
          break;
      }
      get().applyFilters();
    } catch {
      // silent undo failure
    }
  },
}));
