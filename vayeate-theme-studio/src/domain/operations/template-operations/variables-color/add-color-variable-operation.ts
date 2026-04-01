import { injectable } from 'tsyringe';
import type { ColorVariable, Template } from '../../../../model/schemas';

@injectable()
export class AddColorVariableOperation {
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
