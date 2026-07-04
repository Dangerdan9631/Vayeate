import type { AdjustContrastOptions } from './color-types';
import { hexToRgb, normalizeHex, rgbToHex } from './color-hex';
import { hslToRgb, rgbToHsl } from './color-hsl';
import { contrastRatio, luminance } from './color-wcag';

const WCAG_RATIO_MAX = 21;

/**
 * Adjust foreground to have at least target contrast vs background.
 */
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

/**
 * Adjust foreground to have exactly target contrast vs background (binary search).
 */
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
  const loRatio = contrastRatio(rgbToHex(hslToRgb({ ...hsl, l: lo })), bg);
  const hiRatio = contrastRatio(rgbToHex(hslToRgb({ ...hsl, l: hi })), bg);
  const ratioIncreasesWithLightness = hiRatio > loRatio;
  let best = fg;
  let bestDistance = Math.abs(current - target);

  for (let i = 0; i < 64; i += 1) {
    const mid = (lo + hi) / 2;
    const candidate = rgbToHex(hslToRgb({ ...hsl, l: mid }));
    const ratio = contrastRatio(candidate, bg);
    const distance = Math.abs(ratio - target);
    if (distance < bestDistance) {
      best = candidate;
      bestDistance = distance;
    }

    if (ratioIncreasesWithLightness) {
      if (ratio < target) lo = mid;
      else hi = mid;
    } else {
      if (ratio < target) hi = mid;
      else lo = mid;
    }
  }
  return best;
}

/**
 * Adjusts a color so its contrast against a reference is at or below a maximum ratio.
 *
 * @param color - Foreground hex color to darken or lighten.
 * @param reference - Background reference hex for contrast measurement.
 * @param maxRatio - Maximum allowed WCAG contrast ratio.
 * @returns Adjusted hex color meeting the upper contrast bound.
 */
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

/**
 * Find a color with contrast vs background in [targetMin, targetMax] by varying lightness.
 */
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

function alphaSuffix(hex: string): string {
  const normalized = normalizeHex(hex);
  return normalized.length === 9 ? normalized.slice(7) : '';
}

function withAlpha(hex: string, alpha: string): string {
  const normalized = normalizeHex(hex);
  return `${normalized.slice(0, 7)}${alpha}`;
}

/**
 * Adjusts a token color so contrast against a source color meets the given constraint.
 * Optionally clamps the result so contrast versus the same source color stays within min/max bounds.
 *
 * @param tokenColor - Token foreground hex to adjust.
 * @param sourceColor - Comparison source background hex.
 * @param options - Comparison method, target value, and optional source-contrast bounds.
 * @returns Adjusted hex color in sRGB gamut.
 */
export function adjustColorToMeetContrast(
  tokenColor: string,
  sourceColor: string,
  options: AdjustContrastOptions,
): string {
  const { comparisonMethod, value, min, max } = options;
  const token = normalizeHex(tokenColor);
  const source = normalizeHex(sourceColor);
  const tokenAlpha = alphaSuffix(token);

  let result: string;

  if (comparisonMethod === 'greaterThan') {
    result = adjustBrightnessMin(token, source, value);
  } else if (comparisonMethod === 'lessThan') {
    result = adjustBrightnessToRange(token, source, 1, value);
  } else {
    result = adjustBrightnessExact(token, source, value);
  }

  if (min != null || max != null) {
    result = adjustBrightnessToRange(
      result,
      source,
      min ?? 1,
      max ?? WCAG_RATIO_MAX,
    );
  }

  /* Ensure result stays in sRGB; contrast math can push values outside [0,1]. */
  try {
    const rgb = hexToRgb(result);
    return withAlpha(rgbToHex({
      r: Math.max(0, Math.min(1, Number.isFinite(rgb.r) ? rgb.r : 0)),
      g: Math.max(0, Math.min(1, Number.isFinite(rgb.g) ? rgb.g : 0)),
      b: Math.max(0, Math.min(1, Number.isFinite(rgb.b) ? rgb.b : 0)),
    }), tokenAlpha);
  } catch {
    return withAlpha(result, tokenAlpha);
  }
}
