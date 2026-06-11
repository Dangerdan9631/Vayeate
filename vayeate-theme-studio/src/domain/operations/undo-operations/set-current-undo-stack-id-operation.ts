import { singleton } from 'tsyringe';
import { undoManagerV2 } from '../../core/undo-manager-v2';
import { UndoStackStore } from '../../state/undo-stack/undo-stack-store';
import type { TabId } from '../../../model/app-ui';
import { deriveUndoBaselineLabel, type UndoContext } from '../../../model/undo-history';
import { undoStackDataFileKey } from '../../../model/data-path-keys';
import { EnqueueBackgroundQueueActionOperation } from '../background-queue/enqueue-background-queue-action-operation';
import { BuildUniversalUndoProcessorOperation } from './build-universal-undo-processor-operation';
import { refreshUndoSummary } from './undo-operation-helpers';

/**
 * Updates current undo stack id in the domain or UI store.
 */

@singleton()
export class SetCurrentUndoStackIdOperation {
  constructor(
    private readonly undoStackStore: UndoStackStore,
    private readonly buildUniversalUndoProcessor: BuildUniversalUndoProcessorOperation,
    private readonly enqueueBackgroundAction: EnqueueBackgroundQueueActionOperation,
  ) {}

  /**
   * Runs the set current undo stack id mutation.
   * @param stackId Stack id (string | null).
   * @returns Nothing; updates store or invokes a gateway side effect.
   */

  execute(stackId: string | null): void {
    this.undoStackStore.getStore().setCurrentUndoStackId(stackId);
  }

  /**
   * Runs execute for context for set current undo stack id.
   * @param context Context (UndoContext | null).
   * @returns Nothing; updates store or invokes a gateway side effect.
   */

  executeForContext(context: UndoContext | null): void {
    const store = this.undoStackStore.getStore();
    store.setCurrentUndoStackId(context?.contextKey ?? null);
    store.setCurrentBaselineLabel(context ? deriveUndoBaselineLabel(context) : 'Opened');
    if (context) store.setLastContextForTab(context.tabId, context);
  }

  /**
   * Runs execute and load for context for set current undo stack id.
   * @param context Context (UndoContext | null).
   * @returns Nothing; updates store or invokes a gateway side effect.
   */

  executeAndLoadForContext(context: UndoContext | null): void {
    this.executeForContext(context);

    if (!context) {
      refreshUndoSummary(this.undoStackStore, null);
      return;
    }

    const processor = this.buildUniversalUndoProcessor.execute();
    const stack = undoManagerV2.getIfLoaded(context.contextKey, { processor });
    if (stack) {
      refreshUndoSummary(this.undoStackStore, stack);
      return;
    }

    refreshUndoSummary(this.undoStackStore, null);
    const contextKey = context.contextKey;
    this.enqueueBackgroundAction.execute(
      'data_io',
      `Hydrate undo stack ${contextKey}`,
      async () => {
        const hydrated = await undoManagerV2.hydrateFromPersistence(contextKey, { processor });
        const store = this.undoStackStore.getStore();
        if (store.state.currentUndoStackId === contextKey) {
          refreshUndoSummary(this.undoStackStore, hydrated);
        }
      },
      { key: undoStackDataFileKey(contextKey), access: 'read' },
    );
  }

  /**
   * Runs execute and load for tab for set current undo stack id.
   * @param tabId Tab id (TabId).
   * @param fallbackContext Fallback context (UndoContext | null).
   * @returns Nothing; updates store or invokes a gateway side effect.
   */

  executeAndLoadForTab(tabId: TabId, fallbackContext: UndoContext | null): void {
    const context = this.undoStackStore.getStore().state.lastContextByTab[tabId] ?? fallbackContext;
    this.executeAndLoadForContext(context);
  }
}
