import { singleton } from 'tsyringe';
import { AppConfigStore } from '../../state/data/app-config-store';

/**
 * Updates color scheme in the domain or UI store.
 */

@singleton()
export class SetColorSchemeOperation {
  constructor(private readonly appConfigStore: AppConfigStore) {}

  /**
   * Runs the set color scheme mutation.
   * @param scheme Scheme ('light' | 'dark').
   * @returns Nothing; updates store or invokes a gateway side effect.
   */

  execute(scheme: 'light' | 'dark'): void {
    this.appConfigStore.getStore().setColorScheme(scheme);
  }
}
