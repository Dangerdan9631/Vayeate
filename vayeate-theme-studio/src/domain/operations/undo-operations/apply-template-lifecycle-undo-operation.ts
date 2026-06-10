import { singleton } from 'tsyringe';
import type { TemplateLifecycleUndoSnapshot } from '../../../model/template-undo-lifecycle';
import type { TemplateReference } from '../../../model/schema/theme-schemas';
import { DeleteTemplateOperation } from '../template-operations/template-list/delete-template-operation';
import { LoadTemplateOperation } from '../template-operations/template-details/load-template-operation';
import { RefreshTemplateRefsOperation } from '../template-operations/template-list/refresh-template-refs-operation';
import { SetSelectedTemplateRefOperation } from '../template-operations/template-list/set-selected-template-ref-operation';
import { SetTemplateOperation } from '../template-operations/template-details/set-template-operation';
import { ApplyTemplateUndoStateOperation } from './apply-template-undo-state-operation';

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

  revertVersionDeleted(before: TemplateLifecycleUndoSnapshot): void {
    if (!before.template) return;
    this.applyTemplateUndoState.execute(before.template);
  }

  applyCreated(after: TemplateLifecycleUndoSnapshot): void {
    if (!after.template) return;
    this.applyTemplateUndoState.execute(after.template);
  }

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
