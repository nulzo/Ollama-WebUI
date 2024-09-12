import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light' | 'system';
type Color = 'default' | 'purple' | 'orange' | 'green' | 'blue';

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  defaultColor?: Color;
  storageKeyTheme?: string;
  storageKeyColor?: string;
};

type ThemeProviderState = {
  theme: Theme;
  color: Color;
  setTheme: (theme: Theme) => void;
  setColor: (color: Color) => void;
};

const initialState: ThemeProviderState = {
  color: 'default',
  theme: 'system',
  setColor: () => null,
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  defaultColor = 'default',
  storageKeyTheme = 'vite-ui-theme',
  storageKeyColor = 'vite-ui-color',
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKeyTheme) as Theme) || defaultTheme
  );
  const [color, setColor] = useState<Color>(
    () => (localStorage.getItem(storageKeyColor) as Color) || defaultColor
  );

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      root.classList.add(systemTheme);
      return;
    }
    root.classList.add(theme);
  }, [theme]);

  useEffect(() => {
    const root = window.document.getElementById("root") ?? window.document.documentElement;

    // Remove all existing color theme classes
    const colorClasses = Array.from(root.classList).filter(c => c.startsWith('theme-'));
    colorClasses.forEach(c => root.classList.remove(c));

    // Add the new color theme class
    root.classList.add(`theme-${color}`);

  }, [color]);

  useEffect(() => {
    // Set initial class on mount or if default values change
    const root = window.document.documentElement;
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
    root.classList.add(`theme-${color}`);
  }, []);

  const value = {
    theme,
    color,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKeyTheme, theme);
      setTheme(theme);
    },
    setColor: (color: Color) => {
      localStorage.setItem(storageKeyColor, color);
      setColor(color);
    }
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
