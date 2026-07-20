import { create } from 'zustand';
import type { ViewMode } from '@/types/settings';

interface UIStore {
  isSettingsOpen: boolean;
  isPomodoroOpen: boolean;
  isFocusMode: boolean;
  activeView: ViewMode;
  selectedTaskId: string | null;
  isQuickAddOpen: boolean;
  showCompleted: boolean;

  toggleSettings: () => void;
  togglePomodoro: () => void;
  toggleFocusMode: () => void;
  setActiveView: (view: ViewMode) => void;
  selectTask: (id: string | null) => void;
  toggleQuickAdd: () => void;
  setShowCompleted: (val: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isSettingsOpen: false,
  isPomodoroOpen: false,
  isFocusMode: false,
  activeView: 'kanban',
  selectedTaskId: null,
  isQuickAddOpen: false,
  showCompleted: true,

  toggleSettings: () => set((s) => ({ isSettingsOpen: !s.isSettingsOpen })),
  togglePomodoro: () => set((s) => ({ isPomodoroOpen: !s.isPomodoroOpen })),
  toggleFocusMode: () => set((s) => ({ isFocusMode: !s.isFocusMode })),
  setActiveView: (view) => set({ activeView: view }),
  selectTask: (id) => set({ selectedTaskId: id }),
  toggleQuickAdd: () => set((s) => ({ isQuickAddOpen: !s.isQuickAddOpen })),
  setShowCompleted: (val) => set({ showCompleted: val }),
}));
