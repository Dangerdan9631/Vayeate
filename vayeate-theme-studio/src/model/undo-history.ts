import * as z from 'zod';
import type { TabId } from './app-ui';
import type { CatalogReference } from './schema/template-schemas';
import type { TemplateReference, ThemeReference } from './schema/theme-schemas';

export const undoRefSchema = z
  .object({
    name: z.string().min(1),
    version: z.string().min(1),
  })
  .readonly();

export const undoContextSchema = z
  .object({
    tabId: z.enum(['catalogs', 'templates', 'themes']),
    templateRef: undoRefSchema.nullable().default(null),
    catalogRef: undoRefSchema.nullable().default(null),
    themeRef: undoRefSchema.nullable().default(null),
    contextKey: z.string().min(1),
  })
  .readonly();

export const undoDiffSchema = z
  .object({
    actionType: z.string().min(1),
    target: z.string().min(1),
    before: z.unknown(),
    after: z.unknown(),
  })
  .readonly();

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

export const historyTransitionResultSchema = z
  .object({
    status: z.enum(['transitioned', 'not-available', 'failed']),
    mode: z.enum(['undo', 'redo', 'go-to']),
    contextKey: z.string().min(1),
    entryId: z.string().min(1).nullable().default(null),
    message: z.string().optional(),
  })
  .readonly();

export const UNDO_BASELINE_FRAME_ID = '__undo-baseline__';
export const UNDO_HISTORY_MENU_MAX_VISIBLE_ITEMS = 10;

export type UndoContext = z.infer<typeof undoContextSchema>;
export type UndoDiff = z.infer<typeof undoDiffSchema>;
export type UndoEntry = z.infer<typeof undoEntrySchema>;
export type HistoryTransitionResult = z.infer<typeof historyTransitionResultSchema>;

export interface UndoStackPosition {
  currentEntryId: string | null;
  canUndo: boolean;
  canRedo: boolean;
  nextUndoEntryId: string | null;
  nextRedoEntryId: string | null;
}

export interface UndoAvailabilitySummary {
  activeContextKey: string | null;
  canUndo: boolean;
  canRedo: boolean;
  nextUndoDescription: string | null;
  nextRedoDescription: string | null;
  recentActions: UndoHistoryListEntry[];
  historyVersion: number;
}

export interface UndoHistoryListEntry {
  id: string;
  description: string;
}

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

export function deriveUndoBaselineLabel(context: UndoContext): string {
  const ref =
    context.tabId === 'catalogs' ? context.catalogRef :
    context.tabId === 'templates' ? context.templateRef :
    context.themeRef;
  if (!ref) return 'Opened';
  return `Opened ${ref.name}@${ref.version}`;
}

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

