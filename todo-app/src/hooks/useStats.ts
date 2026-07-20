import { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import type { Stats, WeeklyStats, Streak } from '@/types/common';

export function useStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null);
  const [streak, setStreak] = useState<Streak | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [s, w, st] = await Promise.all([
        invoke<Stats>('get_today_stats'),
        invoke<WeeklyStats>('get_weekly_stats'),
        invoke<Streak>('get_streak'),
      ]);
      setStats(s);
      setWeeklyStats(w);
      setStreak(st);
    } catch {
      // silent
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { stats, weeklyStats, streak, loading, refresh };
}
