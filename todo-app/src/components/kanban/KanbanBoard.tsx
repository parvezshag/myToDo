import { useState } from 'react';
import { DndContext, DragOverlay, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { useTaskStore } from '@/store/taskStore';
import { useDragAndDrop } from '@/hooks/useDragAndDrop';
import { useUIStore } from '@/store/uiStore';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';
import { motion } from 'framer-motion';
import type { Task } from '@/types/task';

const columns = [
  { id: 'todo', title: 'Todo', icon: '○' },
  { id: 'in_progress', title: 'In Progress', icon: '◎' },
  { id: 'completed', title: 'Completed', icon: '✓' },
] as const;

export function KanbanBoard() {
  const tasks = useTaskStore((s) => s.filteredTasks);
  const { handleDragStart, handleDragOver, handleDragEnd, collisionDetection } = useDragAndDrop();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const toggleQuickAdd = useUIStore((s) => s.toggleQuickAdd);

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: { distance: 8 },
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: 200, tolerance: 8 },
  });
  const sensors = useSensors(mouseSensor, touchSensor);

  const onDragStart = (event: any) => {
    const task = tasks.find((t) => t.id === event.active.id);
    if (task) setActiveTask(task);
    handleDragStart(event);
  };

  const onDragEnd = (event: any) => {
    setActiveTask(null);
    handleDragEnd(event);
  };

  return (
    <div className="kanban-board">
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetection}
        onDragStart={onDragStart}
        onDragOver={handleDragOver}
        onDragEnd={onDragEnd}
      >
        <div className="kanban-columns">
          {columns.map((col, idx) => {
            const columnTasks = tasks
              .filter((t) => (col.id === 'todo' ? (t.status === 'todo' || t.status === 'hold') : t.status === col.id))
              .sort((a, b) => {
                if (col.id === 'in_progress') {
                  const at = a.due_date ? new Date(a.due_date).getTime() : Infinity;
                  const bt = b.due_date ? new Date(b.due_date).getTime() : Infinity;
                  if (at !== bt) return at - bt;
                }
                return a.order_index - b.order_index;
              });

            return (
              <motion.div
                key={col.id}
                className="kanban-column-wrapper"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <KanbanColumn
                  id={col.id}
                  title={col.title}
                  icon={col.icon}
                  tasks={columnTasks}
                  onQuickAdd={() => toggleQuickAdd()}
                />
              </motion.div>
            );
          })}
        </div>
        <DragOverlay>
          {activeTask ? (
            <div className="drag-overlay">
              <KanbanCard task={activeTask} isOverlay />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
