import type { Rgb } from './color-types';

/**
 * Lenient hex normalizer for UI and palette input.
 *
 * @param hex - Raw hex string from user input or assignments.
 * @returns Expanded `#rrggbb` hex, or null when empty or invalid.
 */
export function normalizeHexSafe(hex: string): string | null {
  const s = (hex ?? '').trim().toLowerCase();
  const withHash = s.startsWith('#') ? s : s ? `#${s}` : '';
  if (!withHash) return null;
  const bare = withHash.slice(1);
  if (!/^[0-9a-f]+$/.test(bare) || (bare.length !== 3 && bare.length !== 6 && bare.length !== 8)) {
    return null;
  }
  const expanded = bare.length === 3 ? bare.split('').map((c) => c + c).join('') : bare;
  return `#${expanded}`;
}

/**
 * Strict hex normalizer that expands shorthand and validates length.
 *
 * @param hex - Hex string expected to include a leading `#`.
 * @returns Lowercase `#rrggbb` or `#rrggbbaa` hex.
 * @throws When the input is missing `#` or has an invalid length.
 */
export function normalizeHex(hex: string): string {
  const h = hex.trim().toLowerCase();
  if (!h.startsWith('#')) {
    throw new Error(`Invalid hex color: ${hex}`);
  }
  const value = h.slice(1);
  if (value.length === 3) {
    return `#${value
      .split('')
      .map((c) => c + c)
      .join('')}`;
  }
  if (value.length === 6) {
    return `#${value}`;
  }
  if (value.length === 8) {
    return `#${value}`;
  }
  throw new Error(`Invalid hex color length: ${hex}`);
}

/**
 * Clamp a single channel to sRGB [0, 1]. Handles NaN/Infinity.
 */
function clampChannel(value: number): number {
  if (Number.isFinite(value)) return Math.max(0, Math.min(1, value));
  return 0;
}

/**
 * Clamp RGB to sRGB gamut so hex output never clips out of range.
 */
function clampRgbToSrgb(rgb: Rgb): Rgb {
  return {
    r: clampChannel(rgb.r),
    g: clampChannel(rgb.g),
    b: clampChannel(rgb.b),
  };
}

/**
 * Parses a hex color into normalized RGB channels (alpha ignored).
 *
 * @param hex - Hex string normalized via {@link normalizeHex}.
 * @returns RGB with channels in [0, 1].
 */
export function hexToRgb(hex: string): Rgb {
  const n = normalizeHex(hex);
  const rgbHex = n.slice(1, 7);
  return {
    r: parseInt(rgbHex.slice(0, 2), 16) / 255,
    g: parseInt(rgbHex.slice(2, 4), 16) / 255,
    b: parseInt(rgbHex.slice(4, 6), 16) / 255,
  };
}

/**
 * Encodes normalized RGB channels as a lowercase `#rrggbb` hex string.
 *
 * @param rgb - RGB color with channels clamped to sRGB [0, 1].
 * @returns Hex string suitable for theme assignments and export.
 */
export function rgbToHex(rgb: Rgb): string {
  const clamped = clampRgbToSrgb(rgb);
  const toHex = (value: number) =>
    Math.round(value * 255)
      .toString(16)
      .padStart(2, '0');
  return `#${toHex(clamped.r)}${toHex(clamped.g)}${toHex(clamped.b)}`;
}
