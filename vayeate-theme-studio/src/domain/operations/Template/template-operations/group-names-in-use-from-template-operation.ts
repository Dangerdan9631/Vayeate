import { singleton } from 'tsyringe';
import type { Template } from '../../../../model/Template/schema/template-schemas';

/**
 * Collects mapping and variable group names referenced by a template.
 */
@singleton()
export class GroupNamesInUseFromTemplateOperation {
  /**
   * Collects non-null group names in use across the template definition.
   * @param template Template whose mappings and variable group refs are scanned.
   * @returns Set of referenced group names.
   */
  execute(template: Template): Set<string> {
    const groupNames = new Set<string>();
    for (const mapping of template.mappings) {
      if (mapping.groupRef) groupNames.add(mapping.groupRef);
    }
    for (const variable of template.colorVariables) {
      if (variable.groupRef) groupNames.add(variable.groupRef);
    }
    for (const variable of template.contrastVariables) {
      if (variable.groupRef) groupNames.add(variable.groupRef);
    }
    return groupNames;
  }
}
