import { useState, useMemo } from 'react';
import { useTaskStore } from '@/store/taskStore';
import { GlassPanel } from '@/components/common/GlassPanel';
import { motion } from 'framer-motion';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameMonth, isSameDay, isToday, parseISO } from 'date-fns';

export function CalendarView() {
  const tasks = useTaskStore((s) => s.filteredTasks);
  const [currentDate, setCurrentDate] = useState(new Date());

  const days = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const startPadding = getDay(startOfMonth(currentDate));

  const getTasksForDay = (date: Date) => {
    return tasks.filter((t) => {
      if (!t.due_date) return false;
      const taskDate = parseISO(t.due_date);
      return isSameDay(taskDate, date);
    });
  };

  return (
    <div className="calendar-view">
      <GlassPanel className="calendar-panel" blur={24}>
        <div className="calendar-header">
          <button className="calendar-nav" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <h2 className="calendar-title">{format(currentDate, 'MMMM yyyy')}</h2>
          <button className="calendar-nav" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
        </div>

        <div className="calendar-weekdays">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="calendar-weekday">{d}</div>
          ))}
        </div>

        <div className="calendar-grid">
          {Array.from({ length: startPadding }).map((_, i) => (
            <div key={`pad-${i}`} className="calendar-day calendar-day--empty" />
          ))}
          {days.map((date) => {
            const dayTasks = getTasksForDay(date);
            const isCurrent = isToday(date);
            return (
              <motion.div
                key={date.toISOString()}
                className={`calendar-day ${isCurrent ? 'calendar-day--today' : ''} ${dayTasks.length > 0 ? 'calendar-day--has-tasks' : ''}`}
                whileHover={{ scale: 1.05 }}
              >
                <span className="calendar-day-number">{format(date, 'd')}</span>
                {dayTasks.length > 0 && (
                  <div className="calendar-day-tasks">
                    {dayTasks.slice(0, 3).map((t) => (
                      <div key={t.id} className="calendar-day-task" style={{ backgroundColor: t.color || 'var(--accent-color)' }} />
                    ))}
                    {dayTasks.length > 3 && <span className="calendar-day-more">+{dayTasks.length - 3}</span>}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </GlassPanel>
    </div>
  );
}
