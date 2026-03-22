/**
 * App-level dependency injection: the root tsyringe `container` (from `main.tsx` /
 * `reflect-metadata`) resolves `@singleton()` / `@injectable()` services.
 *
 * In React, use `useResolve(Token)` from `tsyringe-react` to resolve a dependency
 * in a component (same global container as `AppContext`).
 */
export { useResolve } from 'tsyringe-react';
export { ActionProcessor } from '../handlers/handler-registry';
export {
  handlerDepsSourceToken,
  type IHandlerDepsSource,
} from './handler-deps-source';
