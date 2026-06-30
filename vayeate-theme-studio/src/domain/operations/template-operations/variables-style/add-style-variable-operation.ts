import { singleton } from 'tsyringe';
import type { StyleVariable, Template } from '../../../../model/schema/template-schemas';

/**
 * Adds style variable to the parent entity in the store.
 */
@singleton()
export class AddStyleVariableOperation {
  /**
   * Runs the add style variable mutation.
   * @param template Template.
   * @param key Variable key.
   * @param groupRef Group ref.
   * @returns Template result.
   */
  execute(
    template: Template,
    key: string,
    groupRef?: string | null,
  ): Template {
    const newVars: StyleVariable[] = [
      ...(template.styleVariables ?? []),
      { key, groupRef: groupRef ?? null },
    ];
    return { ...template, styleVariables: newVars };
  }
}
