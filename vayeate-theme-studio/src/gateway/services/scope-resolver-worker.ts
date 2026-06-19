import { buildScopeColorMapFromInputs } from '../../domain/utils/scope-resolver';
import type {
  ScopeResolverWorkerRequest,
  ScopeResolverWorkerResponse,
} from '../../domain/utils/scope-resolver-worker-messages';

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
