import { injectable } from 'tsyringe';
import type { ContrastVariable, Template } from '../../../../model/schemas';

@injectable()
export class AddContrastVariable {
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
