import { create } from 'zustand';
import type { Settings, ThemeMode, FontSize } from '@/types/settings';
import { DEFAULT_SETTINGS } from '@/types/settings';
import { invoke } from '@tauri-apps/api/core';

interface SettingsStore {
  settings: Settings;
  isLoaded: boolean;

  loadSettings: () => Promise<void>;
  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => Promise<void>;
  resetSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  isLoaded: false,

  loadSettings: async () => {
    try {
      const result = await invoke<{ settings: Record<string, string> }>('get_settings');
      const s = { ...DEFAULT_SETTINGS };
      for (const [key, value] of Object.entries(result.settings)) {
        if (key in s) {
          const existing = s[key as keyof Settings];
          if (typeof existing === 'boolean') {
            (s as Record<string, unknown>)[key] = value === 'true';
          } else if (typeof existing === 'number') {
            (s as Record<string, unknown>)[key] = parseFloat(value);
          } else {
            (s as Record<string, unknown>)[key] = value;
          }
        }
      }
      set({ settings: s, isLoaded: true });
    } catch {
      set({ isLoaded: true });
    }
  },

  updateSetting: async (key, value) => {
    set((state) => ({
      settings: { ...state.settings, [key]: value },
    }));
    try {
      await invoke('update_setting', { key, value: String(value) });
    } catch {
      // silent
    }
  },

  resetSettings: async () => {
    set({ settings: DEFAULT_SETTINGS });
    for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
      try {
        await invoke('update_setting', { key, value: String(value) });
      } catch {
        // silent
      }
    }
  },
}));
