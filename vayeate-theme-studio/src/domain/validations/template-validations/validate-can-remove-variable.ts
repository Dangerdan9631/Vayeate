import { singleton } from 'tsyringe';
import type { Template } from '../../../model/schemas';
import { referencedColorVarKeysFromTemplate } from '../../utils/referenced-color-var-keys-from-template';
import { referencedContrastVarKeysFromTemplate } from '../../utils/referenced-contrast-var-keys-from-template';

@singleton()
export class ValidateCanRemoveVariable {
  test(template: Template, key: string): boolean {
    if (template.colorVariables.some((variable) => variable.key === key)) {
      return !referencedColorVarKeysFromTemplate(template).has(key);
    }
    return !referencedContrastVarKeysFromTemplate(template).has(key);
  }
}
