import { useContextSelector } from 'use-context-selector';
import { useEffect, useMemo } from 'react';
import { container } from 'tsyringe';
import { LoadAppController, UnloadAppController } from '../../../domain/controllers/app-controller';
import type { TabId } from '../../../domain/state/ui/ui-state';
import { AppContext } from '../../core/components/AppProvider';

export interface AppShellViewModel {
  activeTab: TabId;
}

export function useAppShellViewModel(): AppShellViewModel {
  const activeTab = useContextSelector(AppContext, (c) => c?.state.ui.activeTabId);

  useEffect(() => {
    container.resolve(LoadAppController).run();
    const unload = container.resolve(UnloadAppController);
    return () => unload.run();
  }, []);

  return useMemo(() => {
    if (activeTab === undefined) {
      throw new Error('useAppShellViewModel must be used within AppProvider');
    }
    return { activeTab };
  }, [activeTab]);
}
