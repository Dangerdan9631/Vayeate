import { singleton } from 'tsyringe';
import type { Template } from '../../../../model/Template/schema/template-schemas';

/**
 * Collects color variable keys referenced by mappings and contrast comparison sources.
 */
@singleton()
export class ReferencedColorVarKeysFromTemplateOperation {
  /**
   * Collects color variable keys required by the template definition.
   * @param template Template whose mappings and contrast variables are scanned.
   * @returns Set of color variable keys.
   */
  execute(template: Template): Set<string> {
    const keys = new Set<string>();
    for (const mapping of template.mappings) {
      if (mapping.ignored === true) continue;
      if (mapping.colorVariableRef) keys.add(mapping.colorVariableRef);
    }
    for (const contrastVariable of template.contrastVariables) {
      if (contrastVariable.comparisonSourceRef) keys.add(contrastVariable.comparisonSourceRef);
    }
    return keys;
  }
}
