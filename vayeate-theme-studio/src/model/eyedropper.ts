import type { Point } from './point';
import type { Rect } from './rect';
import type { ColorVariableKey, HexColor } from './schema/primitives';

export enum EyedropperCommitTargetType {
  ThemePaletteAssignColor = 'theme-palette.assign-color',
  ThemePaletteHueReference = 'theme-palette.hue-reference',
  ThemeVariableDarkColor = 'theme-variable.dark-color',
  ThemeVariableLightColor = 'theme-variable.light-color',
}

export type EyedropperCommitTarget =
  | { type: EyedropperCommitTargetType.ThemePaletteAssignColor }
  | { type: EyedropperCommitTargetType.ThemePaletteHueReference }
  | { type: EyedropperCommitTargetType.ThemeVariableDarkColor; ref: ColorVariableKey }
  | { type: EyedropperCommitTargetType.ThemeVariableLightColor; ref: ColorVariableKey };

export interface EyedropperPointerSample {
  clientPosition: Point;
  canvasPosition: Point;
  previewHex: HexColor;
}

export interface EyedropperDisplaySnapshotEntry {
  sourceId: string;
  bounds: Rect;
  bitmap: ImageBitmap;
}

export interface EyedropperDisplaySnapshot {
  fullBounds: Rect;
  displays: EyedropperDisplaySnapshotEntry[];
}
