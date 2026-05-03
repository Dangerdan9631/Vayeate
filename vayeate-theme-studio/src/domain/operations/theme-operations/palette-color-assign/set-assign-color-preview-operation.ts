import { singleton } from 'tsyringe';
import type { Theme } from '../../../../model/schema/theme-schemas';
import { ThemeUiStore } from '../../../state/ui/theme-ui-store';
import { applyHueToAssignmentsFiltered } from '../../../utils/theme-assignment-utils';

/** Live palette preview for assign-color (checked refs only); does not persist. */
@singleton()
export class SetAssignColorPreviewOperation {
  constructor(private readonly themeUiStore: ThemeUiStore) {}

  execute(args: {
    normalizedHex: string;
    theme: Theme;
    checkedColorRefs: ReadonlySet<string>;
    hueAdjustment: number;
  }): void {
    const { normalizedHex, theme, checkedColorRefs, hueAdjustment } = args;
    const applyToDark = theme.applyPaletteToDark ?? true;
    const applyToLight = theme.applyPaletteToLight ?? true;
    let workingAssignments = theme.colorAssignments;
    if (hueAdjustment !== 0) {
      workingAssignments = applyHueToAssignmentsFiltered(
        theme.colorAssignments,
        hueAdjustment / 100,
        checkedColorRefs,
        { applyToDark, applyToLight },
      );
    }
    const newAssignments = workingAssignments.map((a) => {
      if (!checkedColorRefs.has(a.colorRef)) return a;
      let next = { ...a };
      if (applyToDark) next = { ...next, dark: { value: normalizedHex } };
      if (applyToLight) next = { ...next, light: { value: normalizedHex } };
      return next;
    });
    const nextTheme: Theme = { ...theme, colorAssignments: newAssignments };
    this.themeUiStore.getStore().setTheme(nextTheme);
  }
}


