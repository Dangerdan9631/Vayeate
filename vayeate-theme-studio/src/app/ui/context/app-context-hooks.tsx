import { useEffect, type ReactNode } from 'react';
import { useContext, useContextSelector } from 'use-context-selector';
import type { AppAction } from '../../actions/action-types';
import type { CatalogsState } from '../../../domain/state/catalog/catalogs-state';
import type { TemplatesState } from '../../../domain/state/template/templates-state';
import type { ThemesState } from '../../../domain/state/theme/themes-state';
import type { MenuOpenState, TabId } from '../../../domain/state/ui/ui-state';
import type { EyedropperUiState } from '../../../domain/state/ui/eyedropper-ui-state';
import type { ColorScheme } from '../../../model/schemas';
import { AppContext, type AppContextValue } from './AppContext';

export type { ColorScheme };

export function useAppState(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useAppState must be used within AppProvider');
  }
  return ctx;
}

export function useAppDispatch(): (action: AppAction) => Promise<void> {
  const dispatch = useContextSelector(AppContext, (c) => c?.dispatch);
  return dispatch ?? (() => Promise.resolve());
}

export function useActiveTab(): TabId {
  const tab = useContextSelector(AppContext, (c) => c?.state.ui.activeTabId);
  if (tab === undefined) {
    throw new Error('useActiveTab must be used within AppProvider');
  }
  return tab;
}

export function useMenuOpenState(): MenuOpenState {
  const menuState = useContextSelector(AppContext, (c) => c?.state.ui.menuOpen);
  if (menuState === undefined) {
    throw new Error('useMenuOpenState must be used within AppProvider');
  }
  return menuState;
}

export function useEyedropperUiState(): EyedropperUiState {
  const eyedropperState = useContextSelector(AppContext, (c) => c?.state.ui.eyedropper);
  if (eyedropperState === undefined) {
    throw new Error('useEyedropperUiState must be used within AppProvider');
  }
  return eyedropperState;
}

export function useCatalogsState(): CatalogsState {
  const slice = useContextSelector(AppContext, (c) => c?.state.catalogs);
  if (slice === undefined) {
    throw new Error('useCatalogsState must be used within AppProvider');
  }
  return slice;
}

export function useTemplatesState(): TemplatesState {
  const slice = useContextSelector(AppContext, (c) => c?.state.templates);
  if (slice === undefined) {
    throw new Error('useTemplatesState must be used within AppProvider');
  }
  return slice;
}

export function useThemesState(): ThemesState {
  const slice = useContextSelector(AppContext, (c) => c?.state.themes);
  if (slice === undefined) {
    throw new Error('useThemesState must be used within AppProvider');
  }
  return slice;
}

export function useColorScheme(): { theme: ColorScheme } {
  const theme = useContextSelector(AppContext, (c) => c?.state.appConfig.colorScheme);
  if (theme === undefined) {
    throw new Error('useColorScheme must be used within AppProvider');
  }
  return { theme };
}

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
