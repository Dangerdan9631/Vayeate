import { EyedropperOverlayActionType } from '../../common/eyedropper-overlay/actions/eyedropper-overlay-action-type';
import { StyledTooltipActionType } from '../../common/styled-tooltip/actions/styled-tooltip-action-type';
import { ThemePaletteCardActionType } from '../../theme/theme-palette-card/actions/theme-palette-card-action-type';
import type { AppAction } from './app-action';

/**
 * Queue lane priority for cooperative scheduling.
 */
export type ActionPriority = 'interactive' | 'normal';

/**
 * Suffixes that identify high-frequency typing and pointer actions.
 * Extend this list when adding new interactive control action types.
 */
const INTERACTIVE_ACTION_SUFFIXES = [
  '_TEXT_ON_CHANGE',
  '_SEARCH_TEXT_ON_CHANGE',
  '_ON_MOUSE_OVER',
  '_ON_MOUSE_OUT',
  '_ON_MOUSE_MOVE',
  '_ON_POSITION_CHANGE',
  '_WHEEL_ON_SCROLL',
  '_VIEWPORT_SIZE_CHANGE',
  '_ON_SELECT',
  '_SLIDER_ON_DELTA',
  '_LIST_ON_COMMIT',
  '_LIST_ON_SELECT',
] as const;

/**
 * Infix patterns for selection-related interactive actions.
 */
const INTERACTIVE_ACTION_INFIXES = [
  '_SELECTION_',
] as const;

/**
 * Explicit action types that should preempt normal-lane work.
 * High-frequency overlay and tooltip streams are listed here by enum value.
 */
const INTERACTIVE_ACTION_TYPES = new Set<string>([
  ...Object.values(EyedropperOverlayActionType),
  ...Object.values(StyledTooltipActionType),
  ThemePaletteCardActionType.AssignColorPickerOnSelect,
  ThemePaletteCardActionType.HueSliderOnDelta,
  ThemePaletteCardActionType.ClusterCountSliderOnDelta,
  ThemePaletteCardActionType.ColorRefsSelectionCommit,
]);

function matchesInteractiveSuffix(type: string): boolean {
  return INTERACTIVE_ACTION_SUFFIXES.some((suffix) => type.endsWith(suffix));
}

function matchesInteractiveInfix(type: string): boolean {
  return INTERACTIVE_ACTION_INFIXES.some((infix) => type.includes(infix));
}

/**
 * Classifies an action for queue lane selection. Interactive actions drain
 * before normal-lane work and can preempt queued heavy actions.
 *
 * @param action - Action about to be enqueued.
 * @returns `'interactive'` for pointer, hover, typing, and selection actions; otherwise `'normal'`.
 */
export function getActionPriority(action: AppAction): ActionPriority {
  const { type } = action;
  if (INTERACTIVE_ACTION_TYPES.has(type)) {
    return 'interactive';
  }
  if (matchesInteractiveSuffix(type) || matchesInteractiveInfix(type)) {
    return 'interactive';
  }
  return 'normal';
}
