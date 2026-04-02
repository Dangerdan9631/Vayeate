import { singleton } from 'tsyringe';
import { AppConfigStateSetter } from '../../state/app-config/app-config-state-reducer';

@singleton()
export class SetColorSchemeOperation {
  constructor(private readonly appConfigStateSetter: AppConfigStateSetter) {}

  execute(scheme: 'light' | 'dark'): void {
    this.appConfigStateSetter.apply({ type: 'SET_COLOR_SCHEME', scheme });
  }
}
