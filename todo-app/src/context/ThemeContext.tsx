import { createContext, useContext, ReactNode } from 'react';
import { useTheme } from '@/hooks/useTheme';

interface ThemeContextValue {
  theme: 'light' | 'dark';
  accentColor: string;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  accentColor: '#60cdff',
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { theme, accentColor } = useTheme();
  return (
    <ThemeContext.Provider value={{ theme, accentColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  return useContext(ThemeContext);
}
