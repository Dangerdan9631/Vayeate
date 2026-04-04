import { useContextSelector } from 'use-context-selector';
import type { MenuOpenState } from '../../../domain/state/ui/ui-state';
import { AppContext } from '../../core/context/AppContext';

export function useMenuOpenState(): MenuOpenState {
  const menuState = useContextSelector(AppContext, (c) => c?.state.ui.menuOpen);
  if (menuState === undefined) {
    throw new Error('useMenuOpenState must be used within AppProvider');
  }
  return menuState;
}
