import { useContextSelector } from 'use-context-selector';
import type { TabId } from '../../../domain/state/ui/ui-state';
import { AppContext } from '../../core/context/AppContext';

export function useActiveTab(): TabId {
  const tab = useContextSelector(AppContext, (c) => c?.state.ui.activeTabId);
  if (tab === undefined) {
    throw new Error('useActiveTab must be used within AppProvider');
  }
  return tab;
}
