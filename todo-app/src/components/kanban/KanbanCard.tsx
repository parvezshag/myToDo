import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import type { Task } from '@/types/task';
import { useUIStore } from '@/store/uiStore';
import { useTaskStore } from '@/store/taskStore';
import { GlassPanel } from '@/components/common/GlassPanel';
import { PRIORITY_COLORS } from '@/types/common';
import { formatDate, isOverdue, isDueToday, timeRemaining } from '@/utils/date';
import { formatMinutes } from '@/utils/formatters';

interface KanbanCardProps {
  task: Task;
  isOverlay?: boolean;
}

export function KanbanCard({ task, isOverlay }: KanbanCardProps) {
  const selectTask = useUIStore((s) => s.selectTask);
  const selectedTaskId = useUIStore((s) => s.selectedTaskId);
  const updateTask = useTaskStore((s) => s.updateTask);
  const deleteTask = useTaskStore((s) => s.deleteTask);
  const duplicateTask = useTaskStore((s) => s.duplicateTask);
  const archiveTask = useTaskStore((s) => s.archiveTask);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    disabled: isOverlay,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  const isSelected = selectedTaskId === task.id;
  const overdue = isOverdue(task.due_date) && task.status !== 'completed';
  const dueToday = isDueToday(task.due_date);

  const showContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    selectTask(task.id);
    const menu = document.createElement('div');
    menu.className = 'context-menu';
    menu.style.left = `${e.clientX}px`;
    menu.style.top = `${e.clientY}px`;

    const items = [
      { label: 'Edit', icon: '✏️', action: () => selectTask(task.id) },
      { label: 'Duplicate', icon: '📋', action: () => duplicateTask(task.id) },
      { label: task.status === 'completed' ? 'Mark Todo' : 'Mark Complete', icon: task.status === 'completed' ? '○' : '✓', action: () => updateTask({ id: task.id, status: task.status === 'completed' ? 'todo' : 'completed' }) },
      { label: task.is_pinned ? 'Unpin' : 'Pin', icon: '📌', action: () => updateTask({ id: task.id, is_pinned: !task.is_pinned }) },
      { label: 'Archive', icon: '📦', action: () => archiveTask(task.id) },
      { label: 'Delete', icon: '🗑️', action: () => deleteTask(task.id) },
    ];

    items.forEach((item) => {
      const btn = document.createElement('button');
      btn.className = 'context-menu-item';
      btn.innerHTML = `<span>${item.icon}</span> ${item.label}`;
      btn.onclick = () => {
        item.action();
        menu.remove();
      };
      menu.appendChild(btn);
    });

    const backdrop = document.createElement('div');
    backdrop.className = 'context-menu-backdrop';
    backdrop.onclick = () => { menu.remove(); backdrop.remove(); };

    document.body.appendChild(backdrop);
    document.body.appendChild(menu);
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <motion.div
        layout
        initial={isOverlay ? undefined : { opacity: 0, scale: 0.95 }}
        animate={isOverlay ? undefined : { opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
      >
        <GlassPanel
          className={`task-card ${isSelected ? 'task-card--selected' : ''} ${overdue ? 'task-card--overdue' : ''}`}
          blur={16}
          style={{ borderLeftColor: task.color || PRIORITY_COLORS[task.priority] }}
        >
          <div className="task-card-header" onContextMenu={showContextMenu}>
            <div className="task-card-priority">
              <span
                className="priority-dot"
                style={{ backgroundColor: PRIORITY_COLORS[task.priority] }}
              />
              <span className="priority-label">{task.priority}</span>
            </div>
            <div className="task-card-actions">
              {task.is_pinned && <span className="task-pin">📌</span>}
              {task.status === 'completed' && (
                <button
                  className="task-delete-btn"
                  title="Delete task"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteTask(task.id);
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    <line x1="10" y1="11" x2="10" y2="17" />
                    <line x1="14" y1="11" x2="14" y2="17" />
                  </svg>
                </button>
              )}
              <input
                type="checkbox"
                className="task-checkbox"
                checked={task.status === 'completed'}
                onChange={() =>
                  updateTask({
                    id: task.id,
                    status: task.status === 'completed' ? 'todo' : 'completed',
                  })
                }
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          <div className="task-card-title" onClick={() => selectTask(task.id)}>
            {task.title}
          </div>

          {task.description && (
            <div className="task-card-description" onClick={() => selectTask(task.id)}>
              {task.description}
            </div>
          )}

          <div className="task-card-meta">
            {task.category && (
              <span className="task-category-badge">{task.category}</span>
            )}
            {task.status === 'hold' ? (
              <span className="task-hold-badge">Hold</span>
            ) : task.due_date ? (
              <span
                className={`task-due-badge ${overdue ? 'due-overdue' : ''} ${dueToday ? 'due-today' : ''}`}
              >
                {formatDate(task.due_date)}
                {timeRemaining(task.due_date) && (
                  <span className="task-time-left"> · {timeRemaining(task.due_date)}</span>
                )}
              </span>
            ) : null}
            {task.estimated_time && (
              <span className="task-time-badge">
                {formatMinutes(task.estimated_time)}
              </span>
            )}
          </div>

          {task.tags.length > 0 && (
            <div className="task-card-tags">
              {task.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="task-tag">
                  #{tag}
                </span>
              ))}
              {task.tags.length > 3 && (
                <span className="task-tag-more">+{task.tags.length - 3}</span>
              )}
            </div>
          )}

          {task.status === 'in_progress' && task.progress > 0 && (
            <div className="task-card-progress">
              <div className="progress-bar">
                <motion.div
                  className="progress-bar-fill"
                  initial={{ width: '0%' }}
                  animate={{ width: `${task.progress}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
              <span className="progress-text">{task.progress}%</span>
            </div>
          )}

          <div className="task-card-footer">
            <span className="task-date">{formatDate(task.created_at)}</span>
          </div>
        </GlassPanel>
      </motion.div>
    </div>
  );
}
