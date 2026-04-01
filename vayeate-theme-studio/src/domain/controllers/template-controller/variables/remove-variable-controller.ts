import { singleton } from 'tsyringe';
import { AppStateGetter } from '../../../state/app-state-getter';
import { RemoveColorVariableController } from '../variables-color/remove-color-variable-controller';
import { RemoveContrastVariableController } from '../variables-contrast/remove-contrast-variable-controller';

@singleton()
export class RemoveVariableController {
  constructor(
    private readonly appStateGetter: AppStateGetter,
    private readonly removeColorVariable: RemoveColorVariableController,
    private readonly removeContrastVariable: RemoveContrastVariableController,
  ) {}

  async run(key: string): Promise<void> {
    const template = this.appStateGetter.current().templates.template;
    if (!template) return;

    if (template.colorVariables.some((variable) => variable.key === key)) {
      await this.removeColorVariable.run(key);
      return;
    }

    await this.removeContrastVariable.run(key);
  }
}
