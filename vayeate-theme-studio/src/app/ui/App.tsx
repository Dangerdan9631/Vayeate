import { useCallback, useEffect } from 'react';
import './styles.css';
import { container } from 'tsyringe';
import { LoadAppController, UnloadAppController } from '../../domain/controllers/app-controller';
import { AppProvider } from './context/AppContext';
import { ColorSchemeProvider, useActiveTab, useAppDispatch } from './context/app-context-hooks';
import { ContentArea } from './components/app/ContentArea';
import { EyedropperOverlay } from './components/app/EyedropperOverlay';
import { MenuBar } from './components/app/MenuBar';
import { Ribbon } from './components/app/Ribbon';
import { StatusBar } from './components/app/StatusBar';
import { StyledTooltip } from './components/common/StyledTooltip';
import type { TabId } from './tabs';
import { AppActionType } from '../actions/action-types';
import type { AppConfigState } from '../../domain/state/app-config/app-config-state';

function AppShell() {
  const activeTab = useActiveTab();
  const dispatch = useAppDispatch();

  useEffect(() => {
    container.resolve(LoadAppController).run();
    const unload = container.resolve(UnloadAppController);
    return () => unload.run();
  }, []);

  const onTabChange = useCallback(
    (tabId: TabId) => {
      dispatch({ type: AppActionType.AppRibbonTabButtonOnClick, tabId });
    },
    [dispatch],
  );

  return (
    <div className="app-shell">
      <EyedropperOverlay />
      <StyledTooltip />
      <MenuBar />
      <div className="layout">
        <Ribbon activeTab={activeTab} onTabChange={onTabChange} />
        <main className="content">
          <ContentArea activeTab={activeTab} />
        </main>
      </div>
      <StatusBar />
    </div>
  );
}

export function App({ initialAppConfig }: { initialAppConfig: AppConfigState }) {
  return (
    <AppProvider initialAppConfig={initialAppConfig}>
      <ColorSchemeProvider>
        <AppShell />
      </ColorSchemeProvider>
    </AppProvider>
  );
}
