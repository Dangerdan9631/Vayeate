import { useEffect, type ReactNode } from 'react';
import { useContextSelector } from 'use-context-selector';
import { AppContext } from '../../core/context/AppContext';

/** Syncs `data-theme` on the document root when app config color scheme changes. Must be inside `AppProvider`. */
export function ColorSchemeProvider({ children }: { children: ReactNode }) {
  const theme = useContextSelector(AppContext, (c) => c?.state.appConfig.colorScheme);
  if (theme === undefined) {
    throw new Error('ColorSchemeProvider must be used within AppProvider');
  }

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return <>{children}</>;
}
