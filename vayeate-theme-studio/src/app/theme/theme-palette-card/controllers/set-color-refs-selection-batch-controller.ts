import { singleton } from 'tsyringe';
import { SetThemePaneSelectionsOperation } from '../../../../domain/operations/theme-operations/pickers/set-theme-pane-selections-operation';
import { ThemeUiStore } from '../../../../domain/state/ui/theme-ui-store';

/** Applies checked state to many color variable refs in one state update (single user gesture). */
@singleton()
export class SetColorRefsSelectionBatchController {
  constructor(
    private readonly themeUiStore: ThemeUiStore,
    private readonly setThemePaneSelections: SetThemePaneSelectionsOperation,
  ) {}

  run(refs: readonly string[], checked: boolean): void {
    const state = this.themeUiStore.getStore().state;
    if (!state.theme || refs.length === 0) return;
    const colorSet = new Set(state.checkedColorRefs);
    for (const ref of refs) {
      if (checked) colorSet.add(ref);
      else colorSet.delete(ref);
    }
    this.setThemePaneSelections.execute([...colorSet], state.checkedContrastRefs);
  }
}


