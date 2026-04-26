import { useAppShellViewModel } from './use-app-shell-viewmodel';
import { ContentArea } from './ContentArea';
import { EyedropperOverlay } from '../../common/eyedropper-overlay/EyedropperOverlay';
import { MenuBar } from '../menu-bar/MenuBar';
import { Ribbon } from '../ribbon/Ribbon';
import { StatusBar } from '../status-bar/StatusBar';
import { StyledTooltip } from '../../common/styled-tooltip/StyledTooltip';

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
