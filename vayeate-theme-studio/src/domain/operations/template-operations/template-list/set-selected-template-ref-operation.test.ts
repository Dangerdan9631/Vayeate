import { describe, expect, it } from 'vitest';
import { TemplatesStore } from '../../../state/data/templates-store';
import { TemplateUiStore } from '../../../state/ui/template-ui-store';
import { SetSelectedTemplateRefOperation } from './set-selected-template-ref-operation';

describe('SetSelectedTemplateRefOperation mapping selection lifecycle', () => {
  it('clears mapping selection when the active template context changes', () => {
    const templatesStore = new TemplatesStore();
    const templateUiStore = new TemplateUiStore();
    const operation = new SetSelectedTemplateRefOperation(templatesStore, templateUiStore);
    templateUiStore.getStore().selectTemplate({ name: 'one', version: '1.0.0' });
    templateUiStore.getStore().setSelectedMappingIds([{ tokenKey: 'token', tokenType: 'theme' }]);

    operation.execute({ name: 'two', version: '1.0.0' });

    expect(templateUiStore.getStore().state.selectedMappingIds).toEqual([]);
  });

  it('retains mapping selection when the same template context is selected again', () => {
    const templatesStore = new TemplatesStore();
    const templateUiStore = new TemplateUiStore();
    const operation = new SetSelectedTemplateRefOperation(templatesStore, templateUiStore);
    const ref = { name: 'one', version: '1.0.0' };
    templateUiStore.getStore().selectTemplate(ref);
    templateUiStore.getStore().setSelectedMappingIds([{ tokenKey: 'token', tokenType: 'theme' }]);

    operation.execute(ref);

    expect(templateUiStore.getStore().state.selectedMappingIds).toEqual([
      { tokenKey: 'token', tokenType: 'theme' },
    ]);
  });
});
