import { useCallback, useEffect, useState } from 'react';
import './styles.css';
import { AppProvider } from './context/AppContext';
import { ColorSchemeProvider } from './context/ColorSchemeContext';
import { useUndoStack } from './context/UndoContext';
import { useActiveTab, useAppDispatch, useAppDispatchV2 } from './context/slice-contexts';
import { ContentArea } from './components/ContentArea';
import { MenuBar } from './components/MenuBar';
import { Ribbon } from './components/Ribbon';
import { StatusBar } from './components/StatusBar';
import { StyledTooltip } from './components/StyledTooltip';
import type { TabId } from './tabs';

function AppShell() {
  const activeTab = useActiveTab();
  const dispatch = useAppDispatch();
  const dispatchV2 = useAppDispatchV2();
  const { undo, redo, canUndo, canRedo } = useUndoStack();
  const [visibleTab, setVisibleTab] = useState<TabId>(activeTab);

  useEffect(() => {
    setVisibleTab(activeTab);
  }, [activeTab]);

  useEffect(() => {
    dispatchV2({ type: 'APP_APP_ON_LOAD' });
  }, [dispatchV2]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      dispatchV2({ type: 'APP_APP_ON_CLOSE' });
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [dispatchV2]);

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
      dispatch({ type: 'TAB_BAR_ON_SELECT', tabId });
      dispatchV2({ type: 'APP_RIBBON_TAB_BUTTON_ON_CLICK', tabId });
    },
    [dispatch, dispatchV2],
  );

  return (
    <div className="app-shell">
      <StyledTooltip />
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
