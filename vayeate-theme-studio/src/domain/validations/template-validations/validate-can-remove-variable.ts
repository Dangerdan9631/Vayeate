import { singleton } from 'tsyringe';
import type { Template } from '../../../model/schema/template-schemas';
import { referencedColorVarKeysFromTemplate } from '../../utils/referenced-color-var-keys-from-template';
import { referencedContrastVarKeysFromTemplate } from '../../utils/referenced-contrast-var-keys-from-template';
import { referencedStyleVarKeysFromTemplate } from '../../utils/referenced-style-var-keys-from-template';

/**
 * Checks that a template variable is not referenced elsewhere before removal.
 */
@singleton()
export class ValidateCanRemoveVariable {
  /**
   * Resolves whether the variable key is still referenced by color or contrast mappings.
   *
   * @param template - Template that owns the variable.
   * @param key - Variable key targeted for removal.
   * @returns `true` when the key exists and is not referenced by template mappings.
   */
  test(template: Template, key: string): boolean {
    if (template.colorVariables.some((variable) => variable.key === key)) {
      return !referencedColorVarKeysFromTemplate(template).has(key);
    }
    if (template.contrastVariables.some((variable) => variable.key === key)) {
      return !referencedContrastVarKeysFromTemplate(template).has(key);
    }
    return (template.styleVariables ?? []).some((variable) => variable.key === key)
      && !referencedStyleVarKeysFromTemplate(template).has(key);
  }
}
