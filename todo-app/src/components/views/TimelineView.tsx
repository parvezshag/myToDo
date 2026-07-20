import { useMemo } from 'react';
import { useTaskStore } from '@/store/taskStore';
import { GlassPanel } from '@/components/common/GlassPanel';
import { motion } from 'framer-motion';
import { format, parseISO, startOfWeek, addDays } from 'date-fns';
import { PRIORITY_COLORS } from '@/types/common';

export function TimelineView() {
  const tasks = useTaskStore((s) => s.filteredTasks);

  const weekDays = useMemo(() => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, []);

  const getTasksForDay = (date: Date) => {
    return tasks.filter((t) => {
      if (!t.due_date) return false;
      const taskDate = parseISO(t.due_date);
      return taskDate.getDate() === date.getDate() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getFullYear() === date.getFullYear();
    });
  };

  return (
    <div className="timeline-view">
      <GlassPanel className="timeline-panel" blur={24}>
        <div className="timeline-header">
          <h2>Weekly Timeline</h2>
          <span className="timeline-subtitle">This Week</span>
        </div>
        <div className="timeline-grid">
          {weekDays.map((day) => {
            const dayTasks = getTasksForDay(day);
            const today = new Date();
            const isCurrentDay =
              day.getDate() === today.getDate() &&
              day.getMonth() === today.getMonth() &&
              day.getFullYear() === today.getFullYear();

            return (
              <div key={day.toISOString()} className={`timeline-day ${isCurrentDay ? 'timeline-day--today' : ''}`}>
                <div className="timeline-day-header">
                  <span className="timeline-day-name">{format(day, 'EEE')}</span>
                  <span className="timeline-day-date">{format(day, 'd')}</span>
                </div>
                <div className="timeline-day-body">
                  {dayTasks.map((t, idx) => (
                    <motion.div
                      key={t.id}
                      className="timeline-task"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      style={{ borderLeftColor: PRIORITY_COLORS[t.priority] }}
                    >
                      <span className="timeline-task-title">{t.title}</span>
                      <span className="timeline-task-time">
                        {t.estimated_time ? `${t.estimated_time}m` : ''}
                      </span>
                    </motion.div>
                  ))}
                  {dayTasks.length === 0 && (
                    <div className="timeline-empty">No tasks</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </GlassPanel>
    </div>
  );
}
