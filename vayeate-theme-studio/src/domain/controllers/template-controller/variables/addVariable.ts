import { singleton } from 'tsyringe';
import { AddColorVariableController } from '../variables-color/addColorVariable';
import { AddContrastVariableController } from '../variables-contrast/addContrastVariable';

@singleton()
export class AddVariableController {
  constructor(
    private readonly addColorVariable: AddColorVariableController,
    private readonly addContrastVariable: AddContrastVariableController,
  ) {}

  async run(
    key: string,
    groupRef: string | null,
    variableKind: 'color' | 'contrast',
  ): Promise<void> {
    if (variableKind === 'contrast') {
      await this.addContrastVariable.run(key.trim(), groupRef);
      return;
    }
    await this.addColorVariable.run(key.trim(), groupRef);
  }
}
