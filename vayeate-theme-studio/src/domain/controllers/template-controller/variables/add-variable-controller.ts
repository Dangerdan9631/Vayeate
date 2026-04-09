import { singleton } from 'tsyringe';
import { TemplatesStateGetter } from '../../../state/template/templates-state-reducer';
import { AddColorVariableController } from '../variables-color/add-color-variable-controller';
import { AddContrastVariableController } from '../variables-contrast/add-contrast-variable-controller';
import { SetTemplateAddVariableNameController } from './set-template-add-variable-name-controller';

@singleton()
export class AddVariableController {
  constructor(
    private readonly templatesStateGetter: TemplatesStateGetter,
    private readonly addColorVariable: AddColorVariableController,
    private readonly addContrastVariable: AddContrastVariableController,
    private readonly setTemplateAddVariableName: SetTemplateAddVariableNameController,
  ) {}

  async run(groupRef: string | null, variableKind: 'color' | 'contrast'): Promise<void> {
    const key = this.templatesStateGetter.current().addVariableName.trim();
    if (!key) return;
    if (variableKind === 'contrast') {
      await this.addContrastVariable.run(key, groupRef);
    } else {
      await this.addColorVariable.run(key, groupRef);
    }
    this.setTemplateAddVariableName.run('');
  }
}
