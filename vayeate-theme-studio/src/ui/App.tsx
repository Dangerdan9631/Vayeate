import { useEffect, useState } from 'react';
import './styles.css';
import { AppProvider } from './context/AppContext';
import { useActiveTab, useAppDispatch } from './context/slice-contexts';
import { ContentArea } from './components/ContentArea';
import { MenuBar } from './components/MenuBar';
import { Ribbon } from './components/Ribbon';
import { StatusBar } from './components/StatusBar';
import type { TabId } from './tabs';

function AppShell() {
  const activeTab = useActiveTab();
  const dispatch = useAppDispatch();
  const [visibleTab, setVisibleTab] = useState<TabId>(activeTab);

  useEffect(() => {
    setVisibleTab(activeTab);
  }, [activeTab]);

  const onTabChange = (tabId: TabId) => {
    setVisibleTab(tabId);
    dispatch({ type: 'SET_ACTIVE_TAB', tabId });
  };

  return (
    <div className="app-shell">
      <MenuBar />
      <div className="layout">
        <Ribbon activeTab={visibleTab} onTabChange={onTabChange} />
        <main className="content">
          <ContentArea activeTab={visibleTab} />
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
