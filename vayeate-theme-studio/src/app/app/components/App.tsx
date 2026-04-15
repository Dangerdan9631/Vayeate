import '../../core/components/styles.css';
import { AppProvider } from '../../core/components/AppProvider';
import { ColorSchemeProvider } from '../../core/components/ColorSchemeProvider';
import { AppShell } from './AppShell';

export function App() {
  return (
    <AppProvider>
      <ColorSchemeProvider>
        <AppShell />
      </ColorSchemeProvider>
    </AppProvider>
  );
}
