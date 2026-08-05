import { singleton } from 'tsyringe';
import type { Template } from '../../../../model/Template/schema/template-schemas';
import { ReferencedColorVarKeysFromTemplateOperation } from '../../../operations/Template/template-operations/referenced-color-var-keys-from-template-operation';
import { ReferencedContrastVarKeysFromTemplateOperation } from '../../../operations/Template/template-operations/referenced-contrast-var-keys-from-template-operation';
import { ReferencedStyleVarKeysFromTemplateOperation } from '../../../operations/Template/template-operations/referenced-style-var-keys-from-template-operation';

/**
 * Checks that a template variable is not referenced elsewhere before removal.
 */
@singleton()
export class ValidateCanRemoveVariable {
  constructor(
    private readonly referencedColorVarKeysFromTemplate: ReferencedColorVarKeysFromTemplateOperation,
    private readonly referencedContrastVarKeysFromTemplate: ReferencedContrastVarKeysFromTemplateOperation,
    private readonly referencedStyleVarKeysFromTemplate: ReferencedStyleVarKeysFromTemplateOperation,
  ) {}

  /**
   * Resolves whether the variable key is still referenced by color or contrast mappings.
   *
   * @param template - Template that owns the variable.
   * @param key - Variable key targeted for removal.
   * @returns `true` when the key exists and is not referenced by template mappings.
   */
  test(template: Template, key: string): boolean {
    if (template.colorVariables.some((variable) => variable.key === key)) {
      return !this.referencedColorVarKeysFromTemplate.execute(template).has(key);
    }
    if (template.contrastVariables.some((variable) => variable.key === key)) {
      return !this.referencedContrastVarKeysFromTemplate.execute(template).has(key);
    }
    return (template.styleVariables ?? []).some((variable) => variable.key === key)
      && !this.referencedStyleVarKeysFromTemplate.execute(template).has(key);
  }
}
