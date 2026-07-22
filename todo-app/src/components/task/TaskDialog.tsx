import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTaskStore } from '@/store/taskStore';
import { useUIStore } from '@/store/uiStore';
import { GlassPanel } from '@/components/common/GlassPanel';
import { Confetti } from '@/components/common/Confetti';
import type { Task, TaskPriority, TaskProgress } from '@/types/task';
import { PRIORITY_COLORS, PRIORITY_LABELS } from '@/types/common';
import { formatDateTime } from '@/utils/date';
import { formatMinutes } from '@/utils/formatters';
import { CATEGORIES } from '@/utils/constants';
import { useToast } from '@/components/common/Toast';
import { taskService } from '@/services/taskService';
import type { TaskHistory } from '@/types/task';

export function TaskDialog() {
  const selectedTaskId = useUIStore((s) => s.selectedTaskId);
  const selectTask = useUIStore((s) => s.selectTask);
  const tasks = useTaskStore((s) => s.tasks);
  const updateTask = useTaskStore((s) => s.updateTask);
  const deleteTask = useTaskStore((s) => s.deleteTask);
  const { addToast } = useToast();

  const task = tasks.find((t) => t.id === selectedTaskId);
  const [tab, setTab] = useState<'details' | 'history'>('details');
  const [history, setHistory] = useState<TaskHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'medium' as TaskPriority,
    status: 'todo' as Task['status'],
    category: '',
    tags: '',
    due_date: '',
    progress: 0 as TaskProgress,
    notes: '',
    estimated_time: '',
    actual_time: '',
    color: '',
  });

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        category: task.category,
        tags: task.tags.join(', '),
        due_date: task.due_date ? task.due_date.slice(0, 16) : '',
        progress: task.progress,
        notes: task.notes,
        estimated_time: task.estimated_time?.toString() || '',
        actual_time: task.actual_time?.toString() || '',
        color: task.color,
      });
    }
  }, [task]);

  useEffect(() => {
    if (tab === 'history' && task) {
      setHistoryLoading(true);
      taskService
        .getHistory(task.id)
        .then((rows) => setHistory(rows as TaskHistory[]))
        .catch(() => setHistory([]))
        .finally(() => setHistoryLoading(false));
    }
  }, [tab, task]);

  if (!task) return null;

  const handleSave = async () => {
    const tags = form.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const isJustCompleted = form.status === 'completed' && task.status !== 'completed';

    // Auto-exit hold when a due date is assigned
    if (task.status === 'hold' && form.due_date && form.status === 'hold') {
      form.status = 'in_progress';
    }

    await updateTask({
      id: task.id,
      title: form.title,
      description: form.description,
      priority: form.priority,
      status: form.status,
      category: form.category,
      tags,
      due_date: form.due_date ? new Date(form.due_date).toISOString() : null,
      progress: form.progress,
      notes: form.notes,
      estimated_time: form.estimated_time ? parseInt(form.estimated_time) : null,
      actual_time: form.actual_time ? parseInt(form.actual_time) : null,
      color: form.color,
    });

    if (isJustCompleted) {
      setShowConfetti(true);
      addToast('Task completed! 🎉', 'success');
    } else {
      addToast('Task updated', 'info');
    }

    selectTask(null);
  };

  const handleDelete = async () => {
    await deleteTask(task.id);
    addToast('Task deleted', 'error');
    selectTask(null);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="dialog-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => selectTask(null)}
      >
        <Confetti active={showConfetti} onComplete={() => setShowConfetti(false)} />
        <motion.div
          className="dialog-container"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          <GlassPanel className="task-dialog" blur={40}>
            <div className="task-dialog-header">
              <input
                className="dialog-title-input"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Task title"
              />
              <button className="dialog-close-btn" onClick={() => selectTask(null)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="dialog-tabs">
              <button
                className={`dialog-tab ${tab === 'details' ? 'active' : ''}`}
                onClick={() => setTab('details')}
              >
                Details
              </button>
              <button
                className={`dialog-tab ${tab === 'history' ? 'active' : ''}`}
                onClick={() => setTab('history')}
              >
                History
              </button>
            </div>

            {tab === 'details' && (
              <div className="dialog-body">
              <div className="dialog-field">
                <label>Description</label>
                <textarea
                  className="dialog-textarea"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Add a description..."
                  rows={3}
                />
              </div>

              <div className="dialog-row">
                <div className="dialog-field">
                  <label>Priority</label>
                  <select
                    className="dialog-select"
                    value={form.priority}
                    onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as TaskPriority }))}
                    style={{ borderLeftColor: PRIORITY_COLORS[form.priority] }}
                  >
                    {(['critical', 'high', 'medium', 'low'] as const).map((p) => (
                      <option key={p} value={p}>
                        {PRIORITY_LABELS[p]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="dialog-row">
                <div className="dialog-field">
                  <label>Category</label>
                  <select
                    className="dialog-select"
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  >
                    <option value="">None</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="dialog-field">
                  <label>Due Date</label>
                  <input
                    type="datetime-local"
                    className="dialog-input"
                    value={form.due_date}
                    onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))}
                  />
                </div>
              </div>

              <div className="dialog-field">
                <label>Tags (comma separated)</label>
                <input
                  className="dialog-input"
                  value={form.tags}
                  onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                  placeholder="e.g. urgent, work, meeting"
                />
              </div>

              <div className="dialog-row">
                <div className="dialog-field">
                  <label>Progress</label>
                  <div className="progress-selector">
                    {([0, 25, 50, 75, 100] as const).map((p) => (
                      <button
                        key={p}
                        className={`progress-btn ${form.progress === p ? 'progress-btn--active' : ''}`}
                        onClick={() => setForm((f) => ({ ...f, progress: p }))}
                      >
                        {p}%
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="dialog-row">
                <div className="dialog-field">
                  <label>Est. Time (min)</label>
                  <input
                    type="number"
                    className="dialog-input"
                    value={form.estimated_time}
                    onChange={(e) => setForm((f) => ({ ...f, estimated_time: e.target.value }))}
                    min="0"
                  />
                </div>
                <div className="dialog-field">
                  <label>Actual Time (min)</label>
                  <input
                    type="number"
                    className="dialog-input"
                    value={form.actual_time}
                    onChange={(e) => setForm((f) => ({ ...f, actual_time: e.target.value }))}
                    min="0"
                  />
                </div>
              </div>

              <div className="dialog-field">
                <label>Notes (Markdown)</label>
                <textarea
                  className="dialog-textarea"
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="Add notes..."
                  rows={4}
                />
              </div>

              <div className="dialog-field">
                <label>Color</label>
                <div className="color-picker-row">
                  <input
                    type="color"
                    className="color-picker"
                    value={form.color || '#60cdff'}
                    onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                  />
                  <span className="color-hex">{form.color || 'Default'}</span>
                </div>
              </div>

              <div className="dialog-meta">
                <span>Created: {formatDateTime(task.created_at)}</span>
                <span>Updated: {formatDateTime(task.updated_at)}</span>
              </div>
              </div>
            )}

            {tab === 'history' && (
              <div className="dialog-body">
                <div className="history-list">
                  {historyLoading ? (
                    <p className="settings-hint">Loading history...</p>
                  ) : history.length === 0 ? (
                    <p className="settings-hint">No changes recorded yet.</p>
                  ) : (
                    history.map((h) => (
                      <div key={h.id} className="history-entry">
                        <div className="history-field">{h.action}</div>
                        <div className="history-change">
                          {h.old_value || <em>empty</em>} → {h.new_value || <em>empty</em>}
                        </div>
                        <div className="history-time">{formatDateTime(h.timestamp)}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            <div className="dialog-footer">
              <button className="dialog-btn dialog-btn--danger" onClick={handleDelete}>
                Delete
              </button>
              <div className="dialog-footer-right">
                <button className="dialog-btn" onClick={() => selectTask(null)}>
                  Cancel
                </button>
                <button className="dialog-btn dialog-btn--primary" onClick={handleSave}>
                  Save
                </button>
              </div>
            </div>
          </GlassPanel>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
