import { createStack } from './undo-stack';
import {
  createUndoStackPersistScheduler,
  type PersistEnqueueFn,
  type UndoStackPersistScheduler,
} from './undo-stack-persist-scheduler';
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
export type { PersistEnqueueFn } from './undo-stack-persist-scheduler';

function createDefaultPersistEnqueue(): PersistEnqueueFn {
  return (_description, run) => {
    void Promise.resolve().then(run).catch(() => {
      // Persist failures are surfaced on flush/release or logged by the data_io queue.
    });
  };
}

function createUndoManagerState() {
  return {
    stacks: new Map<string, UndoStack>(),
    processors: new Map<string, UndoStackOptions['processor']>(),
    lruOrder: [] as string[],
    stackCount: DEFAULT_STACK_COUNT,
    persistenceAdapter: null as UndoPersistenceAdapter | null,
    diskMaxFrames: DEFAULT_DISK_MAX_FRAMES,
    persistEnqueue: createDefaultPersistEnqueue(),
    scheduler: null as UndoStackPersistScheduler | null,
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
  state.scheduler = createUndoStackPersistScheduler((description, run) => {
    state.persistEnqueue(description, run);
  });

  function schedulePersist(stackId: string, stack: UndoStack): void {
    if (!state.persistenceAdapter) return;
    const payload = JSON.stringify(stack.getPersistedState());
    state.scheduler!.schedulePersist(stackId, state.persistenceAdapter, payload);
  }

  function configure(options: UndoManagerOptions): void {
    if (options.stackCount != null) state.stackCount = options.stackCount;
    if (options.diskMaxFrames != null) state.diskMaxFrames = options.diskMaxFrames;
    if (options.persistence !== undefined) state.persistenceAdapter = options.persistence;
    if (options.persistEnqueue !== undefined) {
      state.persistEnqueue = options.persistEnqueue ?? createDefaultPersistEnqueue();
      state.scheduler = createUndoStackPersistScheduler((description, run) => {
        state.persistEnqueue(description, run);
      });
    }
  }

  function touchLru(stackId: string): void {
    const i = state.lruOrder.indexOf(stackId);
    if (i >= 0) state.lruOrder.splice(i, 1);
    state.lruOrder.push(stackId);
  }

  async function release(stackId: string): Promise<void> {
    const stack = state.stacks.get(stackId);
    if (stack) {
      await state.scheduler!.flushPersist(stackId);
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

  function applyProcessorUpdate(stack: UndoStack, stackId: string, options?: UndoStackOptions): void {
    if (options?.processor && (options.processor.handlerCount ?? 0) > 0) {
      stack.setProcessor(options.processor);
      state.processors.set(stackId, options.processor);
    }
  }

  function resolveProcessor(stackId: string, options?: UndoStackOptions): UndoStackOptions['processor'] {
    const processor = options?.processor ?? state.processors.get(stackId);
    if (!processor) {
      throw new Error('UndoManagerV2: processor is required when creating a new stack');
    }
    state.processors.set(stackId, processor);
    return processor;
  }

  function createHydratedStack(
    stackId: string,
    processor: UndoStackOptions['processor'],
    options: UndoStackOptions | undefined,
    persisted: PersistedStack,
  ): UndoStack {
    const stack = createStack({
      ...options,
      processor,
      stackId,
      diskMaxFrames: state.diskMaxFrames,
      onAfterChange: () => {
        const current = state.stacks.get(stackId);
        if (current) schedulePersist(stackId, current);
      },
    });

    if (persisted.frames.length > 0) {
      stack.hydrate(persisted.frames, persisted.currentId);
    }

    return stack;
  }

  async function hydrateFromPersistence(stackId: string, options: UndoStackOptions): Promise<UndoStack> {
    const existing = state.stacks.get(stackId);
    if (existing) {
      applyProcessorUpdate(existing, stackId, options);
      touchLru(stackId);
      return existing;
    }

    const processor = resolveProcessor(stackId, options);
    const persisted = parsePersistedStack(
      state.persistenceAdapter ? await state.persistenceAdapter.loadStack(stackId) : null,
    );
    const stack = createHydratedStack(stackId, processor, options, persisted);

    await evictLru();
    state.stacks.set(stackId, stack);
    touchLru(stackId);
    return stack;
  }

  if (initialOptions) configure(initialOptions);

  return {
    configure,

    getIfLoaded(stackId: string, options?: UndoStackOptions): UndoStack | null {
      const existing = state.stacks.get(stackId);
      if (!existing) return null;
      applyProcessorUpdate(existing, stackId, options);
      touchLru(stackId);
      return existing;
    },

    hydrateFromPersistence,

    async getOrCreate(stackId: string, options?: UndoStackOptions): Promise<UndoStack> {
      const loaded = state.stacks.get(stackId);
      if (loaded) {
        applyProcessorUpdate(loaded, stackId, options);
        touchLru(stackId);
        return loaded;
      }

      return hydrateFromPersistence(stackId, {
        ...options,
        processor: resolveProcessor(stackId, options),
      });
    },

    release,

    async flushPendingPersists(stackId?: string): Promise<void> {
      if (stackId) {
        await state.scheduler!.flushPersist(stackId);
        return;
      }
      await state.scheduler!.flushAll();
    },

    async clearPersisted(): Promise<void> {
      state.scheduler!.cancelAll();
      state.stacks.clear();
      state.processors.clear();
      state.lruOrder.length = 0;
      if (state.persistenceAdapter) await state.persistenceAdapter.clearPersisted();
    },
  };
}

export const undoManagerV2: UndoManagerV2 = createUndoManagerV2();
