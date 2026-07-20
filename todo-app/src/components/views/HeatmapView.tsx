import { useMemo } from 'react';
import { useTaskStore } from '@/store/taskStore';
import { GlassPanel } from '@/components/common/GlassPanel';
import { format, subDays, startOfDay, parseISO, isSameDay } from 'date-fns';

export function HeatmapView() {
  const tasks = useTaskStore((s) => s.filteredTasks);

  const cells = useMemo(() => {
    const result: { date: Date; count: number }[] = [];
    for (let i = 51; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayStart = startOfDay(date);
      const count = tasks.filter((t) => {
        if (!t.completed_at) return false;
        const completedDate = parseISO(t.completed_at);
        return isSameDay(completedDate, dayStart);
      }).length;
      result.push({ date, count });
    }
    return result;
  }, [tasks]);

  const maxCount = Math.max(...cells.map((c) => c.count), 1);

  const getIntensity = (count: number): string => {
    const ratio = count / maxCount;
    if (count === 0) return 'var(--bg-tertiary)';
    if (ratio < 0.25) return 'rgba(96, 205, 255, 0.25)';
    if (ratio < 0.5) return 'rgba(96, 205, 255, 0.45)';
    if (ratio < 0.75) return 'rgba(96, 205, 255, 0.65)';
    return 'rgba(96, 205, 255, 0.85)';
  };

  return (
    <div className="heatmap-view">
      <GlassPanel className="heatmap-panel" blur={24}>
        <div className="heatmap-header">
          <h2>Activity Heatmap</h2>
          <span className="heatmap-subtitle">Last 52 days</span>
        </div>
        <div className="heatmap-grid">
          {cells.map((cell, idx) => (
            <div
              key={idx}
              className="heatmap-cell"
              style={{ backgroundColor: getIntensity(cell.count) }}
              title={`${format(cell.date, 'MMM d, yyyy')}: ${cell.count} tasks`}
            />
          ))}
        </div>
        <div className="heatmap-legend">
          <span>Less</span>
          <div className="heatmap-legend-cell" style={{ backgroundColor: 'var(--bg-tertiary)' }} />
          <div className="heatmap-legend-cell" style={{ backgroundColor: 'rgba(96, 205, 255, 0.25)' }} />
          <div className="heatmap-legend-cell" style={{ backgroundColor: 'rgba(96, 205, 255, 0.45)' }} />
          <div className="heatmap-legend-cell" style={{ backgroundColor: 'rgba(96, 205, 255, 0.65)' }} />
          <div className="heatmap-legend-cell" style={{ backgroundColor: 'rgba(96, 205, 255, 0.85)' }} />
          <span>More</span>
        </div>
      </GlassPanel>
    </div>
  );
}
