import { describe, expect, it } from 'vitest';
import { TemplateUiStore } from '../../../state/ui/template-ui-store';
import { ClearTemplateMappingSelectionOperation } from './clear-template-mapping-selection-operation';
import { SetTemplateMappingColorVariableFilterOperation } from './set-template-mapping-color-variable-filter-operation';
import { SetTemplateMappingContrastVariableFilterOperation } from './set-template-mapping-contrast-variable-filter-operation';
import { SetTemplateMappingSearchTextOperation } from './set-template-mapping-search-text-operation';
import { SetTemplateMappingSelectionBatchOperation } from './set-template-mapping-selection-batch-operation';
import { ToggleTemplateMappingSelectionOperation } from './toggle-template-mapping-selection-operation';

describe('template mapping selection operations', () => {
  it('toggles stable identities without duplicates and clears the complete selection', () => {
    const store = new TemplateUiStore();
    const toggle = new ToggleTemplateMappingSelectionOperation(store);
    const clear = new ClearTemplateMappingSelectionOperation(store);
    const id = { tokenKey: 'editor.foreground', tokenType: 'theme' as const };

    toggle.execute(id);
    expect(store.getStore().state.selectedMappingIds).toEqual([id]);
    toggle.execute(id);
    expect(store.getStore().state.selectedMappingIds).toEqual([]);
    toggle.execute(id);
    clear.execute();
    expect(store.getStore().state.selectedMappingIds).toEqual([]);
  });

  it('retains selection when search and assignment filters change', () => {
    const store = new TemplateUiStore();
    const id = { tokenKey: 'editor.foreground', tokenType: 'theme' as const };
    store.getStore().setSelectedMappingIds([id]);

    new SetTemplateMappingSearchTextOperation(store).execute('hidden');
    new SetTemplateMappingColorVariableFilterOperation(store).execute(['foreground']);
    new SetTemplateMappingContrastVariableFilterOperation(store).execute(['mainContrast']);

    expect(store.getStore().state.selectedMappingIds).toEqual([id]);
  });

  it('sets batch selection without duplicating existing identities', () => {
    const store = new TemplateUiStore();
    const batch = new SetTemplateMappingSelectionBatchOperation(store);
    const one = { tokenKey: 'one', tokenType: 'theme' as const };
    const two = { tokenKey: 'two', tokenType: 'textmate token' as const };

    store.getStore().setSelectedMappingIds([one]);
    batch.execute([one, two], true);
    expect(store.getStore().state.selectedMappingIds).toEqual([one, two]);

    batch.execute([one], false);
    expect(store.getStore().state.selectedMappingIds).toEqual([two]);
  });
});
