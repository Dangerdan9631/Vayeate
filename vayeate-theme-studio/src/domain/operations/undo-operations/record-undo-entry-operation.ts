import { singleton } from 'tsyringe';
import type { UndoFrame, UndoProcessor } from '../../core/undo-stack-types';
import { createFrameId } from '../../core/undo-stack-types';
import { undoManagerV2 } from '../../core/undo-manager-v2';
import { undoEntrySchema, type UndoDiff } from '../../../model/undo-history';
import { UndoStackStore } from '../../state/undo-stack/undo-stack-store';
import { refreshUndoSummary } from './undo-operation-helpers';
import { undoDiffValuesEqual } from './undo-values-equal';

/**
 * Input or state shape for record undo entry input.
 */

export interface RecordUndoEntryInput {
  description: string;
  diffs: UndoDiff[];
  processor: UndoProcessor;
  completed: boolean;
  coalesceWithPrevious?: boolean;
}

/**
 * Input or state shape for record undo entry result.
 */

export interface RecordUndoEntryResult {
  status: 'recorded' | 'not-recorded' | 'failed';
  entryId: string | null;
  message?: string;
}

/**
 * Records an undo entry after undo entry completes.
 */

@singleton()
export class RecordUndoEntryOperation {
  private sessionOrder = 0;

  constructor(
    private readonly undoStackStore: UndoStackStore,
  ) {}

  /**
   * Runs the record undo entry mutation.
   * @param input Input (RecordUndoEntryInput).
   * @returns Promise resolving to RecordUndoEntryResult.
   */

  async execute(input: RecordUndoEntryInput): Promise<RecordUndoEntryResult> {
    const contextKey = this.undoStackStore.getStore().state.currentUndoStackId;
    if (!contextKey) {
      return { status: 'not-recorded', entryId: null, message: 'No undo context is active.' };
    }
    if (!input.completed || input.diffs.length === 0 || !input.description.trim()) {
      return { status: 'not-recorded', entryId: null };
    }

    this.sessionOrder += 1;
    const entry: UndoFrame = undoEntrySchema.parse({
      id: createFrameId(),
      contextKey,
      description: input.description,
      diffs: input.diffs,
      createdAtSessionOrder: this.sessionOrder,
      persistenceStatus: 'pending',
    });

    try {
      const stack = await undoManagerV2.getOrCreate(contextKey, { processor: input.processor });
      await stack.push(entry, input.coalesceWithPrevious ? {
        canMerge: (existing, next) =>
          existing.contextKey === next.contextKey &&
          existing.diffs.length === next.diffs.length &&
          existing.diffs.every((diff, index) => {
            const nextDiff = next.diffs[index];
            return diff.actionType === nextDiff.actionType && diff.target === nextDiff.target;
          }),
        merge: (existing, next) => {
          const diffs = existing.diffs.map((diff, index) => ({
            ...diff,
            after: next.diffs[index].after,
          }));
          if (diffs.every((diff) => undoDiffValuesEqual(diff))) return null;
          return {
            ...existing,
            description: next.description,
            diffs,
          };
        },
      } : undefined);
      refreshUndoSummary(this.undoStackStore, stack);
      return { status: 'recorded', entryId: stack.list().currentId ?? entry.id };
    } catch (error) {
      return {
        status: 'failed',
        entryId: null,
        message: error instanceof Error ? error.message : 'Undo history recording failed.',
      };
    }
  }
}

