import { useCallback, useEffect } from 'react';
import './styles.css';
import { container } from 'tsyringe';
import { LoadAppController, UnloadAppController } from '../../domain/controllers/app-controller';
import { AppProvider } from './context/AppContext';
import { ColorSchemeProvider } from './context/ColorSchemeContext';
import { useActiveTab, useAppDispatch } from './context/slice-contexts';
import { ContentArea } from './components/ContentArea';
import { EyedropperOverlay } from './components/EyedropperOverlay';
import { MenuBar } from './components/MenuBar';
import { Ribbon } from './components/Ribbon';
import { StatusBar } from './components/StatusBar';
import { StyledTooltip } from './components/StyledTooltip';
import type { TabId } from './tabs';
import { AppActionType } from '../actions/action-types';

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

export function App() {
  return (
    <AppProvider>
      <ColorSchemeProvider>
        <AppShell />
      </ColorSchemeProvider>
    </AppProvider>
  );
}
