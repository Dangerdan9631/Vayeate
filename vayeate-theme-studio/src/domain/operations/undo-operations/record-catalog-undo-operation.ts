import { singleton } from 'tsyringe';
import type { UndoDiff } from '../../../model/undo-history';
import type { CatalogUndoActionType } from '../../../model/undo-action-types';
import { BuildUniversalUndoProcessorOperation } from './build-universal-undo-processor-operation';
import {
  RecordUndoEntryOperation,
  type RecordUndoEntryResult,
} from './record-undo-entry-operation';
import { undoDiffValuesEqual } from './undo-values-equal';

/**
 * Input or state shape for record catalog undo diff input.
 */

export interface RecordCatalogUndoDiffInput {
  actionType: CatalogUndoActionType | string;
  target: string;
  before: unknown;
  after: unknown;
}

/**
 * Input or state shape for record catalog undo input.
 */

export interface RecordCatalogUndoInput {
  description: string;
  actionType: CatalogUndoActionType | string;
  target: string;
  before: unknown;
  after: unknown;
  extraDiffs?: readonly RecordCatalogUndoDiffInput[];
}

/**
 * Records an undo entry after catalog undo completes.
 */

@singleton()
export class RecordCatalogUndoOperation {
  constructor(
    private readonly recordUndoEntry: RecordUndoEntryOperation,
    private readonly buildUniversalUndoProcessor: BuildUniversalUndoProcessorOperation,
  ) {}

  /**
   * Runs the record catalog undo mutation.
   * @param input Input (RecordCatalogUndoInput).
   * @returns Promise resolving to RecordUndoEntryResult.
   */

  async execute(input: RecordCatalogUndoInput): Promise<RecordUndoEntryResult> {
    const diffs: UndoDiff[] = [
      {
        actionType: input.actionType,
        target: input.target,
        before: input.before,
        after: input.after,
      },
      ...(input.extraDiffs ?? []).map((diff) => ({
        actionType: diff.actionType,
        target: diff.target,
        before: diff.before,
        after: diff.after,
      })),
    ];

    if (diffs.every((diff) => undoDiffValuesEqual(diff))) {
      return { status: 'not-recorded', entryId: null };
    }

    return this.recordUndoEntry.execute({
      completed: true,
      description: input.description,
      diffs,
      processor: this.buildUniversalUndoProcessor.execute(),
    });
  }
}
