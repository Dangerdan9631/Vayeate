import { useCallback, useRef, type ReactNode } from 'react';
import { container } from 'tsyringe';
import type { AppAction } from '../actions/app-action';
import { AppContext, type AppContextValue } from '../app-context';
import { ActionQueue } from '../actions/action-queue';

export function AppProvider({ children }: { children: ReactNode }) {
  const queueRef = useRef<ActionQueue | null>(null);
  const dispatch = useCallback((action: AppAction): Promise<void> => {
    if (!queueRef.current) {
      queueRef.current = container.resolve(ActionQueue);
    }
    return queueRef.current!.enqueue(action);
  }, []);

  const value: AppContextValue = { dispatch };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
