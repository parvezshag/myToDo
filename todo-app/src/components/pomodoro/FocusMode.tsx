import { motion } from 'framer-motion';
import { useUIStore } from '@/store/uiStore';
import { usePomodoro } from '@/hooks/usePomodoro';

export function FocusMode() {
  const toggleFocusMode = useUIStore((s) => s.toggleFocusMode);
  const timer = usePomodoro();
  const sortedTasks = [];

  return (
    <motion.div
      className="focus-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="focus-content">
        <button className="focus-exit" onClick={toggleFocusMode}>
          Exit Focus Mode
        </button>
        <div className="focus-timer">
          <span className="focus-timer-display">{timer.formatTime}</span>
          <span className="focus-timer-label">
            {timer.state === 'focus' ? 'Focus' : timer.state === 'break' ? 'Break' : 'Ready'}
          </span>
        </div>
        <div className="focus-actions">
          {timer.state === 'idle' && (
            <button className="focus-btn focus-btn--primary" onClick={timer.startFocus}>
              Start Focus
            </button>
          )}
          {timer.isRunning ? (
            <button className="focus-btn" onClick={timer.pause}>
              Pause
            </button>
          ) : timer.state !== 'idle' ? (
            <button className="focus-btn" onClick={timer.resume}>
              Resume
            </button>
          ) : null}
          {timer.state !== 'idle' && (
            <button className="focus-btn" onClick={timer.reset}>
              Reset
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
