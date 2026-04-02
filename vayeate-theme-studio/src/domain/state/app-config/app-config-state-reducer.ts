import type { AppState } from '../app-state';
import type { AppConfigState } from './app-config-state';

export type AppConfigStateUpdate =
  | { type: 'SET_APP_CONFIG_STATE'; config: AppConfigState }
  | { type: 'SET_COLOR_SCHEME'; scheme: 'light' | 'dark' };

export function appConfigStateReducer(state: AppState, update: AppConfigStateUpdate): AppState {
  switch (update.type) {
    case 'SET_APP_CONFIG_STATE':
      return { ...state, appConfig: update.config };
    case 'SET_COLOR_SCHEME':
      return { ...state, appConfig: { ...state.appConfig, colorScheme: update.scheme } };
    default:
      return state;
  }
}

export type SetAppConfigState = (update: AppConfigStateUpdate) => void;
export class AppConfigStateSetter {
  constructor(private readonly set: SetAppConfigState) { }

  apply(update: AppConfigStateUpdate): void {
    this.set(update);
  }
}

export type GetAppConfigState = () => AppConfigState;
export class AppConfigStateGetter {
  constructor(private readonly get: GetAppConfigState) { }

  current(): AppConfigState {
    return this.get();
  }
}