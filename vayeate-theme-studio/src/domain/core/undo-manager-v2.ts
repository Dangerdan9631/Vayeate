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

function createUndoManagerState() {
  return {
    stacks: new Map<string, UndoStack>(),
    processors: new Map<string, UndoStackOptions['processor']>(),
    lruOrder: [] as string[],
    stackCount: DEFAULT_STACK_COUNT,
    persistenceAdapter: null as UndoPersistenceAdapter | null,
    diskMaxFrames: DEFAULT_DISK_MAX_FRAMES,
  };
}

function parsePersistedStack(raw: string | null): PersistedStack {
  if (!raw) return { frames: [], currentId: null };

  try {
    const parsed = JSON.parse(raw) as Partial<PersistedStack>;
    return {
      frames: Array.isArray(parsed.frames) ? parsed.frames as UndoFrame[] : [],
      currentId: typeof parsed.currentId === 'string' ? parsed.currentId : null,
    };
  } catch {
    return { frames: [], currentId: null };
  }
}

export function createUndoManagerV2(initialOptions?: UndoManagerOptions): UndoManagerV2 {
  const state = createUndoManagerState();

  function configure(options: UndoManagerOptions): void {
    if (options.stackCount != null) state.stackCount = options.stackCount;
    if (options.diskMaxFrames != null) state.diskMaxFrames = options.diskMaxFrames;
    if (options.persistence !== undefined) state.persistenceAdapter = options.persistence;
  }

  async function persistStack(stackId: string, stack: UndoStack): Promise<void> {
    if (!state.persistenceAdapter) return;
    await state.persistenceAdapter.saveStack(stackId, JSON.stringify(stack.getPersistedState()));
  }

  function touchLru(stackId: string): void {
    const i = state.lruOrder.indexOf(stackId);
    if (i >= 0) state.lruOrder.splice(i, 1);
    state.lruOrder.push(stackId);
  }

  async function release(stackId: string): Promise<void> {
    const stack = state.stacks.get(stackId);
    if (stack) {
      await persistStack(stackId, stack);
      state.stacks.delete(stackId);
    }
    const i = state.lruOrder.indexOf(stackId);
    if (i >= 0) state.lruOrder.splice(i, 1);
  }

  async function evictLru(): Promise<void> {
    while (state.lruOrder.length >= state.stackCount && state.lruOrder.length > 0) {
      await release(state.lruOrder[0]);
    }
  }

  if (initialOptions) configure(initialOptions);

  return {
    configure,

    async getOrCreate(stackId: string, options?: UndoStackOptions): Promise<UndoStack> {
      const existing = state.stacks.get(stackId);
      if (existing) {
        if (options?.processor && (options.processor.handlerCount ?? 0) > 0) {
          existing.setProcessor(options.processor);
          state.processors.set(stackId, options.processor);
        }
        touchLru(stackId);
        return existing;
      }

      const processor = options?.processor ?? state.processors.get(stackId);
      if (!processor) {
        throw new Error('UndoManagerV2.getOrCreate: processor is required when creating a new stack');
      }
      state.processors.set(stackId, processor);

      const persisted = parsePersistedStack(
        state.persistenceAdapter ? await state.persistenceAdapter.loadStack(stackId) : null,
      );
      const stack = createStack({
        ...options,
        processor,
        stackId,
        diskMaxFrames: state.diskMaxFrames,
        onAfterChange: async () => {
          const current = state.stacks.get(stackId);
          if (current) await persistStack(stackId, current);
        },
      });

      if (persisted.frames.length > 0) {
        stack.hydrate(persisted.frames, persisted.currentId);
      }

      await evictLru();
      state.stacks.set(stackId, stack);
      touchLru(stackId);
      return stack;
    },

    release,

    async clearPersisted(): Promise<void> {
      state.stacks.clear();
      state.processors.clear();
      state.lruOrder.length = 0;
      if (state.persistenceAdapter) await state.persistenceAdapter.clearPersisted();
    },
  };
}

export const undoManagerV2: UndoManagerV2 = createUndoManagerV2();
