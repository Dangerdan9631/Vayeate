import { singleton } from 'tsyringe';
import { AppStateSetter } from '../../state/app-state-setter';

@singleton()
export class SetColorSchemeOperation {
  constructor(private readonly appStateSetter: AppStateSetter) {}

  execute(scheme: 'light' | 'dark'): void {
    this.appStateSetter.apply({ type: 'SET_COLOR_SCHEME', scheme });
  }
}
