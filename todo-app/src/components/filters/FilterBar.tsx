import { useTaskStore } from '@/store/taskStore';
import type { FilterType } from '@/types/common';
import { motion } from 'framer-motion';

const filters: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'todo', label: 'Todo' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'completed', label: 'Completed' },
  { key: 'high_priority', label: 'High Priority' },
  { key: 'today', label: 'Today' },
  { key: 'overdue', label: 'Overdue' },
];

export function FilterBar() {
  const activeFilter = useTaskStore((s) => s.activeFilter);
  const setActiveFilter = useTaskStore((s) => s.setActiveFilter);

  return (
    <div className="filter-bar">
      {filters.map((f) => (
        <motion.button
          key={f.key}
          className={`filter-chip ${activeFilter === f.key ? 'filter-chip--active' : ''}`}
          onClick={() => setActiveFilter(f.key)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {f.label}
          {activeFilter === f.key && (
            <motion.div
              className="filter-chip-indicator"
              layoutId="filterIndicator"
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          )}
        </motion.button>
      ))}
    </div>
  );
}
