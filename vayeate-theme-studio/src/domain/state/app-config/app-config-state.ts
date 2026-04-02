import type { ColorScheme } from '../../../model/schemas';
export interface AppConfigState {
  colorScheme: ColorScheme;
}

export const initialAppConfigState: AppConfigState = { colorScheme: 'dark' };
