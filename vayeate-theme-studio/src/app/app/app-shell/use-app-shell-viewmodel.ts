import { useEffect, useMemo, useRef } from 'react';
import { container } from 'tsyringe';
import type { TabId } from '../../../model/app-ui';
import { UiStore } from '../../../domain/state/ui/ui-store';
import { useStore } from 'zustand';
import { LoadAppController } from './controllers/load-app-controller';
import { UnloadAppController } from './controllers/unload-app-controller';

const uiStore = container.resolve(UiStore);

export interface AppShellViewModel {
  activeTab: TabId;
}

export function useAppShellViewModel(): AppShellViewModel {
  const activeTab = useStore(uiStore.api, (state) => state.state.activeTabId);

  const pageLoaded = useRef(false);

  useEffect(() => {
    if (pageLoaded.current) return;
    pageLoaded.current = true;

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
