import type { Hsl, Rgb } from './color-types';
import { hexToRgb, rgbToHex } from './color-hex';

/**
 * Converts normalized RGB channels to HSL representation.
 *
 * @param rgb - Input color with channels in [0, 1].
 * @returns HSL color with hue in [0, 1].
 */
export function rgbToHsl(rgb: Rgb): Hsl {
  const max = Math.max(rgb.r, rgb.g, rgb.b);
  const min = Math.min(rgb.r, rgb.g, rgb.b);
  const l = (max + min) / 2;

  if (max === min) {
    return { h: 0, s: 0, l };
  }

  const delta = max - min;
  const s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);

  let h = 0;
  if (max === rgb.r) {
    h = (rgb.g - rgb.b) / delta + (rgb.g < rgb.b ? 6 : 0);
  } else if (max === rgb.g) {
    h = (rgb.b - rgb.r) / delta + 2;
  } else {
    h = (rgb.r - rgb.g) / delta + 4;
  }

  return { h: h / 6, s, l };
}

function hueToRgb(p: number, q: number, t: number): number {
  let x = t;
  if (x < 0) x += 1;
  if (x > 1) x -= 1;
  if (x < 1 / 6) return p + (q - p) * 6 * x;
  if (x < 1 / 2) return q;
  if (x < 2 / 3) return p + (q - p) * (2 / 3 - x) * 6;
  return p;
}

/**
 * Converts HSL color to normalized RGB channels.
 *
 * @param hsl - Input HSL color with hue in [0, 1].
 * @returns RGB color with channels in [0, 1].
 */
export function hslToRgb(hsl: Hsl): Rgb {
  if (hsl.s === 0) {
    return { r: hsl.l, g: hsl.l, b: hsl.l };
  }

  const q = hsl.l < 0.5 ? hsl.l * (1 + hsl.s) : hsl.l + hsl.s - hsl.l * hsl.s;
  const p = 2 * hsl.l - q;

  return {
    r: hueToRgb(p, q, hsl.h + 1 / 3),
    g: hueToRgb(p, q, hsl.h),
    b: hueToRgb(p, q, hsl.h - 1 / 3),
  };
}

/**
 * Returns the hue component of a hex color in [0, 1].
 *
 * @param hex - Hex color string to inspect.
 * @returns Hue in [0, 1]; grays and invalid hex return 0.
 */
export function hexToHue(hex: string): number {
  try {
    const rgb = hexToRgb(hex);
    const hsl = rgbToHsl(rgb);
    return hsl.h;
  } catch {
    return 0;
  }
}

/**
 * Rotates the hue of a hex color by a fractional turn.
 *
 * @param hex - Source hex color to shift.
 * @param shift - Hue delta in [-1, 1] where ±1 is a full rotation.
 * @returns Shifted hex color, or the original string when hex is invalid.
 */
export function applyHueShift(hex: string, shift: number): string {
  try {
    const rgb = hexToRgb(hex);
    const hsl = rgbToHsl(rgb);
    const h = ((hsl.h + shift) % 1 + 1) % 1;
    return rgbToHex(hslToRgb({ ...hsl, h }));
  } catch {
    return hex;
  }
}
