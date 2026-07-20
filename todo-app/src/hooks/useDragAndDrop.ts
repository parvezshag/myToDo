import { useCallback } from 'react';
import {
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  closestCorners,
  pointerWithin,
  rectIntersection,
  CollisionDetection,
  UniqueIdentifier,
} from '@dnd-kit/core';
import { useTaskStore } from '@/store/taskStore';
import type { Task } from '@/types/task';
import { COLUMN_IDS } from '@/utils/constants';
import { useToastStore } from '@/components/common/Toast';

export function useDragAndDrop() {
  const tasks = useTaskStore((s) => s.filteredTasks);
  const moveTask = useTaskStore((s) => s.moveTask);

  const findColumn = useCallback(
    (id: UniqueIdentifier): string => {
      if (COLUMN_IDS.includes(id as typeof COLUMN_IDS[number])) return id as string;
      const task = tasks.find((t) => t.id === id);
      return task?.status ?? 'todo';
    },
    [tasks]
  );

  const handleDragStart = useCallback((_event: DragStartEvent) => {
    // could track active item
  }, []);

  const handleDragOver = useCallback((_event: DragOverEvent) => {
    // could handle column switching mid-drag
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over) return;

      const activeId = active.id;
      const overId = over.id;

      if (activeId === overId) return;

      const activeCol = findColumn(activeId);
      const overCol = findColumn(overId);

      const sourceStatus = activeCol;
      const destStatus = overCol;

      const activeTask = tasks.find((t) => t.id === activeId);
      if (!activeTask) return;

      // Hold tasks cannot be moved to In Progress or Completed until they get a due date.
      if (
        activeTask.status === 'hold' &&
        (destStatus === 'in_progress' || destStatus === 'completed')
      ) {
        useToastStore.getState().addToast(
          'Add a finish date & time before moving a Hold task to In Progress or Completed',
          'warning'
        );
        return;
      }

      // Build the ordered id list for the destination column.
      // 1. All destination-column tasks (excluding the active one) sorted by current order.
      const destTasks = tasks
        .filter((t) => t.status === destStatus && t.id !== activeId)
        .sort((a, b) => a.order_index - b.order_index);

      // 2. Determine where to insert based on the drop target.
      let insertAt = destTasks.length;
      if (overId !== destStatus) {
        const overIdx = destTasks.findIndex((t) => t.id === overId);
        insertAt = overIdx >= 0 ? overIdx : destTasks.length;
      }

      const orderedIds = [
        ...destTasks.slice(0, insertAt).map((t) => t.id),
        activeId as string,
        ...destTasks.slice(insertAt).map((t) => t.id),
      ];

      const newIndex = insertAt;

      // Also re-index the source column if it differs (the active task left it).
      moveTask(activeId as string, destStatus as Task['status'], newIndex, orderedIds);
    },
    [tasks, moveTask, findColumn]
  );

  const collisionDetection: CollisionDetection = useCallback(
    (args) => {
      const corners = closestCorners(args);
      if (corners.length > 0) return corners;
      const pointer = pointerWithin(args);
      if (pointer.length > 0) return pointer;
      return rectIntersection(args);
    },
    []
  );

  return {
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    collisionDetection,
  };
}
