import { useEffect } from 'react';
import { useUIStore } from '@/store/uiStore';
import { useTaskStore } from '@/store/taskStore';
import { logger } from '@/utils/logger';

/**
 * Global keyboard shortcuts. Reads mutable state lazily via store getters to
 * avoid re-subscribing the listener on every selection / query change.
 */
export function useKeyboardShortcuts() {
  const toggleQuickAdd = useUIStore((s) => s.toggleQuickAdd);
  const toggleSettings = useUIStore((s) => s.toggleSettings);
  const togglePomodoro = useUIStore((s) => s.togglePomodoro);
  const selectTask = useUIStore((s) => s.selectTask);
  const toggleFocusMode = useUIStore((s) => s.toggleFocusMode);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput =
        !!target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);

      const key = e.key.toLowerCase();
      const mod = e.ctrlKey || e.metaKey;

      // Global shortcuts that also work while typing in a field.
      if (mod && key === 'n') {
        e.preventDefault();
        toggleQuickAdd();
        return;
      }
      if (mod && key === 'f') {
        e.preventDefault();
        const searchInput = document.querySelector<HTMLInputElement>('[data-search-input]');
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
        return;
      }
      if (mod && key === ',') {
        e.preventDefault();
        toggleSettings();
        return;
      }
      if (mod && key === 'p') {
        e.preventDefault();
        togglePomodoro();
        return;
      }
      if (mod && key === 'r') {
        e.preventDefault();
        // Reload tasks from the database.
        void useTaskStore.getState().loadTasks();
        return;
      }

      // Shortcuts that should be ignored while typing.
      if (isInput) return;

      if (e.key === 'Escape') {
        selectTask(null);
        useUIStore.getState().toggleSettings(); // no-op if already closed
        useUIStore.setState({ isSettingsOpen: false });
        useUIStore.setState({ isQuickAddOpen: false });
        useUIStore.setState({ isFocusMode: false });
        return;
      }

      if (mod && key === 'z') {
        e.preventDefault();
        void useTaskStore.getState().undo();
        return;
      }

      const selectedId = useUIStore.getState().selectedTaskId;
      const { deleteTask, duplicateTask, updateTask } = useTaskStore.getState();

      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        e.preventDefault();
        void deleteTask(selectedId);
        selectTask(null);
        return;
      }

      if (e.key === ' ' && selectedId) {
        e.preventDefault();
        const task = useTaskStore.getState().tasks.find((t) => t.id === selectedId);
        if (task) {
          const newStatus = task.status === 'completed' ? 'todo' : 'completed';
          void updateTask({ id: selectedId, status: newStatus });
        }
        return;
      }

      if (mod && key === 'd' && selectedId) {
        e.preventDefault();
        void duplicateTask(selectedId);
        return;
      }

      if (mod && key === 'e' && selectedId) {
        e.preventDefault();
        // Re-open the task dialog (selected already shows it via App.tsx).
        selectTask(selectedId);
        return;
      }

      // Focus mode toggle with 'F' (no modifier) when a task isn't selected.
      if (key === 'f' && !selectedId) {
        toggleFocusMode();
        return;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [toggleQuickAdd, toggleSettings, togglePomodoro, selectTask, toggleFocusMode]);
}
