import { injectable } from 'tsyringe';
import { ThemesStateSetter } from '../../../state/theme/themes-state-reducer';
import type { ThemesStateUpdate } from '../../../state/theme/themes-state-reducer';

@injectable()
export class SetGenerateResultOperation {
  constructor(private readonly ThemesStateSetter: ThemesStateSetter) {}

  execute(result: { success: boolean; message: string } | null): void {
    this.ThemesStateSetter.apply({ type: 'SET_GENERATE_RESULT', result });
  }
}

/** @deprecated Use SetGenerateResultOperation class instead. */
export function setGenerateResult(
  setState: (update: ThemesStateUpdate) => void,
  result: { success: boolean; message: string } | null,
): void {
  setState({ type: 'SET_GENERATE_RESULT', result });
}

