/**
 * Color and contrast utilities for theme preview and generation.
 * WCAG 2.1 relative luminance and contrast ratio; adjust token color to meet contrast constraints.
 */

export interface Rgb {
  r: number;
  g: number;
  b: number;
}

export interface Hsl {
  h: number;
  s: number;
  l: number;
}

export type ContrastComparisonMethod = 'lessThan' | 'equalTo' | 'greaterThan';

export interface AdjustContrastOptions {
  comparisonMethod: ContrastComparisonMethod;
  value: number;
  min?: number | null;
  max?: number | null;
}

const WCAG_RATIO_MAX = 21;

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

export function hexToRgb(hex: string): Rgb {
  const n = normalizeHex(hex);
  const rgbHex = n.slice(1, 7);
  return {
    r: parseInt(rgbHex.slice(0, 2), 16) / 255,
    g: parseInt(rgbHex.slice(2, 4), 16) / 255,
    b: parseInt(rgbHex.slice(4, 6), 16) / 255,
  };
}

export function rgbToHex(rgb: Rgb): string {
  const toHex = (value: number) => {
    const clamped = Math.max(0, Math.min(1, value));
    return Math.round(clamped * 255)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

function toLinear(c: number): number {
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

export function luminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

export function contrastRatio(foreground: string, background: string): number {
  const l1 = luminance(foreground);
  const l2 = luminance(background);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

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

/** Adjust foreground to have at least target contrast vs background. */
function adjustBrightnessMin(foreground: string, background: string, target: number): string {
  const fg = normalizeHex(foreground);
  const bg = normalizeHex(background);
  if (contrastRatio(fg, bg) >= target) return fg;

  const fgLum = luminance(fg);
  const bgLum = luminance(bg);
  const fgShouldBeLighter = fgLum >= bgLum;

  const hsl = rgbToHsl(hexToRgb(fg));
  let lo = fgShouldBeLighter ? hsl.l : 0;
  let hi = fgShouldBeLighter ? 1 : hsl.l;
  let best = fg;

  for (let i = 0; i < 64; i += 1) {
    const mid = (lo + hi) / 2;
    const candidate = rgbToHex(hslToRgb({ ...hsl, l: mid }));
    const ratio = contrastRatio(candidate, bg);

    if (fgShouldBeLighter) {
      if (ratio >= target) {
        best = candidate;
        hi = mid;
      } else {
        lo = mid;
      }
    } else if (ratio >= target) {
      best = candidate;
      lo = mid;
    } else {
      hi = mid;
    }
  }
  return best;
}

/** Adjust foreground to have exactly target contrast vs background (binary search). */
function adjustBrightnessExact(foreground: string, background: string, target: number): string {
  const fg = normalizeHex(foreground);
  const bg = normalizeHex(background);
  const current = contrastRatio(fg, bg);
  const fgLum = luminance(fg);
  const bgLum = luminance(bg);
  const fgShouldBeLighter = fgLum >= bgLum;
  const goLighter = current < target ? fgShouldBeLighter : !fgShouldBeLighter;

  const hsl = rgbToHsl(hexToRgb(fg));
  let lo = goLighter ? hsl.l : 0;
  let hi = goLighter ? 1 : hsl.l;
  let best = fg;

  for (let i = 0; i < 64; i += 1) {
    const mid = (lo + hi) / 2;
    const candidate = rgbToHex(hslToRgb({ ...hsl, l: mid }));
    const ratio = contrastRatio(candidate, bg);
    best = candidate;
    if (goLighter) {
      if (ratio < target) lo = mid;
      else hi = mid;
    } else {
      if (ratio < target) hi = mid;
      else lo = mid;
    }
  }
  return best;
}

/** Adjust color so contrast vs reference is at or below maxRatio. */
export function adjustBrightnessMax(color: string, reference: string, maxRatio: number): string {
  const c = normalizeHex(color);
  const r = normalizeHex(reference);

  if (contrastRatio(c, r) <= maxRatio) return c;

  const colorHsl = rgbToHsl(hexToRgb(c));
  const refHsl = rgbToHsl(hexToRgb(r));
  const colorLighter = colorHsl.l > refHsl.l;

  let lo = colorLighter ? refHsl.l : colorHsl.l;
  let hi = colorLighter ? colorHsl.l : refHsl.l;
  let best = c;

  for (let i = 0; i < 64; i += 1) {
    const mid = (lo + hi) / 2;
    const candidate = rgbToHex(hslToRgb({ ...colorHsl, l: mid }));
    const ratio = contrastRatio(candidate, r);

    if (colorLighter) {
      if (ratio > maxRatio) {
        hi = mid;
      } else {
        best = candidate;
        lo = mid;
      }
    } else if (ratio > maxRatio) {
      lo = mid;
    } else {
      best = candidate;
      hi = mid;
    }
  }
  return best;
}

/** Find a color with contrast vs background in [targetMin, targetMax] by varying lightness. */
function adjustBrightnessToRange(
  foreground: string,
  background: string,
  targetMin: number,
  targetMax: number,
): string {
  const fg = normalizeHex(foreground);
  const bg = normalizeHex(background);
  const current = contrastRatio(fg, bg);
  if (current >= targetMin && current <= targetMax) return fg;

  const hsl = rgbToHsl(hexToRgb(fg));
  const bgLum = luminance(bg);
  let lo = 0;
  let hi = 1;
  let best = fg;

  for (let i = 0; i < 64; i += 1) {
    const mid = (lo + hi) / 2;
    const candidate = rgbToHex(hslToRgb({ ...hsl, l: mid }));
    const ratio = contrastRatio(candidate, bg);
    const candidateLighter = mid > bgLum;

    if (ratio < targetMin) {
      best = candidate;
      if (candidateLighter) lo = mid;
      else hi = mid;
    } else if (ratio > targetMax) {
      best = candidate;
      if (candidateLighter) hi = mid;
      else lo = mid;
    } else {
      return candidate;
    }
  }
  return best;
}

const BLACK = '#000000';

/**
 * Clamp color so that its contrast vs black is within [minContrast, maxContrast].
 * Min and max in contrast variables represent the allowed range for the color's contrast compared to black.
 */
function clampContrastVsBlack(
  color: string,
  minContrast: number,
  maxContrast: number,
): string {
  const c = normalizeHex(color);
  const ratioVsBlack = contrastRatio(c, BLACK);
  if (ratioVsBlack >= minContrast && ratioVsBlack <= maxContrast) return c;
  return adjustBrightnessToRange(c, BLACK, minContrast, maxContrast);
}

/**
 * Adjust tokenColor so that contrast(tokenColor, sourceColor) meets the given constraint.
 * - greaterThan: ratio vs source >= value.
 * - lessThan: ratio vs source <= value.
 * - equalTo: ratio vs source as close as possible to value.
 * If min/max are set, the result is then clamped so that contrast(result, black) is in [min, max].
 */
export function adjustColorToMeetContrast(
  tokenColor: string,
  sourceColor: string,
  options: AdjustContrastOptions,
): string {
  const { comparisonMethod, value, min, max } = options;
  const token = normalizeHex(tokenColor);
  const source = normalizeHex(sourceColor);

  let result: string;

  if (comparisonMethod === 'greaterThan') {
    result = adjustBrightnessMin(token, source, value);
  } else if (comparisonMethod === 'lessThan') {
    result = adjustBrightnessToRange(token, source, 1, value);
  } else {
    result = adjustBrightnessExact(token, source, value);
  }

  if (min != null || max != null) {
    result = clampContrastVsBlack(
      result,
      min ?? 1,
      max ?? WCAG_RATIO_MAX,
    );
  }

  return result;
}
