import { useState, useEffect, useRef, useCallback } from 'react';

type TimerState = 'idle' | 'focus' | 'break' | 'long_break';

interface PomodoroState {
  state: TimerState;
  timeLeft: number;
  focusCount: number;
  isRunning: boolean;
}

const FOCUS_TIME = 25 * 60;
const BREAK_TIME = 5 * 60;
const LONG_BREAK_TIME = 15 * 60;
const LONG_BREAK_AFTER = 4;

export function usePomodoro() {
  const [pomodoro, setPomodoro] = useState<PomodoroState>({
    state: 'idle',
    timeLeft: FOCUS_TIME,
    focusCount: 0,
    isRunning: false,
  });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startFocus = useCallback(() => {
    clearTimer();
    setPomodoro((prev) => ({
      ...prev,
      state: 'focus',
      timeLeft: FOCUS_TIME,
      isRunning: true,
    }));
  }, [clearTimer]);

  const startBreak = useCallback(() => {
    clearTimer();
    setPomodoro((prev) => {
      const isLongBreak = (prev.focusCount + 1) % LONG_BREAK_AFTER === 0;
      return {
        ...prev,
        state: isLongBreak ? 'long_break' : 'break',
        timeLeft: isLongBreak ? LONG_BREAK_TIME : BREAK_TIME,
        isRunning: true,
      };
    });
  }, [clearTimer]);

  const pause = useCallback(() => {
    clearTimer();
    setPomodoro((prev) => ({ ...prev, isRunning: false }));
  }, [clearTimer]);

  const resume = useCallback(() => {
    setPomodoro((prev) => ({ ...prev, isRunning: true }));
  }, []);

  const reset = useCallback(() => {
    clearTimer();
    setPomodoro({
      state: 'idle',
      timeLeft: FOCUS_TIME,
      focusCount: 0,
      isRunning: false,
    });
  }, [clearTimer]);

  const skip = useCallback(() => {
    clearTimer();
    if (pomodoro.state === 'focus') {
      startBreak();
    } else {
      startFocus();
    }
  }, [pomodoro.state, startFocus, startBreak, clearTimer]);

  useEffect(() => {
    if (!pomodoro.isRunning) return;

    intervalRef.current = setInterval(() => {
      setPomodoro((prev) => {
        if (prev.timeLeft <= 1) {
          clearTimer();
          if (prev.state === 'focus') {
            return {
              ...prev,
              timeLeft: 0,
              isRunning: false,
              state: 'idle',
              focusCount: prev.focusCount + 1,
            };
          }
          return {
            ...prev,
            timeLeft: 0,
            isRunning: false,
            state: 'idle',
          };
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);

    return clearTimer;
  }, [pomodoro.isRunning, clearTimer]);

  const formatTime = useCallback((seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }, []);

  return {
    ...pomodoro,
    startFocus,
    startBreak,
    pause,
    resume,
    reset,
    skip,
    formatTime: formatTime(pomodoro.timeLeft),
  };
}
