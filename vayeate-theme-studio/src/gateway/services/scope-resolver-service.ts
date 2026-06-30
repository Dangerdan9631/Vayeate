import { singleton } from 'tsyringe';
import type { ContrastVariable, Mapping } from '../../model/schema/template-schemas';
import type { ColorAssignment, ContrastAssignment } from '../../model/schema/theme-schemas';
import {
  buildScopeColorMapFromInputs,
  selectScopeColorMapInputs,
  type ScopeColorMap,
} from '../../domain/utils/scope-resolver';
import type {
  ScopeResolverWorkerRequest,
  ScopeResolverWorkerResponse,
} from '../../domain/utils/scope-resolver-worker-messages';

/**
 * Inputs required to build a scope color map off the main thread.
 */
export interface ScopeResolverInputs {
  mappings: readonly Mapping[];
  colorAssignments: readonly ColorAssignment[];
  contrastAssignments: readonly ContrastAssignment[];
  contrastVariables: readonly ContrastVariable[];
}

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
   * @param inputs - Mappings, color assignments, and contrast data for resolution.
   * @returns Resolved scope color map, or null when a newer request superseded this one.
   */
  buildScopeColorMap(inputs: ScopeResolverInputs): Promise<ScopeColorMap | null> {
    const seq = ++this.sequence;
    this.latestSequence = seq;
    const normalizedInputs = selectScopeColorMapInputs(
      inputs.mappings,
      inputs.colorAssignments,
      inputs.contrastAssignments,
      inputs.contrastVariables,
    );

    if (typeof Worker === 'undefined') {
      return new Promise((resolve) => {
        queueMicrotask(() => {
          const result = buildScopeColorMapFromInputs(normalizedInputs);
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
        inputs: normalizedInputs,
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
