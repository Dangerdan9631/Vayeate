import { singleton } from 'tsyringe';
import type { ThemePaneDerivationInputs } from '../../../operations/Theme/theme-operations/theme-utils/derive-theme-pane-fields-operation';

/**
 * Compares theme pane derivation inputs for memoization guards before recomputing derived fields.
 */
@singleton()
export class ValidateAreThemePaneDerivationInputsEqual {
  /**
   * @param before - Previous derivation inputs.
   * @param after - Current derivation inputs.
   * @returns `true` when all tracked fields are referentially or strictly equal.
   */
  test(before: ThemePaneDerivationInputs, after: ThemePaneDerivationInputs): boolean {
    return (
      before.colorAssignments === after.colorAssignments &&
      before.templateRef === after.templateRef &&
      before.applyHueToDark === after.applyHueToDark &&
      before.applyHueToLight === after.applyHueToLight &&
      before.hueAdjustment === after.hueAdjustment &&
      before.saturationAdjustment === after.saturationAdjustment &&
      before.valueAdjustment === after.valueAdjustment &&
      before.checkedColorRefs === after.checkedColorRefs
    );
  }
}
