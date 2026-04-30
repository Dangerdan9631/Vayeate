import type {
  PersistedStack,
  UndoAction,
  UndoFrame,
  UndoListEntry,
  UndoListResult,
  UndoProcessor,
  UndoStack,
  UndoStackOptions,
} from './undo-stack-types';
import { DEFAULT_DISK_MAX_FRAMES, DEFAULT_MAX_SIZE } from './undo-stack-types';

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
      const target = findNodeById(id);
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
