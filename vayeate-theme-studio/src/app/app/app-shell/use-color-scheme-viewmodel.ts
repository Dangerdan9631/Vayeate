import { AppConfigStore } from '../../../domain/state/data/app-config-store';
import { container } from 'tsyringe';
import { useStore } from 'zustand';

/**
 * Resolved app config store for color-scheme subscription.
 */
const appConfigStore = container.resolve(AppConfigStore);

/**
 * Reads the persisted light/dark color scheme from app config state.
 * @returns Current color scheme token applied by {@link ColorSchemeProvider}.
 */
export function useColorSchemeViewModel() {
  return useStore(appConfigStore.api, (state) => state.config.colorScheme);
}
