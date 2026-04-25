import { useCallback, useMemo, useRef, type ReactNode } from 'react';
import { container } from 'tsyringe';
import { ActionQueue } from '../../core/action-queue/action-queue';
import { AppAction } from '../../core/action-queue/app-action';
import { AppContextValue, AppContext } from './app-context';

export function AppProvider({ children }: { children: ReactNode }) {
  const queueRef = useRef<ActionQueue | null>(null);
  const dispatch = useCallback((action: AppAction): void => {
    if (!queueRef.current) {
      queueRef.current = container.resolve("IActionQueue");
    }
    queueRef.current!.enqueue(action);
  }, []);
  const value = useMemo<AppContextValue>(() => ({ dispatch }), [dispatch]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
