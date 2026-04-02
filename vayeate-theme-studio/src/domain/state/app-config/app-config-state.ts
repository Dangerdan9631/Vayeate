import type { ColorScheme } from '../../../model/schemas';

/** App preferences held in React state; persisted shape is `AppConfig` / `appConfigSchema`. */
export interface AppConfigState {
  colorScheme: ColorScheme;
}

export const initialAppConfigState: AppConfigState = { colorScheme: 'dark' };
