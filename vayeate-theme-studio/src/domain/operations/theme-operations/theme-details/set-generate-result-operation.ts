import { injectable } from 'tsyringe';
import { AppStateSetter } from '../../../state/app-state-setter';
import type { AppStateUpdate } from '../../../state/app-state';

@injectable()
export class SetGenerateResultOperation {
  constructor(private readonly appStateSetter: AppStateSetter) {}

  execute(result: { success: boolean; message: string } | null): void {
    this.appStateSetter.apply({ type: 'SET_GENERATE_RESULT', result });
  }
}

/** @deprecated Use SetGenerateResultOperation class instead. */
export function setGenerateResult(
  setState: (update: AppStateUpdate) => void,
  result: { success: boolean; message: string } | null,
): void {
  setState({ type: 'SET_GENERATE_RESULT', result });
}

