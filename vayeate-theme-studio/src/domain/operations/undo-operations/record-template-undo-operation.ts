import { singleton } from 'tsyringe';
import type { Template } from '../../../model/schema/template-schemas';
import type { TemplateUndoActionType } from '../../../model/undo-action-types';
import { BuildUniversalUndoProcessorOperation } from './build-universal-undo-processor-operation';
import {
  RecordUndoEntryOperation,
  type RecordUndoEntryResult,
} from './record-undo-entry-operation';
import { undoValuesEqual } from './undo-values-equal';

export interface RecordTemplateUndoInput {
  description: string;
  actionType: TemplateUndoActionType | string;
  target: string;
  before: Template;
  after: Template;
}

@singleton()
export class RecordTemplateUndoOperation {
  constructor(
    private readonly recordUndoEntry: RecordUndoEntryOperation,
    private readonly buildUniversalUndoProcessor: BuildUniversalUndoProcessorOperation,
  ) {}

  async execute(input: RecordTemplateUndoInput): Promise<RecordUndoEntryResult> {
    if (undoValuesEqual(input.before, input.after)) {
      return { status: 'not-recorded', entryId: null };
    }

    return this.recordUndoEntry.execute({
      completed: true,
      description: input.description,
      diffs: [{
        actionType: input.actionType,
        target: input.target,
        before: input.before,
        after: input.after,
      }],
      processor: this.buildUniversalUndoProcessor.execute(),
    });
  }
}
