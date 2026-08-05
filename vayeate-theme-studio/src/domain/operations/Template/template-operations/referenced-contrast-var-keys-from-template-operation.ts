import { singleton } from 'tsyringe';
import type { Template } from '../../../../model/Template/schema/template-schemas';

/**
 * Collects contrast variable keys referenced by template mappings.
 */
@singleton()
export class ReferencedContrastVarKeysFromTemplateOperation {
  /**
   * Collects contrast variable keys in use by at least one mapping.
   * @param template Template whose mappings are scanned.
   * @returns Set of contrast variable keys.
   */
  execute(template: Template): Set<string> {
    const keys = new Set<string>();
    for (const mapping of template.mappings) {
      if (mapping.ignored === true) continue;
      if (mapping.contrastVariableRef) keys.add(mapping.contrastVariableRef);
    }
    return keys;
  }
}
