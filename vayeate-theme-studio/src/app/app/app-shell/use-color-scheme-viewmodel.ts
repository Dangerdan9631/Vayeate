import { AppConfigStore } from '../../../domain/state/data/app-config-store';
import { container } from 'tsyringe';
import { useStore } from 'zustand';

const appConfigStore = container.resolve(AppConfigStore);

export function useColorSchemeViewModel() {
  return useStore(appConfigStore.api, (state) => state.config.colorScheme);
}
