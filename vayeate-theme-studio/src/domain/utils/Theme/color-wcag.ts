import { hexToRgb } from './color-hex';

function toLinear(c: number): number {
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/**
 * Computes relative luminance for a hex color per WCAG 2.x.
 *
 * @param hex - Normalized hex color string.
 * @returns Relative luminance in [0, 1].
 */
export function luminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/**
 * Computes the WCAG contrast ratio between foreground and background colors.
 *
 * @param foreground - Foreground hex color.
 * @param background - Background hex color.
 * @returns Contrast ratio in [1, 21].
 */
export function contrastRatio(foreground: string, background: string): number {
  const l1 = luminance(foreground);
  const l2 = luminance(background);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}
