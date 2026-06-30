import {
  CATALOG_SOURCE_URL_UPDATED,
  THEME_COLOR_VARIABLE_DARK_SET,
  THEME_COLOR_VARIABLE_LIGHT_SET,
  THEME_PALETTE_COLOR_ASSIGNED,
  THEME_PALETTE_HUE_ADJUSTMENT_SET,
  THEME_PALETTE_HUE_REFERENCE_SET,
  THEME_PALETTE_SATURATION_ADJUSTMENT_SET,
  THEME_PALETTE_VALUE_ADJUSTMENT_SET,
  THEME_PANE_SELECTIONS_SET,
} from '../../../model/undo-action-types';

const MAX_DEPTH = 6;
const MAX_KEYS = 64;

interface UndoDiffLike {
  actionType: string;
  before: unknown;
  after: unknown;
}

function isPrimitive(value: unknown): value is string | number | boolean | null {
  return value === null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';
}

function stringArraysEqual(left: unknown, right: unknown): boolean | null {
  if (!Array.isArray(left) || !Array.isArray(right)) return null;
  if (left.length !== right.length) return false;
  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) return false;
  }
  return true;
}

function paneSelectionsEqual(left: unknown, right: unknown): boolean | null {
  if (typeof left !== 'object' || left === null || typeof right !== 'object' || right === null) {
    return null;
  }
  const leftSelection = left as { checkedColorRefs?: unknown; checkedContrastRefs?: unknown };
  const rightSelection = right as { checkedColorRefs?: unknown; checkedContrastRefs?: unknown };
  const leftColors = stringArraysEqual(leftSelection.checkedColorRefs, rightSelection.checkedColorRefs);
  const leftContrasts = stringArraysEqual(leftSelection.checkedContrastRefs, rightSelection.checkedContrastRefs);
  if (leftColors === null || leftContrasts === null) return null;
  return leftColors && leftContrasts;
}

function paletteAssignPatchEqual(left: unknown, right: unknown): boolean | null {
  if (typeof left !== 'object' || left === null || typeof right !== 'object' || right === null) {
    return null;
  }
  const leftPatch = left as { assignments?: unknown };
  const rightPatch = right as { assignments?: unknown };
  const leftAssignments = leftPatch.assignments;
  const rightAssignments = rightPatch.assignments;
  if (!Array.isArray(leftAssignments) || !Array.isArray(rightAssignments)) return null;
  if (leftAssignments.length !== rightAssignments.length) return false;
  for (let index = 0; index < leftAssignments.length; index += 1) {
    const leftEntry = leftAssignments[index] as { colorRef?: unknown; light?: unknown; dark?: unknown };
    const rightEntry = rightAssignments[index] as { colorRef?: unknown; light?: unknown; dark?: unknown };
    if (
      leftEntry.colorRef !== rightEntry.colorRef
      || leftEntry.light !== rightEntry.light
      || leftEntry.dark !== rightEntry.dark
    ) {
      return false;
    }
  }
  return true;
}

function catalogSourceFieldPatchEqual(left: unknown, right: unknown): boolean | null {
  if (typeof left !== 'object' || left === null || typeof right !== 'object' || right === null) {
    return null;
  }
  const leftPatch = left as { sourceIndex?: unknown; field?: unknown; value?: unknown };
  const rightPatch = right as { sourceIndex?: unknown; field?: unknown; value?: unknown };
  if (
    typeof leftPatch.sourceIndex !== 'number'
    || typeof rightPatch.sourceIndex !== 'number'
    || leftPatch.field !== 'url'
    || rightPatch.field !== 'url'
    || typeof leftPatch.value !== 'string'
    || typeof rightPatch.value !== 'string'
  ) {
    return null;
  }
  return leftPatch.sourceIndex === rightPatch.sourceIndex && leftPatch.value === rightPatch.value;
}

function boundedStructuralEqual(left: unknown, right: unknown, depth: number): boolean {
  if (Object.is(left, right)) return true;
  if (isPrimitive(left) || isPrimitive(right)) return left === right;
  if (depth >= MAX_DEPTH) return false;

  if (Array.isArray(left) && Array.isArray(right)) {
    if (left.length !== right.length) return false;
    for (let index = 0; index < left.length; index += 1) {
      if (!boundedStructuralEqual(left[index], right[index], depth + 1)) return false;
    }
    return true;
  }

  if (typeof left !== 'object' || left === null || typeof right !== 'object' || right === null) {
    return false;
  }

  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);
  if (leftKeys.length !== rightKeys.length || leftKeys.length > MAX_KEYS) return false;
  for (const key of leftKeys) {
    if (!Object.prototype.hasOwnProperty.call(right, key)) return false;
    if (!boundedStructuralEqual(
      (left as Record<string, unknown>)[key],
      (right as Record<string, unknown>)[key],
      depth + 1,
    )) {
      return false;
    }
  }
  return true;
}

function valuesEqualForActionType(actionType: string, before: unknown, after: unknown): boolean | null {
  switch (actionType) {
    case THEME_COLOR_VARIABLE_LIGHT_SET:
    case THEME_COLOR_VARIABLE_DARK_SET:
    case THEME_PALETTE_HUE_ADJUSTMENT_SET:
    case THEME_PALETTE_SATURATION_ADJUSTMENT_SET:
    case THEME_PALETTE_VALUE_ADJUSTMENT_SET:
    case THEME_PALETTE_HUE_REFERENCE_SET:
      return before === after;
    case THEME_PANE_SELECTIONS_SET:
      return paneSelectionsEqual(before, after);
    case THEME_PALETTE_COLOR_ASSIGNED:
      return paletteAssignPatchEqual(before, after);
    case CATALOG_SOURCE_URL_UPDATED:
      return catalogSourceFieldPatchEqual(before, after);
    default:
      return null;
  }
}

/**
 * Compares undo before/after values without serializing whole entities when possible.
 * @param before Snapshot value before the edit.
 * @param after Snapshot value after the edit.
 * @param actionType Optional undo action type for fast-path equality.
 * @returns True when both values are equivalent for undo recording.
 */
export function undoValuesEqual(before: unknown, after: unknown, actionType?: string): boolean {
  if (Object.is(before, after)) return true;
  if (actionType) {
    const actionResult = valuesEqualForActionType(actionType, before, after);
    if (actionResult !== null) return actionResult;
  }
  if (isPrimitive(before) && isPrimitive(after)) return before === after;
  const paneResult = paneSelectionsEqual(before, after);
  if (paneResult !== null) return paneResult;
  const paletteResult = paletteAssignPatchEqual(before, after);
  if (paletteResult !== null) return paletteResult;
  const catalogPatchResult = catalogSourceFieldPatchEqual(before, after);
  if (catalogPatchResult !== null) return catalogPatchResult;
  const arrayResult = stringArraysEqual(before, after);
  if (arrayResult !== null) return arrayResult;
  return boundedStructuralEqual(before, after, 0);
}

/**
 * Compares an undo diff using action-type-aware fast paths when available.
 * @param diff Undo diff containing action type and before/after values.
 * @returns True when the diff represents no net change.
 */
export function undoDiffValuesEqual(diff: UndoDiffLike): boolean {
  return undoValuesEqual(diff.before, diff.after, diff.actionType);
}
