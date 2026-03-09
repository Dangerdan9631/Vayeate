/**
 * Generic undo stack: base state + up to maxFrames incremental patches.
 * State at index i = merge(base, patches[0], ..., patches[i]).
 * Only stores changed keys per patch (shallow diff).
 */

const DEFAULT_MAX_FRAMES = 50;

function shallowDiff<T extends object>(prev: T, next: T): Partial<T> {
  const patch: Partial<T> = {};
  const keys = new Set([...Object.keys(prev), ...Object.keys(next)]) as Set<keyof T>;
  for (const k of keys) {
    const p = prev[k];
    const n = next[k];
    if (Object.is(p, n)) continue;
    if (JSON.stringify(p) === JSON.stringify(n)) continue;
    (patch as Record<keyof T, unknown>)[k] = n;
  }
  return patch;
}

function merge<T extends object>(base: T, patch: Partial<T>): T {
  if (Object.keys(patch).length === 0) return base;
  return { ...base, ...patch } as T;
}

export interface UndoFrame {
  label: string;
  index: number;
}

export interface UndoStackState {
  canUndo: boolean;
  canRedo: boolean;
  frames: UndoFrame[];
  currentIndex: number;
}

/** Serializable snapshot of an undo stack for persistence. */
export interface SerializedUndoState<T extends object> {
  base: T;
  patches: Array<{ label: string; patch: Partial<T> }>;
  currentIndex: number;
}

export function createUndoStack<T extends object>(initialBase: T, maxFrames: number = DEFAULT_MAX_FRAMES) {
  let base = initialBase;
  let patches: Array<{ label: string; patch: Partial<T> }> = [];
  let currentIndex = -1;

  function getSerializableState(): SerializedUndoState<T> {
    return { base: { ...base } as T, patches: patches.map((p) => ({ label: p.label, patch: { ...p.patch } as Partial<T> })), currentIndex };
  }

  function stateAt(i: number): T {
    if (i < -1) return stateAt(-1);
    if (i === -1) return base;
    let s = base;
    for (let j = 0; j <= i && j < patches.length; j++) {
      s = merge(s, patches[j].patch);
    }
    return s;
  }

  function getState(): UndoStackState {
    const frames: UndoFrame[] = patches.map((p, i) => ({ label: p.label, index: i }));
    return {
      canUndo: currentIndex >= 0,
      canRedo: currentIndex < patches.length - 1,
      frames,
      currentIndex,
    };
  }

  function push(label: string, prev: T, next: T): void {
    const patch = shallowDiff(prev, next);
    if (Object.keys(patch).length === 0) return;

    if (currentIndex < patches.length - 1) {
      patches = patches.slice(0, currentIndex + 1);
    }
    patches.push({ label, patch });
    currentIndex = patches.length - 1;

    while (patches.length > maxFrames) {
      base = merge(base, patches[0].patch);
      patches = patches.slice(1);
      currentIndex--;
    }
  }

  function setBase(state: T): void {
    base = state;
    patches = [];
    currentIndex = -1;
  }

  function clearAndSetBase(state: T): void {
    setBase(state);
  }

  function undo(): T | null {
    if (currentIndex < 0) return null;
    currentIndex--;
    return stateAt(currentIndex);
  }

  function redo(): T | null {
    if (currentIndex >= patches.length - 1) return null;
    currentIndex++;
    return stateAt(currentIndex);
  }

  function goTo(index: number): T | null {
    if (index < -1 || index >= patches.length) return null;
    currentIndex = index;
    return stateAt(currentIndex);
  }

  return {
    get state(): UndoStackState {
      return getState();
    },
    get base(): T {
      return base;
    },
    setBase(s: T) {
      base = s;
    },
    stateAt,
    push,
    undo,
    redo,
    goTo,
    clearAndSetBase,
    getState,
    getSerializableState,
  };
}

/** Internal: hydrate a stack created with createUndoStack from serialized state. */
function hydrateUndoStack<T extends object>(
  stack: ReturnType<typeof createUndoStack<T>>,
  serialized: SerializedUndoState<T>,
): void {
  if (serialized.patches.length === 0) return;
  const internal = stack as unknown as {
    push(label: string, prev: T, next: T): void;
    getState(): UndoStackState;
    goTo(index: number): T | null;
  };
  let prev = serialized.base;
  for (let i = 0; i < serialized.patches.length; i++) {
    const { label, patch } = serialized.patches[i];
    const next = merge(prev, patch as Partial<T>) as T;
    internal.push(label, prev, next);
    prev = next;
  }
  const state = internal.getState();
  if (serialized.currentIndex >= -1 && serialized.currentIndex < state.frames.length) {
    internal.goTo(serialized.currentIndex);
  }
}

/**
 * Creates an undo stack from a previously serialized state (e.g. loaded from disk).
 */
export function createFromSerializedState<T extends object>(
  serialized: SerializedUndoState<T>,
  maxFrames: number = DEFAULT_MAX_FRAMES,
): ReturnType<typeof createUndoStack<T>> {
  const stack = createUndoStack(serialized.base, maxFrames);
  hydrateUndoStack(stack, serialized);
  return stack;
}

export type UndoStack<T extends object> = ReturnType<typeof createUndoStack<T>>;
