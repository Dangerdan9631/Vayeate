/**
 * UndoManagerV2: HashMap of history stacks keyed by stack id.
 * Each stack is a double-linked list of frames with a current-frame pointer.
 * Frames have a list of undo actions (discriminated union); a processor applies or reverts each action via a switch on action.type.
 * Supports persistence (one JSON file per stack in .undo), LRU in-memory cap,
 * and in-memory frame trim with full history on disk.
 */

import { createStack } from './undo-stack';
import type {
  PersistedStack,
  UndoFrame,
  UndoManagerOptions,
  UndoManagerV2,
  UndoPersistenceAdapter,
  UndoStack,
  UndoStackOptions,
} from './undo-stack-types';
import { DEFAULT_DISK_MAX_FRAMES, DEFAULT_STACK_COUNT } from './undo-stack-types';

export type { UndoManagerOptions, UndoManagerV2 } from './undo-stack-types';

const stacks = new Map<string, UndoStack>();
const lruOrder: string[] = [];
let stackCount = DEFAULT_STACK_COUNT;
let persistenceAdapter: UndoPersistenceAdapter | null = null;
let diskMaxFrames = DEFAULT_DISK_MAX_FRAMES;

function persistStack(stackId: string, stack: UndoStack): void {
  const getState = stack.getPersistedState;
  if (!getState || !persistenceAdapter) return;
  const state = getState();
  void persistenceAdapter.saveStack(stackId, JSON.stringify(state));
}

function touchLru(stackId: string): void {
  const i = lruOrder.indexOf(stackId);
  if (i >= 0) lruOrder.splice(i, 1);
  lruOrder.push(stackId);
}

function evictLru(): void {
  while (lruOrder.length >= stackCount && lruOrder.length > 0) {
    const id = lruOrder.shift()!;
    const stack = stacks.get(id);
    if (stack) {
      persistStack(id, stack);
      stacks.delete(id);
    }
  }
}

export function createUndoManagerV2(initialOptions?: UndoManagerOptions): UndoManagerV2 {
  if (initialOptions) {
    if (initialOptions.stackCount != null) stackCount = initialOptions.stackCount;
    if (initialOptions.diskMaxFrames != null) diskMaxFrames = initialOptions.diskMaxFrames;
    if (initialOptions.persistence !== undefined) persistenceAdapter = initialOptions.persistence;
  }

  return {
    configure(options: UndoManagerOptions): void {
      if (options.stackCount != null) stackCount = options.stackCount;
      if (options.diskMaxFrames != null) diskMaxFrames = options.diskMaxFrames;
      if (options.persistence !== undefined) persistenceAdapter = options.persistence;
    },

    async getOrCreate(stackId: string, options?: UndoStackOptions): Promise<UndoStack> {
      let stack = stacks.get(stackId);
      if (stack) {
        touchLru(stackId);
        return stack;
      }
      if (!options?.processor) {
        throw new Error('UndoManagerV2.getOrCreate: processor is required when creating a new stack');
      }
      let frames: UndoFrame[] = [];
      let currentId: string | null = null;
      if (persistenceAdapter) {
        const raw = await persistenceAdapter.loadStack(stackId);
        if (raw) {
          try {
            const parsed = JSON.parse(raw) as PersistedStack;
            if (Array.isArray(parsed.frames)) frames = parsed.frames;
            if (parsed.currentId != null) currentId = parsed.currentId;
          } catch {
            // ignore parse errors
          }
        }
      }
      const onAfterChange = persistenceAdapter
        ? () => {
            const s = stacks.get(stackId);
            if (s) persistStack(stackId, s);
          }
        : undefined;
      stack = createStack({
        ...options,
        stackId,
        diskMaxFrames,
        onAfterChange,
      });
      if (frames.length > 0 && stack.hydrate) {
        stack.hydrate(frames, currentId);
      }
      evictLru();
      stacks.set(stackId, stack);
      lruOrder.push(stackId);
      return stack;
    },

    async clearPersisted(): Promise<void> {
      stacks.clear();
      lruOrder.length = 0;
      if (persistenceAdapter) await persistenceAdapter.clearPersisted();
    },
  };
}

/** Single shared manager instance; configure with configure() or at create time. */
export const undoManagerV2: UndoManagerV2 = (() => {
  const m = createUndoManagerV2();
  return {
    configure: m.configure.bind(m),
    getOrCreate: m.getOrCreate.bind(m),
    clearPersisted: m.clearPersisted.bind(m),
  };
})();
