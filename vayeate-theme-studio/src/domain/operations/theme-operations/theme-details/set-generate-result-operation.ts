import { singleton } from 'tsyringe';
import { ThemesStateSetter } from '../../../state/theme/themes-state-reducer';

@singleton()
export class SetGenerateResultOperation {
  constructor(private readonly ThemesStateSetter: ThemesStateSetter) {}

  execute(result: { success: boolean; message: string } | null): void {
    this.ThemesStateSetter.apply({ type: 'SET_GENERATE_RESULT', result });
  }
}
