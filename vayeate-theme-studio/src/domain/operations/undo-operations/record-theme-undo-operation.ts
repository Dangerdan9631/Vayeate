import { singleton } from 'tsyringe';
import type { UndoDiff } from '../../../model/undo-history';
import type { ThemeUndoActionType } from '../../../model/undo-action-types';
import { BuildUniversalUndoProcessorOperation } from './build-universal-undo-processor-operation';
import {
  RecordUndoEntryOperation,
  type RecordUndoEntryResult,
} from './record-undo-entry-operation';
import { undoDiffValuesEqual } from './undo-values-equal';

/**
 * Input or state shape for record theme undo diff input.
 */

export interface RecordThemeUndoDiffInput {
  actionType: ThemeUndoActionType | string;
  target: string;
  before: unknown;
  after: unknown;
}

/**
 * Input or state shape for record theme undo input.
 */

export interface RecordThemeUndoInput {
  description: string;
  actionType: ThemeUndoActionType | string;
  target: string;
  before: unknown;
  after: unknown;
  extraDiffs?: readonly RecordThemeUndoDiffInput[];
  coalesceWithPrevious?: boolean;
}

/**
 * Records an undo entry after theme undo completes.
 */

@singleton()
export class RecordThemeUndoOperation {
  constructor(
    private readonly recordUndoEntry: RecordUndoEntryOperation,
    private readonly buildUniversalUndoProcessor: BuildUniversalUndoProcessorOperation,
  ) {}

  /**
   * Runs the record theme undo mutation.
   * @param input Input (RecordThemeUndoInput).
   * @returns Promise resolving to RecordUndoEntryResult.
   */

  async execute(input: RecordThemeUndoInput): Promise<RecordUndoEntryResult> {
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
      coalesceWithPrevious: input.coalesceWithPrevious,
    });
  }
}
