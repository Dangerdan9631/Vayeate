import { singleton } from 'tsyringe';
import type { ColorVariable, Template } from '../../../../model/schema/template-schemas';

/**
 * Adds color variable to the parent entity in the store.
 */

@singleton()
export class AddColorVariableOperation {

  /**
   * Runs the add color variable mutation.
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
    const newVars: ColorVariable[] = [
      ...template.colorVariables,
      { key, groupRef: groupRef ?? null },
    ];
    return { ...template, colorVariables: newVars };
  }
}
