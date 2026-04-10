import { useContextSelector } from 'use-context-selector';
import { AppContext } from '../components/AppProvider';

export function useColorSchemeViewModel() {
  return useContextSelector(AppContext, (c) => {
    const theme = c?.state.appConfig.colorScheme;
    if (theme === undefined) {
      throw new Error('ColorSchemeProvider must be used within AppProvider');
    }
    return theme;
  });
}
