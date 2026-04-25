import { useEffect, type ReactNode } from 'react';
import { useColorSchemeViewModel } from './use-color-scheme-viewmodel';

export function ColorSchemeProvider({ children }: { children: ReactNode }) {
  const theme = useColorSchemeViewModel();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return <>{children}</>;
}
