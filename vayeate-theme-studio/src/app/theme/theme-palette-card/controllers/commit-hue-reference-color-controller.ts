import { singleton } from 'tsyringe';
import { SetThemeHueAdjustmentOperation } from '../../../../domain/operations/theme-operations/palette-hue/set-theme-hue-adjustment-operation';
import { SetThemeHueReferenceHexOperation } from '../../../../domain/operations/theme-operations/palette-hue/set-theme-hue-reference-hex-operation';
import { RecordThemeUndoOperation } from '../../../../domain/operations/undo-operations/record-theme-undo-operation';
import { SetCurrentUndoStackIdOperation } from '../../../../domain/operations/undo-operations/set-current-undo-stack-id-operation';
import { ThemeUiStore } from '../../../../domain/state/ui/theme-ui-store';
import { deriveUndoContext } from '../../../../model/undo-history';
import { recordCommitHueReferenceColorUndo } from './record-commit-hue-reference-color-undo';

@singleton()
export class CommitHueReferenceColorController {
  constructor(
    private readonly themeUiStore: ThemeUiStore,
    private readonly setThemeHueReferenceHex: SetThemeHueReferenceHexOperation,
    private readonly setThemeHueAdjustment: SetThemeHueAdjustmentOperation,
    private readonly recordThemeUndo: RecordThemeUndoOperation,
    private readonly setCurrentUndoStackId: SetCurrentUndoStackIdOperation,
  ) {}

  async run(value: string): Promise<void> {
    const state = this.themeUiStore.getStore().state;
    const theme = state.theme;
    if (!theme) return;

    const beforeHueReferenceHex = state.hueReferenceHex ?? '';
    const beforeHueAdjustment = state.hueAdjustment ?? 0;

    this.setCurrentUndoStackId.executeForContext(deriveUndoContext({
      tabId: 'themes',
      templateRef: theme.templateRef,
      themeRef: { name: theme.name, version: theme.version },
    }));

    this.setThemeHueReferenceHex.execute(value);
    this.setThemeHueAdjustment.execute(0);

    await recordCommitHueReferenceColorUndo(this.recordThemeUndo, {
      description: 'Set hue reference color',
      target: `${theme.name}@${theme.version}:hue-reference`,
      beforeHueReferenceHex,
      beforeHueAdjustment,
      afterHueReferenceHex: value,
    });
  }
}
