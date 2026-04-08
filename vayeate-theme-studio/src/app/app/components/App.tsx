import '../../core/components/styles.css';
import { AppProvider } from '../../core/components/AppProvider';
import { ColorSchemeProvider } from '../../core/components/ColorSchemeProvider';
import { useAppShellViewModel } from '../viewmodel/use-app-shell-viewmodel';
import { ContentArea } from './ContentArea';
import { EyedropperOverlay } from '../../theme/components/EyedropperOverlay';
import { MenuBar } from './MenuBar';
import { Ribbon } from './Ribbon';
import { StatusBar } from './StatusBar';
import { StyledTooltip } from '../../common/components/StyledTooltip';
import type { AppConfigState } from '../../../domain/state/app-config/app-config-state';

function AppShell() {
  const { activeTab } = useAppShellViewModel();

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
