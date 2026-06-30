import type { ScopeColorMap, ScopeColorMapInputs } from './scope-resolver';

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
