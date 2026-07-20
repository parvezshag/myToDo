import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { KanbanCard } from './KanbanCard';
import type { Task } from '@/types/task';
import { GlassPanel } from '@/components/common/GlassPanel';

interface KanbanColumnProps {
  id: string;
  title: string;
  icon: string;
  tasks: Task[];
  onQuickAdd: () => void;
}

export function KanbanColumn({ id, title, icon, tasks, onQuickAdd }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <GlassPanel className={`kanban-column ${isOver ? 'kanban-column--over' : ''}`} blur={24}>
      <div className="kanban-column-header">
        <span className="kanban-column-icon">{icon}</span>
        <h3 className="kanban-column-title">{title}</h3>
        <span className="kanban-column-count">{tasks.length}</span>
      </div>
      <div ref={setNodeRef} className="kanban-column-body">
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <KanbanCard key={task.id} task={task} />
          ))}
        </SortableContext>
        {tasks.length === 0 && id !== 'in_progress' && id !== 'completed' && (
          <div className="kanban-column-empty">
            <p>No tasks</p>
          </div>
        )}
      </div>
      {id !== 'in_progress' && id !== 'completed' && (
        <div className="kanban-column-footer">
          <button className="kanban-add-btn" onClick={onQuickAdd}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Task
          </button>
        </div>
      )}
    </GlassPanel>
  );
}
