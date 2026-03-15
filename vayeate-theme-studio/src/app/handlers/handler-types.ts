import type { AppActionV2 } from '../actions/action-types';
import type { AppState } from '../../domain/state/app-state';
import type { AppStateUpdate } from '../../domain/state/app-state';
import type { UiStateUpdate } from '../../domain/state/ui-state-reducer';
import type { StoreStateUpdate } from '../../domain/state/store-state-reducer';

export type SetState = (update: AppStateUpdate) => void;
export type GetState = () => AppState;
export type SetUiState = (update: UiStateUpdate) => void;
export type SetStoreState = (update: StoreStateUpdate) => void;

export interface HandlerDeps {
  setState: SetState;
  getState: GetState;
  setUiState: SetUiState;
  setStoreState: SetStoreState;
}

export type AppAction = Extract<AppActionV2, { type: `APP_${string}` }>;
export type CatalogAction = Extract<AppActionV2, { type: `CATALOG_${string}` }>;
export type TemplateAction = Extract<AppActionV2, { type: `TEMPLATE_${string}` }>;
export type ThemeAction = Extract<AppActionV2, { type: `THEME_${string}` }>;

export type ActionHandler<T> = (action: T, deps: HandlerDeps) => Promise<void>;
