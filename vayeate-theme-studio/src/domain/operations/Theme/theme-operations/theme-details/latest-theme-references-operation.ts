import { singleton } from 'tsyringe';
import type { ThemeReference } from '../../../../../model/Theme/schema/theme-schemas';
import { compareVersions } from '../../../../utils/Common/compare-versions';

function comparePrerelease(a: string, b: string): number {
  const prereleaseA = /^v?\d+\.\d+\.\d+(?:-([^+]+))?/.exec(a)?.[1];
  const prereleaseB = /^v?\d+\.\d+\.\d+(?:-([^+]+))?/.exec(b)?.[1];
  if (!prereleaseA && !prereleaseB) return 0;
  if (!prereleaseA) return 1;
  if (!prereleaseB) return -1;
  const identifiersA = prereleaseA.split('.');
  const identifiersB = prereleaseB.split('.');
  const length = Math.max(identifiersA.length, identifiersB.length);
  for (let index = 0; index < length; index += 1) {
    const identifierA = identifiersA[index];
    const identifierB = identifiersB[index];
    if (identifierA === undefined) return -1;
    if (identifierB === undefined) return 1;
    if (identifierA === identifierB) continue;
    const numberA = /^\d+$/.test(identifierA) ? Number(identifierA) : null;
    const numberB = /^\d+$/.test(identifierB) ? Number(identifierB) : null;
    if (numberA !== null && numberB !== null) return numberA - numberB;
    if (numberA !== null) return -1;
    if (numberB !== null) return 1;
    return identifierA.localeCompare(identifierB);
  }
  return 0;
}

function compareThemeVersions(a: string, b: string): number {
  return compareVersions(a, b) || comparePrerelease(a, b);
}

/**
 * Selects the highest semantic version for each distinct theme name.
 *
 * @param references - Theme file references discovered by the persistence gateway.
 * @returns Latest references ordered by theme name for deterministic batch output.
 */
export function latestThemeReferences(
  references: readonly ThemeReference[],
): ThemeReference[] {
  const latestByName = new Map<string, ThemeReference>();
  for (const reference of references) {
    const current = latestByName.get(reference.name);
    if (!current || compareThemeVersions(reference.version, current.version) > 0) {
      latestByName.set(reference.name, reference);
    }
  }
  return [...latestByName.values()].sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Operation wrapper for selecting latest theme file references.
 */
@singleton()
export class LatestThemeReferencesOperation {}
