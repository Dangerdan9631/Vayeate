/**
 * UndoManagerV2: HashMap of history stacks keyed by stack id.
 * Each stack is a double-linked list of frames with a current-frame pointer.
 * Frames have a list of undo actions (discriminated union); a processor applies or reverts each action via a switch on action.type.
 * Supports persistence (one JSON file per stack in .undo), LRU in-memory cap,
 * and in-memory frame trim with full history on disk.
 */

export const DEFAULT_MAX_SIZE = 20;
export const DEFAULT_STACK_COUNT = 5;
export const DEFAULT_DISK_MAX_FRAMES = 999;

/** Globally unique, chronologically sortable frame ID. */
export function createFrameId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/** Placeholder undo action; apply and revert are no-ops. */
export interface UndoActionNoop {
  type: 'NOOP';
}

/** Discriminated union of undo actions. Each action has a type and the data needed to apply and revert. */
export type UndoAction = UndoActionNoop;

export interface UndoFrame {
  id: string;
  description: string;
  /** Single list; apply runs in order, revert runs in reverse order. */
  actions: UndoAction[];
}

/** Processor that applies or reverts a single action; implementation switches on action.type. */
export interface UndoProcessor {
  applyProcessor(action: UndoAction): void;
  revertProcessor(action: UndoAction): void;
}

export interface UndoStackOptions {
  maxSize?: number;
  processor: UndoProcessor;
  /** Used by manager for persistence callbacks. */
  stackId?: string;
  /** Called after push/undo/redo/goto so manager can persist. */
  onAfterChange?: () => void;
  /** Cap for persisted frame count (default DEFAULT_DISK_MAX_FRAMES). */
  diskMaxFrames?: number;
}

export interface UndoListEntry {
  id: string;
  description: string;
}

export interface UndoListResult {
  frames: UndoListEntry[];
  currentId: string | null;
}

/** Serialized form for one stack (persisted to disk). */
export interface PersistedStack {
  frames: UndoFrame[];
  currentId: string | null;
}

export interface UndoStack {
  push(frame: UndoFrame): void;
  undo(): boolean;
  redo(): boolean;
  goto(id: string): boolean;
  list(): UndoListResult;
  readonly canUndo: boolean;
  readonly canRedo: boolean;
  /** For persistence; returns full frame list (trimmed + in-memory) and currentId. */
  getPersistedState?(): PersistedStack;
  /** Restore stack from persisted state (e.g. after load from disk). */
  hydrate?(frames: UndoFrame[], currentId: string | null): void;
}

export interface UndoPersistenceAdapter {
  saveStack(stackId: string, payload: string): Promise<void>;
  loadStack(stackId: string): Promise<string | null>;
  clearPersisted(): Promise<void>;
}

interface FrameNode {
  frame: UndoFrame;
  prev: FrameNode | null;
  next: FrameNode | null;
}

function runApply(processor: UndoProcessor, actions: UndoAction[]): void {
  for (const action of actions) {
    processor.applyProcessor(action);
  }
}

function runRevert(processor: UndoProcessor, actions: UndoAction[]): void {
  for (let i = actions.length - 1; i >= 0; i--) {
    processor.revertProcessor(actions[i]);
  }
}

