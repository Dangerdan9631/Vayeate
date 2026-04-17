import { useEffect, useMemo } from 'react';
import { container } from 'tsyringe';
import type { TabId } from '../../../model/tab-id';
import { UiStore } from '../../../domain/state/ui/ui-store';
import { useStore } from 'zustand';
import { LoadAppController } from '../../../domain/controllers/app-controller/load-app-controller';
import { UnloadAppController } from '../../../domain/controllers/app-controller/unload-app-controller';

const uiStore = container.resolve(UiStore);

export interface AppShellViewModel {
  activeTab: TabId;
}

export function useAppShellViewModel(): AppShellViewModel {
  const activeTab = useStore(uiStore.api, (state) => state.state.activeTabId);

  useEffect(() => {
    void container.resolve(LoadAppController).run();
    const unload = container.resolve(UnloadAppController);
    return () => {
      void unload.run();
    };
  }, []);

  return useMemo(() => {
    if (activeTab === undefined) {
      throw new Error('useAppShellViewModel must be used within AppProvider');
    }
    return { activeTab };
  }, [activeTab]);
}
