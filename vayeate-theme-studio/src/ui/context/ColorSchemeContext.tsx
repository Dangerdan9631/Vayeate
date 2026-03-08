import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

const STORAGE_KEY = 'vayeate-theme-studio-color-scheme';

export type ColorScheme = 'light' | 'dark';

function readStoredScheme(): ColorScheme {
  if (typeof localStorage === 'undefined') return 'light';
  const v = localStorage.getItem(STORAGE_KEY);
  return v === 'dark' ? 'dark' : 'light';
}

function applyTheme(theme: ColorScheme) {
  document.documentElement.setAttribute('data-theme', theme);
}

interface ColorSchemeContextValue {
  theme: ColorScheme;
  toggleColorScheme: () => void;
}

const ColorSchemeContext = createContext<ColorSchemeContextValue | null>(null);

export function ColorSchemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ColorScheme>(() => readStoredScheme());

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggleColorScheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem(STORAGE_KEY, next);
      applyTheme(next);
      return next;
    });
  }, []);

  return (
    <ColorSchemeContext.Provider value={{ theme, toggleColorScheme }}>
      {children}
    </ColorSchemeContext.Provider>
  );
}

export function useColorScheme(): ColorSchemeContextValue {
  const value = useContext(ColorSchemeContext);
  if (!value) {
    throw new Error('useColorScheme must be used within ColorSchemeProvider');
  }
  return value;
}
