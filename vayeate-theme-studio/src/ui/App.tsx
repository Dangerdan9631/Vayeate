import './styles.css';
import { AppProvider, useAppState } from './context/AppContext';
import { ContentArea } from './components/ContentArea';
import { MenuBar } from './components/MenuBar';
import { Ribbon } from './components/Ribbon';
import { StatusBar } from './components/StatusBar';

function AppShell() {
  const { state, dispatch } = useAppState();

  return (
    <div className="app-shell">
      <MenuBar />
      <div className="layout">
        <Ribbon activeTab={state.activeTab} onTabChange={(tabId) => dispatch({ type: 'SET_ACTIVE_TAB', tabId })} />
        <main className="content">
          <ContentArea activeTab={state.activeTab} />
        </main>
      </div>
      <StatusBar />
    </div>
  );
}

export function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
