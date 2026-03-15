import { createContext, useContext } from 'react';
import type { AppActionV2 } from '../../actions/action-types';
import type {
  CatalogsState,
  StoreState,
  TemplatesState,
  ThemesState,
} from '../../../domain/state/app-state';
import type { TabId } from '../tabs';

export const AppDispatchContext = createContext<((action: AppActionV2) => Promise<void>) | null>(null);
export const ActiveTabContext = createContext<TabId | null>(null);
export const CatalogsStateContext = createContext<CatalogsState | null>(null);
export const TemplatesStateContext = createContext<TemplatesState | null>(null);
export const ThemesStateContext = createContext<ThemesState | null>(null);
export const StoreStateContext = createContext<StoreState | null>(null);

/** Returns dispatch when inside AppProvider; otherwise a no-op so components can be tested in isolation. */
export function useAppDispatch(): (action: AppActionV2) => Promise<void> {
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

export function useStoreState(): StoreState {
  const store = useContext(StoreStateContext);
  if (!store) {
    throw new Error('useStoreState must be used within AppProvider');
  }
  return store;
}
