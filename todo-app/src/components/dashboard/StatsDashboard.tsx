import { useStats } from '@/hooks/useStats';
import { motion } from 'framer-motion';

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: string;
  color: string;
}) {
  return (
    <motion.div
      className="stat-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ borderLeftColor: color }}
    >
      <div className="stat-card-icon" style={{ color }}>
        <span dangerouslySetInnerHTML={{ __html: icon }} />
      </div>
      <div className="stat-card-value" style={{ color }}>
        {value}
      </div>
      <div className="stat-card-label">{label}</div>
    </motion.div>
  );
}

const icons = {
  tasks: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>',
  completed:
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>',
  remaining:
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  productivity:
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>',
  streak:
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>',
  weekly:
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
};

export function StatsDashboard() {
  const { stats, weeklyStats, streak, loading } = useStats();

  if (loading || !stats) {
    return (
      <div className="stats-dashboard">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="stat-card stat-card--skeleton" />
        ))}
      </div>
    );
  }

  return (
    <div className="stats-dashboard">
      <StatCard
        label="Today's Tasks"
        value={stats.total}
        icon={icons.tasks}
        color="var(--accent-color)"
      />
      <StatCard
        label="Completed Today"
        value={stats.completed}
        icon={icons.completed}
        color="#78d237"
      />
      <StatCard
        label="Remaining"
        value={stats.remaining}
        icon={icons.remaining}
        color="#ffaa44"
      />
      <StatCard
        label="Productivity"
        value={`${Math.round(stats.productivity)}%`}
        icon={icons.productivity}
        color="#60cdff"
      />
      <StatCard
        label="Weekly Completed"
        value={weeklyStats?.total_completed ?? 0}
        icon={icons.weekly}
        color="#8764b8"
      />
      <StatCard
        label="Current Streak"
        value={`${streak?.current ?? 0} days`}
        icon={icons.streak}
        color="#e81123"
      />
    </div>
  );
}
