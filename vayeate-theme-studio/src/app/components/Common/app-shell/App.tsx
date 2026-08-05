import '../../../../styles.css';
import { AppProvider } from './AppProvider';
import { ColorSchemeProvider } from './ColorSchemeProvider';
import { AppShell } from './AppShell';

/**
 * Root React entry that wires providers and renders the application shell.
 */
export function App() {
  return (
    <AppProvider>
      <ColorSchemeProvider>
        <AppShell />
      </ColorSchemeProvider>
    </AppProvider>
  );
}
