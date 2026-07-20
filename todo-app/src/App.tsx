import { useEffect } from 'react';
import { ThemeProvider } from '@/context/ThemeContext';
import { useTaskStore } from '@/store/taskStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useNotifications } from '@/hooks/useNotifications';
import { AppShell } from '@/components/layout/AppShell';
import { TitleBar } from '@/components/layout/TitleBar';
import { StatsDashboard } from '@/components/dashboard/StatsDashboard';
import { FilterBar } from '@/components/filters/FilterBar';
import { SearchBar } from '@/components/search/SearchBar';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { TaskDialog } from '@/components/task/TaskDialog';
import { QuickAddPopup } from '@/components/task/QuickAddPopup';
import { SettingsPanel } from '@/components/settings/SettingsPanel';
import { PomodoroTimer } from '@/components/pomodoro/PomodoroTimer';
import { FocusMode } from '@/components/pomodoro/FocusMode';
import { CalendarView } from '@/components/views/CalendarView';
import { TimelineView } from '@/components/views/TimelineView';
import { HeatmapView } from '@/components/views/HeatmapView';
import { ToastContainer } from '@/components/common/Toast';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { useUIStore } from '@/store/uiStore';
import { taskService } from '@/services/taskService';
import { logger } from '@/utils/logger';

function AppContent() {
  const loadTasks = useTaskStore((s) => s.loadTasks);
  const loadSettings = useSettingsStore((s) => s.loadSettings);
  const isFocusMode = useUIStore((s) => s.isFocusMode);
  const isSettingsOpen = useUIStore((s) => s.isSettingsOpen);
  const selectedTaskId = useUIStore((s) => s.selectedTaskId);
  const activeView = useUIStore((s) => s.activeView);

  useKeyboardShortcuts();
  useNotifications();

  useEffect(() => {
    const bootstrap = async () => {
      try {
        await loadSettings();
        // Seed sample tasks only on a fresh database.
        try {
          const count = await taskService.count();
          if (count === 0) {
            const seeded = await taskService.seedSample();
            logger.info(`Seeded ${seeded} sample tasks`);
          }
        } catch (seedErr) {
          logger.warn('Sample seeding skipped:', seedErr);
        }
        await loadTasks();
      } catch (err) {
        logger.error('Bootstrap failed:', err);
      }
    };
    void bootstrap();
  }, []);

  return (
    <div className="app-container">
      <TitleBar />
      <div className="app-content">
        <StatsDashboard />
        <div className="toolbar">
          <FilterBar />
          <SearchBar />
        </div>
        <div className="main-area">
          {activeView === 'kanban' && <KanbanBoard />}
          {activeView === 'calendar' && <CalendarView />}
          {activeView === 'timeline' && <TimelineView />}
          {activeView === 'heatmap' && <HeatmapView />}
        </div>
      </div>

      {selectedTaskId && <TaskDialog />}
      <QuickAddPopup />
      <SettingsPanel />
      <PomodoroTimer />
      {isFocusMode && <FocusMode />}
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <AppShell>
          <AppContent />
        </AppShell>
      </ErrorBoundary>
    </ThemeProvider>
  );
}
