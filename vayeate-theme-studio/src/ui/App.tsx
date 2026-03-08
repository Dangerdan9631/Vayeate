import { useCallback, useEffect, useState } from 'react';
import './styles.css';
import { AppProvider } from './context/AppContext';
import { ColorSchemeProvider } from './context/ColorSchemeContext';
import { useUndoStack } from './context/UndoContext';
import { useActiveTab, useAppDispatch } from './context/slice-contexts';
import { ContentArea } from './components/ContentArea';
import { MenuBar } from './components/MenuBar';
import { Ribbon } from './components/Ribbon';
import { StatusBar } from './components/StatusBar';
import type { TabId } from './tabs';

function AppShell() {
  const activeTab = useActiveTab();
  const dispatch = useAppDispatch();
  const { undo, redo, canUndo, canRedo } = useUndoStack();
  const [visibleTab, setVisibleTab] = useState<TabId>(activeTab);

  useEffect(() => {
    setVisibleTab(activeTab);
  }, [activeTab]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) {
          if (canRedo) {
            e.preventDefault();
            redo();
          }
        } else {
          if (canUndo) {
            e.preventDefault();
            undo();
          }
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        if (canRedo) {
          e.preventDefault();
          redo();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, canUndo, canRedo]);

  const onTabChange = useCallback(
    (tabId: TabId) => {
      setVisibleTab(tabId);
      dispatch({ type: 'SET_ACTIVE_TAB', tabId });
    },
    [dispatch],
  );

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
    <ColorSchemeProvider>
      <AppProvider>
        <AppShell />
      </AppProvider>
    </ColorSchemeProvider>
  );
}
