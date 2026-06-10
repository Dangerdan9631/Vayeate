import { singleton } from 'tsyringe';
import type { Catalog } from '../../../model/schema/catalog';
import type { CatalogUndoActionType } from '../../../model/undo-action-types';
import { BuildUniversalUndoProcessorOperation } from './build-universal-undo-processor-operation';
import {
  RecordUndoEntryOperation,
  type RecordUndoEntryResult,
} from './record-undo-entry-operation';
import { undoValuesEqual } from './undo-values-equal';

export interface RecordCatalogUndoInput {
  description: string;
  actionType: CatalogUndoActionType | string;
  target: string;
  before: Catalog;
  after: Catalog;
}

@singleton()
export class RecordCatalogUndoOperation {
  constructor(
    private readonly recordUndoEntry: RecordUndoEntryOperation,
    private readonly buildUniversalUndoProcessor: BuildUniversalUndoProcessorOperation,
  ) {}

  async execute(input: RecordCatalogUndoInput): Promise<RecordUndoEntryResult> {
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
