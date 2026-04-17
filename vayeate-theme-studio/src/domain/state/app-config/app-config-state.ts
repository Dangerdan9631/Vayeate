import type { ColorScheme } from '../../../model/schema/primitives';
export interface AppConfigState {
  colorScheme: ColorScheme;
}

export const initialAppConfigState: AppConfigState = { colorScheme: 'dark' };
