import { singleton } from 'tsyringe';
import type { ThemeReference } from '../../../../model/schema/theme-schemas';
import { ThemesStore } from '../../../state/data/themes-store';

/**
 * Updates theme refs in the domain or UI store.
 */

@singleton()
export class SetThemeRefsOperation {
  constructor(private readonly themesStateSetter: ThemesStore) {}

  /**
   * Runs the set theme refs mutation.
   * @param refs Refs (ThemeReference[]).
   * @returns Nothing; updates store or invokes a gateway side effect.
   */

  execute(refs: ThemeReference[]): void {
    this.themesStateSetter.getStore().setThemeMapEntries(
      refs.map((r) => ({ name: r.name, version: r.version, isLoaded: false, theme: undefined })),
    );
  }
}
