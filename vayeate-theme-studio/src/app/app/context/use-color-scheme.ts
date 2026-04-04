import { useContextSelector } from 'use-context-selector';
import type { ColorScheme } from '../../../model/schemas';
import { AppContext } from '../../core/context/AppContext';

export type { ColorScheme };

export function useColorScheme(): { theme: ColorScheme } {
  const theme = useContextSelector(AppContext, (c) => c?.state.appConfig.colorScheme);
  if (theme === undefined) {
    throw new Error('useColorScheme must be used within AppProvider');
  }
  return { theme };
}
