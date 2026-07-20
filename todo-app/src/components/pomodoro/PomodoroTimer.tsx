import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '@/store/uiStore';
import { usePomodoro } from '@/hooks/usePomodoro';
import { GlassPanel } from '@/components/common/GlassPanel';

export function PomodoroTimer() {
  const isOpen = useUIStore((s) => s.isPomodoroOpen);
  const togglePomodoro = useUIStore((s) => s.togglePomodoro);
  const timer = usePomodoro();

  const stateLabel = {
    idle: 'Ready',
    focus: 'Focus',
    break: 'Break',
    long_break: 'Long Break',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="pomodoro-floating"
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          drag
          dragMomentum={false}
        >
          <GlassPanel className="pomodoro-panel" blur={32}>
            <div className="pomodoro-header">
              <h3>{stateLabel[timer.state]}</h3>
              <button className="pomodoro-close" onClick={togglePomodoro}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="pomodoro-timer">{timer.formatTime}</div>
            <div className="pomodoro-count">#{timer.focusCount + 1}</div>
            <div className="pomodoro-actions">
              {timer.state === 'idle' && (
                <button className="pomodoro-btn pomodoro-btn--primary" onClick={timer.startFocus}>
                  Start Focus
                </button>
              )}
              {timer.state === 'focus' && (
                <>
                  <button className="pomodoro-btn" onClick={timer.pause}>
                    {timer.isRunning ? 'Pause' : 'Resume'}
                  </button>
                  <button className="pomodoro-btn" onClick={timer.startBreak}>
                    Break
                  </button>
                </>
              )}
              {timer.state !== 'idle' && (
                <>
                  {timer.state !== 'focus' && (
                    <button className="pomodoro-btn" onClick={timer.startFocus}>
                      Skip to Focus
                    </button>
                  )}
                  <button className="pomodoro-btn pomodoro-btn--danger" onClick={timer.reset}>
                    Reset
                  </button>
                </>
              )}
            </div>
          </GlassPanel>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
