import { useEffect, useRef } from 'react';
import { useTaskStore } from '@/store/taskStore';
import { useSettingsStore } from '@/store/settingsStore';
import { NotificationService } from '@/services/notificationService';
import { isOverdue, isDueToday } from '@/utils/date';
import { logger } from '@/utils/logger';

/**
 * Schedules desktop notifications for tasks that are overdue or due soon.
 * Runs once on mount and re-checks whenever the task list changes.
 */
export function useNotifications() {
  const tasks = useTaskStore((s) => s.tasks);
  const settings = useSettingsStore((s) => s.settings);
  const notifiedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const service = NotificationService.getInstance();
    void service.init();

    if (!settings.notifications_enabled) {
      notifiedRef.current.clear();
      return;
    }

    const now = Date.now();
    for (const task of tasks) {
      if (task.status === 'completed' || task.status === 'archived') continue;
      if (!task.due_date) continue;

      const due = new Date(task.due_date).getTime();
      const key = `${task.id}:${task.due_date}`;
      if (notifiedRef.current.has(key)) continue;

      if (isOverdue(task.due_date) && due < now) {
        void service.notifyTaskOverdue(task.title);
        notifiedRef.current.add(key);
      } else if (isDueToday(task.due_date)) {
        const diffMin = Math.round((due - now) / 60000);
        if (diffMin > 0 && diffMin <= 30) {
          void service.notifyDueSoon(task.title, diffMin);
          notifiedRef.current.add(key);
        }
      }
    }

    // Clean up notified keys for tasks that no longer exist.
    const currentKeys = new Set(
      tasks
        .filter((t) => t.due_date)
        .map((t) => `${t.id}:${t.due_date}`)
    );
    for (const k of [...notifiedRef.current]) {
      if (!currentKeys.has(k)) notifiedRef.current.delete(k);
    }
  }, [tasks, settings.notifications_enabled]);

  // Periodic re-check every 5 minutes for "due in 30 minutes" style reminders.
  useEffect(() => {
    const interval = setInterval(() => {
      const service = NotificationService.getInstance();
      if (!settings.notifications_enabled) return;
      const now = Date.now();
      for (const task of useTaskStore.getState().tasks) {
        if (!task.due_date || task.status === 'completed' || task.status === 'archived') continue;
        const due = new Date(task.due_date).getTime();
        const diffMin = Math.round((due - now) / 60000);
        const key = `${task.id}:${task.due_date}`;
        if (diffMin > 0 && diffMin <= 30 && !notifiedRef.current.has(key)) {
          void service.notifyDueSoon(task.title, diffMin);
          notifiedRef.current.add(key);
        }
      }
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [settings.notifications_enabled]);

  logger.debug('useNotifications mounted');
}
