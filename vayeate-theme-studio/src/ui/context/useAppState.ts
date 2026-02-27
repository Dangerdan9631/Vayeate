import { useContext } from 'react';
import { AppContext, type AppContextValue } from './AppContext';

export function useAppState(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useAppState must be used within AppProvider');
  }
  return ctx;
}
