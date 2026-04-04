import { useEffect } from 'react';
import './styles.css';
import { container } from 'tsyringe';
import { LoadAppController, UnloadAppController } from '../../../domain/controllers/app-controller';
import { AppProvider } from '../context/AppContext';
import { ColorSchemeProvider } from '../context/color-scheme-provider';
import { useActiveTab } from '../../app/context/use-active-tab';
import { ContentArea } from '../../app/components/ContentArea';
import { EyedropperOverlay } from '../../theme/components/EyedropperOverlay';
import { MenuBar } from '../../app/components/MenuBar';
import { Ribbon } from '../../app/components/Ribbon';
import { StatusBar } from '../../app/components/StatusBar';
import { StyledTooltip } from '../../common/components/StyledTooltip';
import type { AppConfigState } from '../../../domain/state/app-config/app-config-state';

function AppShell() {
  const activeTab = useActiveTab();

  useEffect(() => {
    container.resolve(LoadAppController).run();
    const unload = container.resolve(UnloadAppController);
    return () => unload.run();
  }, []);

  return (
    <div className="app-shell">
      <EyedropperOverlay />
      <StyledTooltip />
      <MenuBar />
      <div className="layout">
        <Ribbon activeTab={activeTab} />
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
