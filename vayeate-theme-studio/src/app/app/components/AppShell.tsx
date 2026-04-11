import { useAppShellViewModel } from '../viewmodel/use-app-shell-viewmodel';
import { ContentArea } from './ContentArea';
import { EyedropperOverlay } from './EyedropperOverlay';
import { MenuBar } from './MenuBar';
import { Ribbon } from './Ribbon';
import { StatusBar } from './StatusBar';
import { StyledTooltip } from './StyledTooltip';

export function AppShell() {
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
