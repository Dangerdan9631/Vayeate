import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { AppContext } from './AppContext';
import type { ColorScheme } from '../../../model/schemas';

export type { ColorScheme };

interface ColorSchemeContextValue {
  theme: ColorScheme;
}

const ColorSchemeContext = createContext<ColorSchemeContextValue | null>(null);

export function ColorSchemeProvider({ children }: { children: ReactNode }) {
  const appCtx = useContext(AppContext);
  if (!appCtx) {
    throw new Error('ColorSchemeProvider must be used within AppProvider');
  }

  const theme = appCtx.state.appConfig.colorScheme;

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return <ColorSchemeContext.Provider value={{ theme }}>{children}</ColorSchemeContext.Provider>;
}

export function useColorScheme(): ColorSchemeContextValue {
  const value = useContext(ColorSchemeContext);
  if (!value) {
    throw new Error('useColorScheme must be used within ColorSchemeProvider');
  }
  return value;
}
