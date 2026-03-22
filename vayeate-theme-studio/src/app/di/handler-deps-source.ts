import type { HandlerDeps } from '../handlers/handler-types';

/** Supplies current React-bound {@link HandlerDeps} for {@link ActionQueue} (registered from `AppProvider`). */
export interface IHandlerDepsSource {
  get(): HandlerDeps;
}

/** DI token for {@link IHandlerDepsSource} (tsyringe `registerInstance`). */
export const handlerDepsSourceToken = Symbol('HandlerDepsSource');
