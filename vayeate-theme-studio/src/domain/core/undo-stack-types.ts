import type {
  HistoryTransitionResult,
  UndoDiff,
  UndoEntry,
  UndoHistoryListEntry,
  UndoStackPosition,
} from '../../model/undo-history';

export const DEFAULT_MAX_SIZE = 20;
export const DEFAULT_STACK_COUNT = 5;
export const DEFAULT_DISK_MAX_FRAMES = 999;

let frameSequence = 0;

export function createFrameId(): string {
  frameSequence += 1;
  return `${Date.now()}-${frameSequence}`;
}

export type UndoAction = UndoDiff;
export type UndoFrame = UndoEntry;
export type UndoListEntry = UndoHistoryListEntry;

export interface UndoProcessor {
  applyProcessor(action: UndoAction): Promise<void> | void;
  revertProcessor(action: UndoAction): Promise<void> | void;
  handlerCount?: number;
}

export interface UndoStackOptions {
  maxSize?: number;
  processor: UndoProcessor;
  stackId?: string;
  onAfterChange?: () => Promise<void> | void;
  diskMaxFrames?: number;
}

export interface UndoListResult {
  frames: UndoListEntry[];
  currentId: string | null;
}

export interface PersistedStack {
  frames: UndoFrame[];
  currentId: string | null;
}

export interface UndoFrameCoalesceOptions {
  canMerge: (existing: UndoFrame, next: UndoFrame) => boolean;
  merge: (existing: UndoFrame, next: UndoFrame) => UndoFrame | null;
}

export interface UndoStack {
  push(frame: UndoFrame, coalesce?: UndoFrameCoalesceOptions): Promise<void>;
  undo(): Promise<HistoryTransitionResult>;
  redo(): Promise<HistoryTransitionResult>;
  goto(id: string): Promise<HistoryTransitionResult>;
  list(): UndoListResult;
  position(): UndoStackPosition;
  availability(historyVersion: number): {
    activeContextKey: string;
    canUndo: boolean;
    canRedo: boolean;
    nextUndoDescription: string | null;
    nextRedoDescription: string | null;
    recentActions: UndoListEntry[];
    historyVersion: number;
  };
  readonly canUndo: boolean;
  readonly canRedo: boolean;
  getPersistedState(): PersistedStack;
  hydrate(frames: UndoFrame[], currentId: string | null): void;
  setProcessor(processor: UndoProcessor): void;
}

export interface UndoPersistenceAdapter {
  saveStack(stackId: string, payload: string): Promise<void>;
  loadStack(stackId: string): Promise<string | null>;
  clearPersisted(): Promise<void>;
}

export interface UndoManagerOptions {
  stackCount?: number;
  diskMaxFrames?: number;
  persistence?: UndoPersistenceAdapter | null;
}

export interface UndoManagerV2 {
  getOrCreate(stackId: string, options?: UndoStackOptions): Promise<UndoStack>;
  release(stackId: string): Promise<void>;
  clearPersisted(): Promise<void>;
  configure(options: UndoManagerOptions): void;
}
