import { singleton } from 'tsyringe';
import type { TemplateLifecycleUndoSnapshot } from '../../../model/template-undo-lifecycle';
import type { TemplateReference } from '../../../model/schema/theme-schemas';
import { DeleteTemplateOperation } from '../template-operations/template-list/delete-template-operation';
import { LoadTemplateOperation } from '../template-operations/template-details/load-template-operation';
import { RefreshTemplateRefsOperation } from '../template-operations/template-list/refresh-template-refs-operation';
import { SetSelectedTemplateRefOperation } from '../template-operations/template-list/set-selected-template-ref-operation';
import { SetTemplateOperation } from '../template-operations/template-details/set-template-operation';
import { ApplyTemplateUndoStateOperation } from './apply-template-undo-state-operation';

/**
 * Applies template lifecycle undo to the store as part of undo or theme replay.
 */

@singleton()
export class ApplyTemplateLifecycleUndoOperation {
  constructor(
    private readonly deleteTemplate: DeleteTemplateOperation,
    private readonly applyTemplateUndoState: ApplyTemplateUndoStateOperation,
    private readonly setSelectedTemplateRef: SetSelectedTemplateRefOperation,
    private readonly refreshTemplateRefs: RefreshTemplateRefsOperation,
    private readonly loadTemplate: LoadTemplateOperation,
    private readonly setTemplate: SetTemplateOperation,
  ) {}

  /**
   * Runs apply version deleted for apply template lifecycle undo.
   * @param before Before (TemplateLifecycleUndoSnapshot).
   * @param after After (TemplateLifecycleUndoSnapshot).
   * @returns Nothing; updates store or invokes a gateway side effect.
   */

  applyVersionDeleted(before: TemplateLifecycleUndoSnapshot, after: TemplateLifecycleUndoSnapshot): void {
    const template = before.template;
    if (!template) return;
    this.deleteTemplate.execute(template.name, template.version)
      .then('Refresh template refs after redo delete', () => {
        void this.refreshTemplateRefs.execute().then(() => {
          this.selectRefAndLoad(after.selectedRef);
        });
      });
  }

  /**
   * Runs revert version deleted for apply template lifecycle undo.
   * @param before Before (TemplateLifecycleUndoSnapshot).
   * @returns Nothing; updates store or invokes a gateway side effect.
   */

  revertVersionDeleted(before: TemplateLifecycleUndoSnapshot): void {
    if (!before.template) return;
    this.applyTemplateUndoState.execute(before.template);
  }

  /**
   * Runs apply created for apply template lifecycle undo.
   * @param after After (TemplateLifecycleUndoSnapshot).
   * @returns Nothing; updates store or invokes a gateway side effect.
   */

  applyCreated(after: TemplateLifecycleUndoSnapshot): void {
    if (!after.template) return;
    this.applyTemplateUndoState.execute(after.template);
  }

  /**
   * Runs revert created for apply template lifecycle undo.
   * @param before Before (TemplateLifecycleUndoSnapshot).
   * @param after After (TemplateLifecycleUndoSnapshot).
   * @returns Nothing; updates store or invokes a gateway side effect.
   */

  revertCreated(before: TemplateLifecycleUndoSnapshot, after: TemplateLifecycleUndoSnapshot): void {
    const template = after.template;
    if (!template) return;
    this.deleteTemplate.execute(template.name, template.version)
      .then('Refresh template refs after undo create', () => {
        void this.refreshTemplateRefs.execute().then(() => {
          this.selectRefAndLoad(before.selectedRef);
        });
      });
  }

  private selectRefAndLoad(ref: TemplateReference | null): void {
    this.setSelectedTemplateRef.execute(ref);
    if (ref) {
      void this.loadTemplate.execute(ref.name, ref.version);
    } else {
      this.setTemplate.execute(null);
    }
  }
}
