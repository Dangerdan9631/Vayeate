import * as z from 'zod';
import type { TabId } from './app-ui';
import type { CatalogReference } from './schema/template-schemas';
import type { TemplateReference, ThemeReference } from './schema/theme-schemas';

/**
 * Zod schema for a name/version reference embedded in undo context.
 */
export const undoRefSchema = z
  .object({
    name: z.string().min(1),
    version: z.string().min(1),
  })
  .readonly();

/**
 * Zod schema for the active tab and entity refs that scope an undo stack.
 */
export const undoContextSchema = z
  .object({
    tabId: z.enum(['catalogs', 'templates', 'themes']),
    templateRef: undoRefSchema.nullable().default(null),
    catalogRef: undoRefSchema.nullable().default(null),
    themeRef: undoRefSchema.nullable().default(null),
    contextKey: z.string().min(1),
  })
  .readonly();

/**
 * Zod schema for a single before/after field change within an undo entry.
 */
export const undoDiffSchema = z
  .object({
    actionType: z.string().min(1),
    target: z.string().min(1),
    before: z.unknown(),
    after: z.unknown(),
  })
  .readonly();

/**
 * Zod schema for one persisted undo history entry and its diffs.
 */
export const undoEntrySchema = z
  .object({
    id: z.string().min(1),
    contextKey: z.string().min(1),
    description: z.string().min(1),
    diffs: z.array(undoDiffSchema).min(1).readonly(),
    createdAtSessionOrder: z.number().int().nonnegative(),
    persistenceStatus: z.enum(['pending', 'persisted']),
  })
  .readonly();

/**
 * Zod schema for the outcome of an undo, redo, or go-to transition.
 */
export const historyTransitionResultSchema = z
  .object({
    status: z.enum(['transitioned', 'not-available', 'failed']),
    mode: z.enum(['undo', 'redo', 'go-to']),
    contextKey: z.string().min(1),
    entryId: z.string().min(1).nullable().default(null),
    message: z.string().optional(),
  })
  .readonly();

/**
 * Synthetic history frame id representing the opened-document baseline.
 */
export const UNDO_BASELINE_FRAME_ID = '__undo-baseline__';
/**
 * Maximum undo history items shown in the history menu.
 */
export const UNDO_HISTORY_MENU_MAX_VISIBLE_ITEMS = 10;

/**
 * Parsed undo context with a stable `contextKey` for stack lookup.
 */
export type UndoContext = z.infer<typeof undoContextSchema>;
/**
 * Single field-level change recorded inside an undo entry.
 */
export type UndoDiff = z.infer<typeof undoDiffSchema>;
/**
 * One undoable user action with description and diff list.
 */
export type UndoEntry = z.infer<typeof undoEntrySchema>;
/**
 * Result returned after attempting undo, redo, or history navigation.
 */
export type HistoryTransitionResult = z.infer<typeof historyTransitionResultSchema>;

/**
 * Current pointer into an undo stack and adjacent entry ids.
 */
export interface UndoStackPosition {
  currentEntryId: string | null;
  canUndo: boolean;
  canRedo: boolean;
  nextUndoEntryId: string | null;
  nextRedoEntryId: string | null;
}

/**
 * UI-facing summary of undo availability for the active context.
 */
export interface UndoAvailabilitySummary {
  activeContextKey: string | null;
  canUndo: boolean;
  canRedo: boolean;
  nextUndoDescription: string | null;
  nextRedoDescription: string | null;
  recentActions: UndoHistoryListEntry[];
  historyVersion: number;
}

/**
 * Lightweight undo entry row for menus and lists.
 */
export interface UndoHistoryListEntry {
  id: string;
  description: string;
}

/**
 * Input fields used to derive a validated undo context.
 */
export interface UndoContextInput {
  tabId: TabId;
  templateRef?: TemplateReference | null;
  catalogRef?: CatalogReference | null;
  themeRef?: ThemeReference | null;
}

function refPart(label: string, ref: { name: string; version: string } | null | undefined): string {
  if (!ref) return `${label}=none`;
  return `${label}=${encodeURIComponent(ref.name)}@${encodeURIComponent(ref.version)}`;
}

/**
 * Builds a human-readable label for the undo baseline frame of a context.
 *
 * @param context - Undo context whose active tab determines which ref is shown.
 * @returns Description such as `Opened name@version` or `Opened` when no ref is set.
 */
export function deriveUndoBaselineLabel(context: UndoContext): string {
  const ref =
    context.tabId === 'catalogs' ? context.catalogRef :
    context.tabId === 'templates' ? context.templateRef :
    context.themeRef;
  if (!ref) return 'Opened';
  return `Opened ${ref.name}@${ref.version}`;
}

/**
 * Derives and validates an undo context key from tab and entity references.
 *
 * @param input - Active tab plus optional template, catalog, and theme refs.
 * @returns Parsed `UndoContext` with a stable pipe-delimited `contextKey`.
 */
export function deriveUndoContext(input: UndoContextInput): UndoContext {
  const contextKey = [
    `tab=${input.tabId}`,
    refPart('template', input.templateRef),
    refPart('catalog', input.catalogRef),
    refPart('theme', input.themeRef),
  ].join('|');

  return undoContextSchema.parse({
    tabId: input.tabId,
    templateRef: input.templateRef ?? null,
    catalogRef: input.catalogRef ?? null,
    themeRef: input.themeRef ?? null,
    contextKey,
  });
}
