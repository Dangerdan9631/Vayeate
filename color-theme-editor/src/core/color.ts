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

export interface Oklab {
  l: number;
  a: number;
  b: number;
}

export function normalizeHex(hex: string): string {
  const h = hex.trim().toLowerCase();
  if (!h.startsWith("#")) {
    throw new Error(`Invalid hex color: ${hex}`);
  }

  const value = h.slice(1);
  if (value.length === 3) {
    return `#${value
      .split("")
      .map((c) => c + c)
      .join("")}`;
  }

  if (value.length === 6 || value.length === 8) {
    return `#${value.slice(0, 6)}`;
  }

  throw new Error(`Invalid hex color length: ${hex}`);
}

export function hexToRgb(hex: string): Rgb {
  const n = normalizeHex(hex);
  return {
    r: parseInt(n.slice(1, 3), 16) / 255,
    g: parseInt(n.slice(3, 5), 16) / 255,
    b: parseInt(n.slice(5, 7), 16) / 255,
  };
}

export function rgbToHex(rgb: Rgb): string {
  const toHex = (value: number) => {
    const clamped = Math.max(0, Math.min(1, value));
    return Math.round(clamped * 255)
      .toString(16)
      .padStart(2, "0");
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

export function adjustBrightness(
  foreground: string,
  background: string,
  target: number,
  mode: "min" | "exact" = "min",
): string {
  const fg = normalizeHex(foreground);
  const bg = normalizeHex(background);
  const current = contrastRatio(fg, bg);

  if (mode === "min" && current >= target) {
    return fg;
  }

  const fgLum = luminance(fg);
  const bgLum = luminance(bg);
  const fgShouldBeLighter = fgLum >= bgLum;

  const goLighter =
    mode === "min" ? fgShouldBeLighter : current < target ? fgShouldBeLighter : !fgShouldBeLighter;

  const hsl = rgbToHsl(hexToRgb(fg));
  let lo = goLighter ? hsl.l : 0;
  let hi = goLighter ? 1 : hsl.l;
  let best = fg;

  for (let i = 0; i < 64; i += 1) {
    const mid = (lo + hi) / 2;
    const candidate = rgbToHex(hslToRgb({ ...hsl, l: mid }));
    const ratio = contrastRatio(candidate, bg);

    if (mode === "min") {
      if (goLighter) {
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
    } else {
      best = candidate;
      if (goLighter) {
        if (ratio < target) lo = mid;
        else hi = mid;
      } else if (ratio > target) hi = mid;
      else lo = mid;
    }
  }

  return best;
}

export function adjustBrightnessMax(color: string, reference: string, maxRatio: number): string {
  const c = normalizeHex(color);
  const r = normalizeHex(reference);

  if (contrastRatio(c, r) <= maxRatio) {
    return c;
  }

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

function srgbToLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

export function toOklab(hex: string): Oklab {
  const { r, g, b } = hexToRgb(hex);
  const lr = srgbToLinear(r);
  const lg = srgbToLinear(g);
  const lb = srgbToLinear(b);

  const l = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
  const m = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
  const s = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb;

  const lC = Math.cbrt(l);
  const mC = Math.cbrt(m);
  const sC = Math.cbrt(s);

  return {
    l: 0.2104542553 * lC + 0.793617785 * mC - 0.0040720468 * sC,
    a: 1.9779984951 * lC - 2.428592205 * mC + 0.4505937099 * sC,
    b: 0.0259040371 * lC + 0.7827717662 * mC - 0.808675766 * sC,
  };
}

export function deltaEok(hexA: string, hexB: string): number {
  const a = toOklab(hexA);
  const b = toOklab(hexB);
  return Math.sqrt((a.l - b.l) ** 2 + (a.a - b.a) ** 2 + (a.b - b.b) ** 2);
}