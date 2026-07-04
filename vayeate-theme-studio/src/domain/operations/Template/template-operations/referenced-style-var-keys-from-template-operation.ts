import { singleton } from 'tsyringe';
import type { Template } from '../../../../model/Template/schema/template-schemas';

/**
 * Collects style variable keys referenced by template mappings.
 */
@singleton()
export class ReferencedStyleVarKeysFromTemplateOperation {
  /**
   * Collects style variable keys in use by at least one mapping.
   * @param template Template whose mappings are scanned.
   * @returns Set of style variable keys.
   */
  execute(template: Template): Set<string> {
    const keys = new Set<string>();
    for (const mapping of template.mappings) {
      if (mapping.ignored === true) continue;
      if (mapping.styleVariableRef) keys.add(mapping.styleVariableRef);
    }
    return keys;
  }
}
