import '../../core/components/styles.css';
import { AppProvider } from '../../core/components/AppProvider';
import { ColorSchemeProvider } from '../../core/components/ColorSchemeProvider';
import type { AppConfigState } from '../../../domain/state/app-config/app-config-state';
import { AppShell } from './AppShell';

export function App({ initialAppConfig }: { initialAppConfig: AppConfigState }) {
  return (
    <AppProvider initialAppConfig={initialAppConfig}>
      <ColorSchemeProvider>
        <AppShell />
      </ColorSchemeProvider>
    </AppProvider>
  );
}
