import { useContextSelector } from 'use-context-selector';
import type { ThemesState } from '../../../domain/state/theme/themes-state';
import { AppContext } from '../../core/context/AppContext';

export function useThemesState(): ThemesState {
  const slice = useContextSelector(AppContext, (c) => c?.state.themes);
  if (slice === undefined) {
    throw new Error('useThemesState must be used within AppProvider');
  }
  return slice;
}
