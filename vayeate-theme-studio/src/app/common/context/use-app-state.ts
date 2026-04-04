import { useContext } from 'use-context-selector';
import { AppContext, type AppContextValue } from '../../core/context/AppContext';

export function useAppState(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useAppState must be used within AppProvider');
  }
  return ctx;
}
