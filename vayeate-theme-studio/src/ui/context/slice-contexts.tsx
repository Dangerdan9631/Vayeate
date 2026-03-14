import { createContext, useContext } from 'react';
import type { AppAction, AppActionV2 } from '../../actions/action-types';
import type {
  CatalogsState,
  TemplatesState,
  ThemesState,
} from '../../state/app-state';
import type { TabId } from '../tabs';

export const AppDispatchContext = createContext<((action: AppAction) => void) | null>(null);
export const AppDispatchV2Context = createContext<((action: AppActionV2) => void) | null>(null);
export const ActiveTabContext = createContext<TabId | null>(null);
export const CatalogsStateContext = createContext<CatalogsState | null>(null);
export const TemplatesStateContext = createContext<TemplatesState | null>(null);
export const ThemesStateContext = createContext<ThemesState | null>(null);

export function useAppDispatch(): (action: AppAction) => void {
  const dispatch = useContext(AppDispatchContext);
  if (!dispatch) {
    throw new Error('useAppDispatch must be used within AppProvider');
  }
  return dispatch;
}

export function useAppDispatchV2(): (action: AppActionV2) => void {
  const dispatchV2 = useContext(AppDispatchV2Context);
  if (!dispatchV2) {
    throw new Error('useAppDispatchV2 must be used within AppProvider');
  }
  return dispatchV2;
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
