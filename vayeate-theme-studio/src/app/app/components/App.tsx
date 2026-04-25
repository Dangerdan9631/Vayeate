import '../../../styles.css';
import { AppProvider } from '../../app/components/AppProvider';
import { ColorSchemeProvider } from '../../app/components/ColorSchemeProvider';
import { AppShell } from './app-shell/AppShell';

export function App() {
  return (
    <AppProvider>
      <ColorSchemeProvider>
        <AppShell />
      </ColorSchemeProvider>
    </AppProvider>
  );
}
