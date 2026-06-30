import { useEffect, type ReactNode } from 'react';
import { useColorSchemeViewModel } from './use-color-scheme-viewmodel';

/**
 * Applies the persisted color scheme to the document root for CSS theme tokens.
 */
export function ColorSchemeProvider({ children }: { children: ReactNode }) {
  const theme = useColorSchemeViewModel();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return <>{children}</>;
}
