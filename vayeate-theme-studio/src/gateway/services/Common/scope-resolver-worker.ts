// Scope resolver helpers retain legacy tsyringe-decorated compatibility wrappers.
// Workers have a separate module realm, so they must initialize metadata before
// evaluating that helper graph.
import 'reflect-metadata';
import { buildScopeColorMapFromInputs } from '../../../domain/operations/Theme/theme-operations/theme-utils/scope-resolver-operation';
import type {
  ScopeResolverWorkerRequest,
  ScopeResolverWorkerResponse,
} from '../../../domain/operations/Theme/theme-operations/theme-utils/scope-resolver-worker-messages-operation';

/**
 * Handles scope map requests by running {@link buildScopeColorMapFromInputs} off the main thread.
 */
self.onmessage = (event: MessageEvent<ScopeResolverWorkerRequest>) => {
  const message = event.data;
  if (message.type !== 'build-scope-map') return;

  const scopeColorMap = buildScopeColorMapFromInputs(message.inputs);

  const response: ScopeResolverWorkerResponse = {
    type: 'scope-map-result',
    sequence: message.sequence,
    scopeColorMap,
  };
  self.postMessage(response);
};
