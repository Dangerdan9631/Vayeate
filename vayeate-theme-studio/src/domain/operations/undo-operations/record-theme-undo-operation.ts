import { singleton } from 'tsyringe';
import type { UndoDiff } from '../../../model/undo-history';
import type { ThemeUndoActionType } from '../../../model/undo-action-types';
import { BuildUniversalUndoProcessorOperation } from './build-universal-undo-processor-operation';
import {
  RecordUndoEntryOperation,
  type RecordUndoEntryResult,
} from './record-undo-entry-operation';
import { undoValuesEqual } from './undo-values-equal';

export interface RecordThemeUndoDiffInput {
  actionType: ThemeUndoActionType | string;
  target: string;
  before: unknown;
  after: unknown;
}

export interface RecordThemeUndoInput {
  description: string;
  actionType: ThemeUndoActionType | string;
  target: string;
  before: unknown;
  after: unknown;
  extraDiffs?: readonly RecordThemeUndoDiffInput[];
}

@singleton()
export class RecordThemeUndoOperation {
  constructor(
    private readonly recordUndoEntry: RecordUndoEntryOperation,
    private readonly buildUniversalUndoProcessor: BuildUniversalUndoProcessorOperation,
  ) {}

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

    if (diffs.every((diff) => undoValuesEqual(diff.before, diff.after))) {
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
