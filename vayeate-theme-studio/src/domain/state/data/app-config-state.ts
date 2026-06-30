import type { ColorScheme } from '../../../model/schema/primitives';

/**
 * Application-wide configuration persisted in memory for the renderer shell.
 */
export interface AppConfigState {
  colorScheme: ColorScheme;
}

/**
 * Default app configuration used on cold start before config is loaded.
 */
export const initialAppConfigState: AppConfigState = { colorScheme: 'dark' };
