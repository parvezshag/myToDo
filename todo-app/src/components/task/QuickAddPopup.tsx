import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '@/store/uiStore';
import { useTaskStore } from '@/store/taskStore';
import { GlassPanel } from '@/components/common/GlassPanel';
import { useToast } from '@/components/common/Toast';
import type { TaskPriority } from '@/types/task';
import { PRIORITY_LABELS } from '@/types/common';

export function QuickAddPopup() {
  const isOpen = useUIStore((s) => s.isQuickAddOpen);
  const toggleQuickAdd = useUIStore((s) => s.toggleQuickAdd);
  const addTask = useTaskStore((s) => s.addTask);
  const { addToast } = useToast();

  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await addTask({
      title: title.trim(),
      priority,
      status: dueDate ? 'in_progress' : 'hold',
      due_date: dueDate ? new Date(dueDate).toISOString() : null,
    });
    addToast('Task created', 'success');
    setTitle('');
    setDueDate('');
    toggleQuickAdd();
  };

  const handleHold = async () => {
    if (!title.trim()) return;
    await addTask({
      title: title.trim(),
      priority,
      status: 'hold',
      due_date: null,
    });
    addToast('Task on hold', 'info');
    setTitle('');
    setDueDate('');
    toggleQuickAdd();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      toggleQuickAdd();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="quickadd-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={toggleQuickAdd}
        >
          <motion.div
            className="quickadd-container"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
          >
            <GlassPanel className="quickadd-panel" blur={40}>
              <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
                <div className="quickadd-header">
                  <h3>New Task</h3>
                  <span className="quickadd-shortcut">Ctrl+N</span>
                </div>
                <input
                  ref={inputRef}
                  className="quickadd-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What needs to be done?"
                  autoFocus
                />
                <input
                  type="datetime-local"
                  className="quickadd-input quickadd-datetime"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  placeholder="End date & time"
                />
                <div className="quickadd-footer">
                  <select
                    className="quickadd-select"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                  >
                    {(['critical', 'high', 'medium', 'low'] as const).map((p) => (
                      <option key={p} value={p}>
                        {PRIORITY_LABELS[p]}
                      </option>
                    ))}
                  </select>
                  <div className="quickadd-actions">
                    <button type="button" className="quickadd-btn" onClick={toggleQuickAdd}>
                      Cancel
                    </button>
                    {!dueDate && (
                      <button
                        type="button"
                        className="quickadd-btn quickadd-btn--hold"
                        onClick={handleHold}
                        disabled={!title.trim()}
                      >
                        Hold
                      </button>
                    )}
                    <button
                      type="submit"
                      className="quickadd-btn quickadd-btn--primary"
                      disabled={!title.trim()}
                    >
                      Add
                    </button>
                  </div>
                </div>
              </form>
            </GlassPanel>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
