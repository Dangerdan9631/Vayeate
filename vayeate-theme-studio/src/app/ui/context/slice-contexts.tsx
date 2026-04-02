import { createContext, useContext } from 'react';
import type { AppAction } from '../../actions/action-types';
import type { CatalogsState } from '../../../domain/state/catalog/catalogs-state';
import type { TemplatesState } from '../../../domain/state/template/templates-state';
import type { ThemesState } from '../../../domain/state/theme/themes-state';
import type { MenuOpenState } from '../../../domain/state/ui/ui-state';
import type { EyedropperUiState } from '../../../domain/state/ui/eyedropper-ui-state';
import type { TabId } from '../tabs';

export const AppDispatchContext = createContext<((action: AppAction) => Promise<void>) | null>(null);
export const ActiveTabContext = createContext<TabId | null>(null);
export const MenuOpenStateContext = createContext<MenuOpenState | null>(null);
export const EyedropperUiStateContext = createContext<EyedropperUiState | null>(null);
export const CatalogsStateContext = createContext<CatalogsState | null>(null);
export const TemplatesStateContext = createContext<TemplatesState | null>(null);
export const ThemesStateContext = createContext<ThemesState | null>(null);

/** Returns dispatch when inside AppProvider; otherwise a no-op so components can be tested in isolation. */
export function useAppDispatch(): (action: AppAction) => Promise<void> {
  const dispatch = useContext(AppDispatchContext);
  if (!dispatch) {
    return () => Promise.resolve();
  }
  return dispatch;
}

export function useActiveTab(): TabId {
  const activeTab = useContext(ActiveTabContext);
  if (activeTab === null) {
    throw new Error('useActiveTab must be used within AppProvider');
  }
  return activeTab;
}

export function useMenuOpenState(): MenuOpenState {
  const menuState = useContext(MenuOpenStateContext);
  if (!menuState) {
    throw new Error('useMenuOpenState must be used within AppProvider');
  }
  return menuState;
}

export function useEyedropperUiState(): EyedropperUiState {
  const eyedropperState = useContext(EyedropperUiStateContext);
  if (!eyedropperState) {
    throw new Error('useEyedropperUiState must be used within AppProvider');
  }
  return eyedropperState;
}

export function useCatalogsState(): CatalogsState {
  const slice = useContext(CatalogsStateContext);
  if (!slice) {
    throw new Error('useCatalogsState must be used within AppProvider');
  }
  return slice;
}

export function useTemplatesState(): TemplatesState {
  const slice = useContext(TemplatesStateContext);
  if (!slice) {
    throw new Error('useTemplatesState must be used within AppProvider');
  }
  return slice;
}

export function useThemesState(): ThemesState {
  const slice = useContext(ThemesStateContext);
  if (!slice) {
    throw new Error('useThemesState must be used within AppProvider');
  }
  return slice;
}
