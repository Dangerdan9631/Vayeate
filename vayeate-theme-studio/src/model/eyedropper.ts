import type { Point } from './point';
import type { Rect } from './rect';
import type { ColorVariableKey, HexColor } from './schema/primitives';

/**
 * Identifies which theme control receives an eyedropper color commit.
 */
export enum EyedropperCommitTargetType {
  ThemePaletteAssignColor = 'theme-palette.assign-color',
  ThemePaletteHueReference = 'theme-palette.hue-reference',
  ThemeVariableDarkColor = 'theme-variable.dark-color',
  ThemeVariableLightColor = 'theme-variable.light-color',
}

/**
 * Discriminated target describing where a picked color should be applied.
 */
export type EyedropperCommitTarget =
  | { type: EyedropperCommitTargetType.ThemePaletteAssignColor }
  | { type: EyedropperCommitTargetType.ThemePaletteHueReference }
  | { type: EyedropperCommitTargetType.ThemeVariableDarkColor; ref: ColorVariableKey }
  | { type: EyedropperCommitTargetType.ThemeVariableLightColor; ref: ColorVariableKey };

/**
 * Pointer position and preview color sampled during eyedropper drag.
 */
export interface EyedropperPointerSample {
  clientPosition: Point;
  canvasPosition: Point;
  previewHex: HexColor;
}

/**
 * Captured display bitmap and bounds for one monitor during sampling.
 */
export interface EyedropperDisplaySnapshotEntry {
  sourceId: string;
  bounds: Rect;
  bitmap: ImageBitmap;
}

/**
 * Full multi-display capture used to resolve eyedropper picks across monitors.
 */
export interface EyedropperDisplaySnapshot {
  fullBounds: Rect;
  displays: EyedropperDisplaySnapshotEntry[];
}
