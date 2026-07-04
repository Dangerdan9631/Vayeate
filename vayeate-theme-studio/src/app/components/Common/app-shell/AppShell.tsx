import { useAppShellViewModel } from '../../../viewmodel/Common/app-shell/use-app-shell-viewmodel';
import { ContentArea } from './ContentArea';
import { EyedropperOverlay } from '../eyedropper-overlay/EyedropperOverlay';
import { MenuBar } from '../menu-bar/MenuBar';
import { Ribbon } from '../ribbon/Ribbon';
import { StatusBar } from '../status-bar/StatusBar';
import { StyledTooltip } from '../styled-tooltip/StyledTooltip';

/**
 * Main application layout composing chrome, global overlays, and tab content.
 */
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
