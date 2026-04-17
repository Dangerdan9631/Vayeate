import { singleton } from 'tsyringe';
import type { ContrastVariable, Template } from '../../../../model/schema/template-schemas';

@singleton()
export class AddContrastVariableOperation {
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
