import type {
  HistoryTransitionResult,
  UndoDiff,
  UndoEntry,
  UndoHistoryListEntry,
  UndoStackPosition,
} from '../../model/undo-history';
import type { PersistEnqueueFn } from './undo-stack-persist-scheduler';

/**
 * Default maximum undo frames kept in an in-memory stack before older entries are dropped on push.
 */
export const DEFAULT_MAX_SIZE = 20;

/**
 * Default number of undo stacks the manager keeps loaded before LRU eviction.
 */
export const DEFAULT_STACK_COUNT = 5;

/**
 * Default maximum frames written to disk when serializing a stack snapshot.
 */
export const DEFAULT_DISK_MAX_FRAMES = 999;

let frameSequence = 0;

/**
 * Creates a unique undo frame id for a newly recorded history entry.
 *
 * @returns A time-ordered id string safe for use as an undo entry key.
 */
export function createFrameId(): string {
  frameSequence += 1;
  return `${Date.now()}-${frameSequence}`;
}

/**
 * Alias for a single field-level change stored inside an undo frame.
 */
export type UndoAction = UndoDiff;

/**
 * Alias for a full undo history entry with description and diff list.
 */
export type UndoFrame = UndoEntry;

/**
 * Lightweight list row describing one undo frame for menus and summaries.
 */
export type UndoListEntry = UndoHistoryListEntry;

/**
 * Applies or reverts undo diffs when the stack transitions between frames.
 */
export interface UndoProcessor {
  applyProcessor(action: UndoAction): Promise<void> | void;
  revertProcessor(action: UndoAction): Promise<void> | void;
  handlerCount?: number;
}

/**
 * Inputs required to construct an in-memory undo stack instance.
 */
export interface UndoStackOptions {
  maxSize?: number;
  processor: UndoProcessor;
  stackId?: string;
  onAfterChange?: () => Promise<void> | void;
  diskMaxFrames?: number;
}

/**
 * Undo frame list plus the id of the frame currently applied in the document.
 */
export interface UndoListResult {
  frames: UndoListEntry[];
  currentId: string | null;
}

/**
 * Serializable undo stack snapshot used for persistence and hydration.
 */
export interface PersistedStack {
  frames: UndoFrame[];
  currentId: string | null;
}

/**
 * Rules for merging a new push into the tail frame instead of appending another entry.
 */
export interface UndoFrameCoalesceOptions {
  canMerge: (existing: UndoFrame, next: UndoFrame) => boolean;
  merge: (existing: UndoFrame, next: UndoFrame) => UndoFrame | null;
}

/**
 * Mutable undo history for one context key with undo, redo, and navigation operations.
 */
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

/**
 * Loads and saves serialized undo stacks for a given stack id.
 */
export interface UndoPersistenceAdapter {
  saveStack(stackId: string, payload: string): Promise<void>;
  loadStack(stackId: string): Promise<string | null>;
  clearPersisted(): Promise<void>;
}

/**
 * Manager-level configuration for stack count, disk caps, and persistence hooks.
 */
export interface UndoManagerOptions {
  stackCount?: number;
  diskMaxFrames?: number;
  persistence?: UndoPersistenceAdapter | null;
  persistEnqueue?: PersistEnqueueFn | null;
}

/**
 * Multi-stack undo manager with LRU eviction, hydration, and persist scheduling.
 */
export interface UndoManagerV2 {
  getIfLoaded(stackId: string, options?: UndoStackOptions): UndoStack | null;
  hydrateFromPersistence(stackId: string, options: UndoStackOptions): Promise<UndoStack>;
  getOrCreate(stackId: string, options?: UndoStackOptions): Promise<UndoStack>;
  release(stackId: string): Promise<void>;
  clearPersisted(): Promise<void>;
  flushPendingPersists(stackId?: string): Promise<void>;
  configure(options: UndoManagerOptions): void;
}
