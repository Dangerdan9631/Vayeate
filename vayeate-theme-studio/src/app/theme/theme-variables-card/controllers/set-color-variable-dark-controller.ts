import { singleton } from 'tsyringe';
import type { ColorVariableKey } from '../../../../model/schema/primitives';
import { SetColorVariableDarkOperation } from '../../../../domain/operations/theme-operations/theme-details/set-color-variable-dark-operation';

@singleton()
export class SetColorVariableDarkController {
  constructor(
    private readonly setColorVariableDark: SetColorVariableDarkOperation,
  ) {}

  run(ref: ColorVariableKey | undefined, value: string): void {
    this.setColorVariableDark.execute(ref, value);
  }
}


