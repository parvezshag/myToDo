export type ThemeMode = 'light' | 'dark' | 'system' | 'glass';
export type FontSize = 'small' | 'medium' | 'large';
export type ViewMode = 'kanban' | 'calendar' | 'timeline' | 'heatmap';

export interface Settings {
  theme: ThemeMode;
  opacity: number;
  glass_intensity: number;
  notifications_enabled: boolean;
  always_on_top: boolean;
  auto_launch: boolean;
  font_size: FontSize;
  accent_color: string;
  desktop_mode: boolean;
  [key: string]: string | number | boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  theme: 'glass',
  opacity: 0.9,
  glass_intensity: 0.6,
  notifications_enabled: true,
  always_on_top: false,
  auto_launch: false,
  font_size: 'medium',
  accent_color: '#60cdff',
  desktop_mode: false,
};
