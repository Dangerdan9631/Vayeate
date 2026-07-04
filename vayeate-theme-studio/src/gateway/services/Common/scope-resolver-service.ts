import { singleton } from 'tsyringe';
import {
  buildScopeColorMapFromInputs,
  type ScopeColorMap,
  type ScopeColorMapInputs,
} from '../../../domain/operations/Theme/theme-operations/theme-utils/scope-resolver-operation';
import type {
  ScopeResolverWorkerRequest,
  ScopeResolverWorkerResponse,
} from '../../../domain/operations/Theme/theme-operations/theme-utils/scope-resolver-worker-messages-operation';

/**
 * Runs scope color map and contrast resolution off the main thread with request coalescing.
 */
@singleton()
export class ScopeResolverService {
  private worker: Worker | null = null;
  private sequence = 0;
  private latestSequence = 0;

  /**
   * Builds a scope color map from template mappings and theme assignments off the main thread.
   *
   * @param inputs - Normalized scope-map inputs for resolution.
   * @returns Resolved scope color map, or null when a newer request superseded this one.
   */
  buildScopeColorMap(inputs: ScopeColorMapInputs): Promise<ScopeColorMap | null> {
    const seq = ++this.sequence;
    this.latestSequence = seq;

    if (typeof Worker === 'undefined') {
      return new Promise((resolve) => {
        queueMicrotask(() => {
          const result = buildScopeColorMapFromInputs(inputs);
          resolve(seq !== this.latestSequence ? null : result);
        });
      });
    }

    return new Promise((resolve, reject) => {
      const worker = this.getWorker();

      const onMessage = (event: MessageEvent<ScopeResolverWorkerResponse>) => {
        const message = event.data;
        if (message.type !== 'scope-map-result' || message.sequence !== seq) return;
        worker.removeEventListener('message', onMessage);
        worker.removeEventListener('error', onError);
        if (seq !== this.latestSequence) {
          resolve(null);
          return;
        }
        resolve(message.scopeColorMap);
      };

      const onError = (event: ErrorEvent) => {
        worker.removeEventListener('message', onMessage);
        worker.removeEventListener('error', onError);
        reject(event.error ?? new Error(event.message));
      };

      worker.addEventListener('message', onMessage);
      worker.addEventListener('error', onError);

      const request: ScopeResolverWorkerRequest = {
        type: 'build-scope-map',
        sequence: seq,
        inputs,
      };
      worker.postMessage(request);
    });
  }

  /**
   * Lazily creates the scope resolver web worker module.
   *
   * @returns Shared worker instance for scope map requests.
   */
  private getWorker(): Worker {
    if (!this.worker) {
      this.worker = new Worker(new URL('./scope-resolver-worker.ts', import.meta.url), { type: 'module' });
    }
    return this.worker;
  }
}