export function createStack(options: UndoStackOptions): UndoStack {
  const maxSize = options.maxSize ?? DEFAULT_MAX_SIZE;
  const diskMaxFrames = options.diskMaxFrames ?? DEFAULT_DISK_MAX_FRAMES;
  const processor = options.processor;
  const onAfterChange = options.onAfterChange;

  let head: FrameNode | null = null;
  let tail: FrameNode | null = null;
  let current: FrameNode | null = null;
  let size = 0;
  /** Frames trimmed from head when in-memory size exceeded maxSize; still persisted. */
  let trimmedFrames: UndoFrame[] = [];

  function indexOfNode(node: FrameNode): number {
    let i = 0;
    let n: FrameNode | null = head;
    while (n) {
      if (n === node) return i;
      n = n.next;
      i++;
    }
    return -1;
  }

  function findNodeById(id: string): FrameNode | null {
    let n: FrameNode | null = head;
    while (n) {
      if (n.frame.id === id) return n;
      n = n.next;
    }
    return null;
  }

  function collectFrames(): UndoFrame[] {
    const out: UndoFrame[] = [];
    let n: FrameNode | null = head;
    while (n) {
      out.push(n.frame);
      n = n.next;
    }
    return out;
  }

  function dropAllAfter(node: FrameNode): void {
    if (node.next === null) return;
    node.next.prev = null;
    node.next = null;
    tail = node;
    let count = 0;
    let n: FrameNode | null = tail;
    while (n) {
      count++;
      n = n.prev;
    }
    size = count;
  }

  function enforceMaxSize(): void {
    while (size > maxSize && head) {
      trimmedFrames.push(head.frame);
      const next = head.next;
      if (current === head) current = null;
      head.next = null;
      if (next) next.prev = null;
      head = next;
      size--;
    }
  }

  function notifyChange(): void {
    onAfterChange?.();
  }

  const stack: UndoStack = {
    push(frame: UndoFrame): void {
      if (current && current !== tail) dropAllAfter(current);
      const node: FrameNode = { frame, prev: tail, next: null };
      if (tail) tail.next = node;
      else head = node;
      tail = node;
      current = node;
      size++;
      enforceMaxSize();
      notifyChange();
    },

    undo(): boolean {
      if (current !== null) {
        runRevert(processor, current.frame.actions);
        current = current.prev;
        notifyChange();
        return true;
      }
      if (trimmedFrames.length === 0) return false;
      const popped = trimmedFrames.pop()!;
      runRevert(processor, popped.actions);
      const newNode: FrameNode = { frame: popped, prev: null, next: head };
      if (head) head.prev = newNode;
      else tail = newNode;
      head = newNode;
      current = null;
      size++;
      while (size > maxSize && tail) {
        const prev = tail.prev;
        tail.prev = null;
        if (prev) prev.next = null;
        tail = prev;
        size--;
      }
      notifyChange();
      return true;
    },

    redo(): boolean {
      if (!current) {
        if (!head) return false;
        runApply(processor, head.frame.actions);
        current = head;
        notifyChange();
        return true;
      }
      if (!current.next) return false;
      const next = current.next;
      runApply(processor, next.frame.actions);
      current = next;
      notifyChange();
      return true;
    },

    goto(id: string): boolean {
      let target = findNodeById(id);
      if (!target && trimmedFrames.length > 0) {
        const idx = trimmedFrames.findIndex((f) => f.id === id);
        if (idx >= 0) {
          while (current !== null) {
            runRevert(processor, current.frame.actions);
            current = current.prev;
          }
          for (let i = trimmedFrames.length - 1; i > idx; i--) {
            const f = trimmedFrames[i];
            runRevert(processor, f.actions);
          }
          const frame = trimmedFrames[idx];
          runRevert(processor, frame.actions);
          const newNode: FrameNode = { frame, prev: null, next: head };
          if (head) head.prev = newNode;
          else tail = newNode;
          head = newNode;
          trimmedFrames = trimmedFrames.slice(0, idx);
          current = null;
          size++;
          while (size > maxSize && tail) {
            const p = tail.prev;
            tail.prev = null;
            if (p) p.next = null;
            tail = p;
            size--;
          }
          notifyChange();
          return true;
        }
      }
      if (!target) return false;
      const currentIndex = current ? indexOfNode(current) : -1;
      const targetIndex = indexOfNode(target);
      if (currentIndex === targetIndex) return true;
      if (targetIndex < currentIndex) {
        while (current && current.frame.id !== id) {
          runRevert(processor, current.frame.actions);
          current = current.prev;
        }
      } else {
        let n = current ? current.next : head;
        while (n && n.frame.id !== id) {
          runApply(processor, n.frame.actions);
          current = n;
          n = n.next;
        }
        if (n) {
          runApply(processor, n.frame.actions);
          current = n;
        }
      }
      notifyChange();
      return true;
    },

    list(): UndoListResult {
      const frames: UndoListEntry[] = [];
      let n: FrameNode | null = head;
      while (n) {
        frames.push({ id: n.frame.id, description: n.frame.description });
        n = n.next;
      }
      return {
        frames,
        currentId: current ? current.frame.id : null,
      };
    },

    get canUndo(): boolean {
      return current !== null || trimmedFrames.length > 0;
    },

    get canRedo(): boolean {
      if (current === null) return head !== null;
      return current.next !== null;
    },

    getPersistedState(): PersistedStack {
      const all = [...trimmedFrames, ...collectFrames()];
      const capped = all.length <= diskMaxFrames ? all : all.slice(-diskMaxFrames);
      return {
        frames: capped,
        currentId: current ? current.frame.id : null,
      };
    },

    hydrate(frames: UndoFrame[], currentId: string | null): void {
      trimmedFrames = [];
      head = null;
      tail = null;
      current = null;
      size = 0;
      if (frames.length === 0) {
        notifyChange();
        return;
      }
      const inMemory = frames.slice(-maxSize);
      trimmedFrames = frames.slice(0, -inMemory.length);
      for (const f of inMemory) {
        const node: FrameNode = { frame: f, prev: tail, next: null };
        if (tail) tail.next = node;
        else head = node;
        tail = node;
        size++;
      }
      if (currentId) {
        const node = findNodeById(currentId);
        if (node) current = node;
        else if (inMemory.length > 0) current = tail;
      }
      notifyChange();
    },
  };

  return stack;
}

const stacks = new Map<string, UndoStack>();
const lruOrder: string[] = [];
let stackCount = DEFAULT_STACK_COUNT;
let persistenceAdapter: UndoPersistenceAdapter | null = null;
let diskMaxFrames = DEFAULT_DISK_MAX_FRAMES;

export interface UndoManagerOptions {
  stackCount?: number;
  diskMaxFrames?: number;
  persistence?: UndoPersistenceAdapter | null;
}

export interface UndoManagerV2 {
  getOrCreate(stackId: string, options?: UndoStackOptions): Promise<UndoStack>;
  clearPersisted(): Promise<void>;
  /** Configure manager options (stack count, disk limit, persistence adapter). */
  configure(options: UndoManagerOptions): void;
}

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
