import { singleton } from 'tsyringe';
import { ThemesStore } from '../../../state/theme/themes-store';

@singleton()
export class SetGenerateResultOperation {
  constructor(private readonly ThemesStore: ThemesStore) {}

  execute(result: { success: boolean; message: string } | null): void {
    this.ThemesStore.getStore().setGenerateResult(result);
  }
}


