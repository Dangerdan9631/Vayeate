/**
 * Types and defaults for undo stacks (UndoManagerV2).
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
