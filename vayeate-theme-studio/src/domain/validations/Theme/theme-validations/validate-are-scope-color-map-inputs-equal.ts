import { singleton } from 'tsyringe';
import {
  hashScopeColorMapInputs,
  type ScopeColorMapInputs,
} from '../../../operations/Theme/theme-operations/theme-utils/scope-resolver-operation';

/**
 * Compares scope color map input snapshots for memoization invalidation.
 */
@singleton()
export class ValidateAreScopeColorMapInputsEqual {
  /**
   * @param before - Previous scope map inputs.
   * @param after - Current scope map inputs.
   * @returns `true` when serialized inputs are identical.
   */
  test(before: ScopeColorMapInputs, after: ScopeColorMapInputs): boolean {
    return hashScopeColorMapInputs(before) === hashScopeColorMapInputs(after);
  }
}
