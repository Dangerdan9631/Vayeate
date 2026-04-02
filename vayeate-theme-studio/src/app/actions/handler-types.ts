import { AppActionType } from './app-action-type';
import { CatalogActionType } from './catalog-action-type';
import { TemplateActionType } from './template-action-type';
import { ThemeActionType } from './theme-action-type';
import type { AppAction as AppActionUnion } from './app-action';

export type AppAction = Extract<AppActionUnion, { type: AppActionType }>;
export type CatalogAction = Extract<AppActionUnion, { type: CatalogActionType }>;
export type TemplateAction = Extract<AppActionUnion, { type: TemplateActionType }>;
export type ThemeAction = Extract<AppActionUnion, { type: ThemeActionType }>;

const appTypes = new Set<string>(Object.values(AppActionType));
const catalogTypes = new Set<string>(Object.values(CatalogActionType));
const templateTypes = new Set<string>(Object.values(TemplateActionType));
const themeTypes = new Set<string>(Object.values(ThemeActionType));

export const isAppAction = (a: AppActionUnion): a is AppAction => appTypes.has(a.type);
export const isCatalogAction = (a: AppActionUnion): a is CatalogAction => catalogTypes.has(a.type);
export const isTemplateAction = (a: AppActionUnion): a is TemplateAction => templateTypes.has(a.type);
export const isThemeAction = (a: AppActionUnion): a is ThemeAction => themeTypes.has(a.type);

/** Routes a slice of `AppAction` to domain controllers (constructor-injected). */
export interface ActionHandler<T> {
  handle(action: T): Promise<void>;
}
