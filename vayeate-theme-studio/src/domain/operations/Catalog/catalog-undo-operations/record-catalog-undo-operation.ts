import { singleton } from 'tsyringe';
import type { UndoDiff } from '../../../../model/Undo/undo-history';
import type { CatalogUndoActionType } from '../../../../model/Undo/undo-action-types';
import { BuildUniversalUndoProcessorOperation } from '../../Undo/undo-operations/build-universal-undo-processor-operation';
import {
  RecordUndoEntryOperation,
  type RecordUndoEntryResult,
} from '../../Undo/undo-operations/record-undo-entry-operation';
import { ValidateUndoDiffHasNoNetChange } from '../../../validations/Undo/undo-validations/validate-undo-diff-has-no-net-change';

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
    private readonly validateUndoDiffHasNoNetChange: ValidateUndoDiffHasNoNetChange,
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

    if (diffs.every((diff) => this.validateUndoDiffHasNoNetChange.test(diff))) {
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
