import { singleton } from 'tsyringe';
import type { ScopeColorMap, ScopeColorMapInputs } from './scope-resolver-operation';

/**
 * Message posted to the scope resolver worker to build one scope color map.
 */
export interface ScopeResolverWorkerRequest {
  type: 'build-scope-map';
  sequence: number;
  inputs: ScopeColorMapInputs;
}

/**
 * Message posted back from the worker with the resolved scope color map.
 */
export interface ScopeResolverWorkerResponse {
  type: 'scope-map-result';
  sequence: number;
  scopeColorMap: ScopeColorMap;
}

/**
 * Operation wrapper for theme scope resolver worker messages helpers.
 */
@singleton()
export class ScopeResolverWorkerMessagesOperation {}


