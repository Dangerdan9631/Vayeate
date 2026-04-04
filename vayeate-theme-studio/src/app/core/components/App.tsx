import { useCallback, useEffect } from 'react';
import './styles.css';
import { container } from 'tsyringe';
import { LoadAppController, UnloadAppController } from '../../../domain/controllers/app-controller';
import { AppProvider } from '../context/AppContext';
import { ColorSchemeProvider, useActiveTab, useAppDispatch } from '../../core/context/app-context-hooks';
import { ContentArea } from '../../app/components/ContentArea';
import { EyedropperOverlay } from '../../app/components/EyedropperOverlay';
import { MenuBar } from '../../app/components/MenuBar';
import { Ribbon } from '../../app/components/Ribbon';
import { StatusBar } from '../../app/components/StatusBar';
import { StyledTooltip } from '../../common/components/StyledTooltip';
import { AppActionType } from '../../app/actions/app-action-type';
import type { AppConfigState } from '../../../domain/state/app-config/app-config-state';
import { TabId } from '../../../domain/state/ui/ui-state';

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
