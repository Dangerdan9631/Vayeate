import type { PaletteConfig, PaletteEntry } from "../domain/types";
import { deltaEok, hexToRgb, hslToRgb, normalizeHex, rgbToHex, rgbToHsl } from "./color";

function rotateHue(hex: string, delta: number): string {
  const hsl = rgbToHsl(hexToRgb(hex));
  const nextHue = (hsl.h + delta + 1) % 1;
  return rgbToHex(hslToRgb({ ...hsl, h: nextHue }));
}

export function derivePaletteFromSeed(seedHex: string, includeComplementary: boolean, includeAnalogous: boolean): string[] {
  const seed = normalizeHex(seedHex);
  const result = new Set<string>([seed]);

  if (includeComplementary) {
    result.add(rotateHue(seed, 0.5));
  }

  if (includeAnalogous) {
    result.add(rotateHue(seed, 1 / 12));
    result.add(rotateHue(seed, -1 / 12));
  }

  return Array.from(result);
}

export function filterByPerceptualDistance(colors: string[], minDeltaE: number): string[] {
  const accepted: string[] = [];

  for (const color of colors.map(normalizeHex)) {
    const isFarEnough = accepted.every((existing) => deltaEok(existing, color) >= minDeltaE);
    if (isFarEnough) {
      accepted.push(color);
    }
  }

  return accepted;
}

export function buildPaletteEntries(config: PaletteConfig, seedHexByVariableId: Record<string, string>): PaletteEntry[] {
  const entries: PaletteEntry[] = [];

  for (const seedId of config.seedVariableIds) {
    const seedHex = seedHexByVariableId[seedId];
    if (!seedHex) continue;

    const derived = derivePaletteFromSeed(seedHex, config.includeComplementary, config.includeAnalogous);
    const filtered = filterByPerceptualDistance(derived, config.minDeltaE);

    filtered.forEach((hex, index) => {
      entries.push({
        id: `${seedId}-${index}`,
        hex: normalizeHex(hex) as `#${string}`,
        source: index === 0 ? "seed" : "derived",
        tags: index === 0 ? ["seed"] : ["derived"],
      });
    });
  }

  return entries;
}