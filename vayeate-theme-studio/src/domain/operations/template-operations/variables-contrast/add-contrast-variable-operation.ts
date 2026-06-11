import { singleton } from 'tsyringe';
import type { ContrastVariable, Template } from '../../../../model/schema/template-schemas';

/**
 * Adds contrast variable to the parent entity in the store.
 */

@singleton()
export class AddContrastVariableOperation {

  /**
   * Runs the add contrast variable mutation.
   * @param template Template (Template).
   * @param key Key (string).
   * @param groupRef Group ref (string | null).
   * @returns Template result.
   */
  execute(
    template: Template,
    key: string,
    groupRef?: string | null,
  ): Template {
    const newVars: ContrastVariable[] = [
      ...template.contrastVariables,
      { key, comparisonSourceRef: null, groupRef: groupRef ?? null },
    ];
    return { ...template, contrastVariables: newVars };
  }
}
