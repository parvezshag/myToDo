import { useEffect, useMemo } from 'react';
import { useSettingsStore } from '@/store/settingsStore';

export function useTheme() {
  const { settings } = useSettingsStore();

  const isGlass = settings.theme === 'glass';

  const resolvedTheme = useMemo(() => {
    if (settings.theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    if (settings.theme === 'glass') return 'dark';
    return settings.theme;
  }, [settings.theme]);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', resolvedTheme);
    root.setAttribute('data-font-size', settings.font_size);
    root.setAttribute('data-glass', isGlass ? 'true' : 'false');
    root.style.setProperty('--accent-color', settings.accent_color);
    root.style.setProperty('--glass-opacity', String(settings.glass_intensity));
    root.style.setProperty('--window-opacity', String(settings.opacity));

    document.body.classList.toggle('glass-theme', isGlass);
    if (resolvedTheme === 'dark') {
      document.body.classList.add('dark');
      document.body.classList.remove('light');
    } else {
      document.body.classList.add('light');
      document.body.classList.remove('dark');
    }
  }, [
    resolvedTheme,
    isGlass,
    settings.accent_color,
    settings.glass_intensity,
    settings.opacity,
    settings.font_size,
  ]);

  useEffect(() => {
    if (settings.theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      const root = document.documentElement;
      root.setAttribute('data-theme', mq.matches ? 'dark' : 'light');
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [settings.theme]);

  return { theme: resolvedTheme, accentColor: settings.accent_color };
}
