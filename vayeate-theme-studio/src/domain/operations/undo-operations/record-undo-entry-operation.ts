import { singleton } from 'tsyringe';
import type { UndoFrame, UndoProcessor } from '../../core/undo-stack-types';
import { createFrameId } from '../../core/undo-stack-types';
import { undoManagerV2 } from '../../core/undo-manager-v2';
import { undoEntrySchema, type UndoDiff } from '../../../model/undo-history';
import { UndoStackStore } from '../../state/undo-stack/undo-stack-store';
import { refreshUndoSummary } from './undo-operation-helpers';

export interface RecordUndoEntryInput {
  description: string;
  diffs: UndoDiff[];
  processor: UndoProcessor;
  completed: boolean;
}

export interface RecordUndoEntryResult {
  status: 'recorded' | 'not-recorded' | 'failed';
  entryId: string | null;
  message?: string;
}

@singleton()
export class RecordUndoEntryOperation {
  private sessionOrder = 0;

  constructor(
    private readonly undoStackStore: UndoStackStore,
  ) {}

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
      await stack.push(entry);
      refreshUndoSummary(this.undoStackStore, stack);
      return { status: 'recorded', entryId: entry.id };
    } catch (error) {
      return {
        status: 'failed',
        entryId: null,
        message: error instanceof Error ? error.message : 'Undo history recording failed.',
      };
    }
  }
}

