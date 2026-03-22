import {
  AppActionType,
  CatalogActionType,
  TemplateActionType,
  ThemeActionType,
  type AppActionV2,
} from '../actions/action-types';
import type { AppState } from '../../domain/state/app-state';
import type { AppStateUpdate } from '../../domain/state/app-state';
import type { SetUiState } from '../../domain/state/ui-state-reducer';
import type { StoreStateUpdate } from '../../domain/state/store-state-reducer';

export type SetState = (update: AppStateUpdate) => void;
export type GetState = () => AppState;
export type SetStoreState = (update: StoreStateUpdate) => void;

export interface HandlerDeps {
  setState: SetState;
  getState: GetState;
  setUiState: SetUiState;
  setStoreState: SetStoreState;
}

export type AppAction = Extract<AppActionV2, { type: AppActionType }>;
export type CatalogAction = Extract<AppActionV2, { type: CatalogActionType }>;
export type TemplateAction = Extract<AppActionV2, { type: TemplateActionType }>;
export type ThemeAction = Extract<AppActionV2, { type: ThemeActionType }>;

const appTypes = new Set<string>(Object.values(AppActionType));
const catalogTypes = new Set<string>(Object.values(CatalogActionType));
const templateTypes = new Set<string>(Object.values(TemplateActionType));
const themeTypes = new Set<string>(Object.values(ThemeActionType));

export const isAppAction = (a: AppActionV2): a is AppAction => appTypes.has(a.type);
export const isCatalogAction = (a: AppActionV2): a is CatalogAction => catalogTypes.has(a.type);
export const isTemplateAction = (a: AppActionV2): a is TemplateAction => templateTypes.has(a.type);
export const isThemeAction = (a: AppActionV2): a is ThemeAction => themeTypes.has(a.type);

/** Routes a slice of `AppActionV2` to domain controllers (constructor-injected). */
export interface ActionHandler<T> {
  handle(action: T, deps: HandlerDeps): Promise<void>;
}
