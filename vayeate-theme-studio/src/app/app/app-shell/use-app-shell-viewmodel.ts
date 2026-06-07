import { useEffect, useMemo, useRef } from 'react';
import { container } from 'tsyringe';
import type { TabId } from '../../../model/app-ui';
import { UiStore } from '../../../domain/state/ui/ui-store';
import { useStore } from 'zustand';
import { useAppDispatch } from '../../core/action-queue/use-app-dispatch';
import { AppShellActionType } from './actions/app-shell-action-type';

const uiStore = container.resolve(UiStore);

export interface AppShellViewModel {
  activeTab: TabId;
}

export function useAppShellViewModel(): AppShellViewModel {
  const dispatch = useAppDispatch();
  const activeTab = useStore(uiStore.api, (state) => state.state.activeTabId);

  const pageLoaded = useRef(false);

  useEffect(() => {
    if (pageLoaded.current) return;
    pageLoaded.current = true;

    void dispatch({ type: AppShellActionType.PageOnLoad });
    return () => {
      void dispatch({ type: AppShellActionType.PageOnUnload });
    };
  }, [dispatch]);

  return useMemo(() => {
    if (activeTab === undefined) {
      throw new Error('useAppShellViewModel must be used within AppProvider');
    }
    return { activeTab };
  }, [activeTab]);
}
