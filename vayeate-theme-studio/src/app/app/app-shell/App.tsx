import '../../../styles.css';
import { AppProvider } from './AppProvider';
import { ColorSchemeProvider } from './ColorSchemeProvider';
import { AppShell } from '../app-shell/AppShell';

export function App() {
  return (
    <AppProvider>
      <ColorSchemeProvider>
        <AppShell />
      </ColorSchemeProvider>
    </AppProvider>
  );
}
