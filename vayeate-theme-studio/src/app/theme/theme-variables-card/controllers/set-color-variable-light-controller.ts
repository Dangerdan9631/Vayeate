import { singleton } from 'tsyringe';
import type { ColorVariableKey } from '../../../../model/schema/primitives';
import { SetColorVariableLightOperation } from '../../../../domain/operations/theme-operations/theme-details/set-color-variable-light-operation';

@singleton()
export class SetColorVariableLightController {
  constructor(
    private readonly setColorVariableLight: SetColorVariableLightOperation,
  ) {}

  run(ref: ColorVariableKey | undefined, value: string): void {
    this.setColorVariableLight.execute(ref, value);
  }
}


