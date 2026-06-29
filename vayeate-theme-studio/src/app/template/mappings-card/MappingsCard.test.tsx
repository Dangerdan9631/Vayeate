import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mapping, Template } from '../../../model/schema/template-schemas';
import { MappingsCard } from './MappingsCard';
import { useMappingsCardViewModel } from './use-mappings-card-viewmodel';

vi.mock('./use-mappings-card-viewmodel', () => ({
  useMappingsCardViewModel: vi.fn(),
}));

const mapping: Mapping = {
  token: { key: 'editor.foreground', type: 'theme' },
  groupRef: null,
  colorVariableRef: null,
  contrastVariableRef: null,
};

const template: Template = {
  name: 'test-template',
  version: '1.0.0',
  locked: false,
  catalogRefs: [],
  mappings: [mapping],
  groups: ['base'],
  colorVariables: [{ key: 'foreground', groupRef: null }],
  contrastVariables: [{ key: 'mainContrast', comparisonSourceRef: 'foreground', groupRef: null }],
  semanticTokenModifiers: [],
  semanticTokenLanguages: [],
};

function createViewModel(selected: boolean) {
  const toggleMappingSelection = vi.fn();
  const clearMappingSelection = vi.fn();
  const applySelectedMappingAssignment = vi.fn();
  return {
    value: {
      template,
      mappingsByType: { theme: [mapping], 'textmate token': [], 'semantic token': [] },
      mappingsByGroup: new Map([
        ['__ungrouped__', { theme: [mapping], 'textmate token': [], 'semantic token': [] }],
      ]),
      groupKeysInOrder: ['__ungrouped__'],
      sortedGroups: ['base'],
      sortedColorVariables: [...template.colorVariables],
      sortedContrastVariables: [...template.contrastVariables],
      sortedSemanticTokenModifiers: [],
      sortedSemanticTokenLanguages: [],
      orphanKeys: new Set<string>(),
      canEdit: true,
      mappingSearchText: '',
      mappingColorVariableFilter: [],
      mappingContrastVariableFilter: [],
      selectedMappingIds: selected
        ? [{ tokenKey: mapping.token.key, tokenType: mapping.token.type }]
        : [],
      selectedVisibleMappingIds: selected
        ? [{ tokenKey: mapping.token.key, tokenType: mapping.token.type }]
        : [],
      selectedMappingKeys: new Set(selected ? ['theme::editor.foreground'] : []),
      groupSelectionStates: new Map([
        ['__ungrouped__', selected ? 'all' as const : 'none' as const],
      ]),
      onUpdateGroupRef: vi.fn(),
      onUpdateColorRef: vi.fn(),
      onUpdateContrastRef: vi.fn(),
      semanticVariant: undefined,
      onRemoveMapping: vi.fn(),
      setMappingSearchText: vi.fn(),
      setMappingColorVariableFilter: vi.fn(),
      setMappingContrastVariableFilter: vi.fn(),
      toggleMappingSelection,
      setMappingGroupSelection: vi.fn(),
      clearMappingSelection,
      applySelectedMappingAssignment,
    },
    toggleMappingSelection,
    clearMappingSelection,
    applySelectedMappingAssignment,
  };
}

describe('MappingsCard multi-selection', () => {
  beforeEach(() => {
    vi.mocked(useMappingsCardViewModel).mockReset();
  });

  it('selects a real editable mapping by stable identity', async () => {
    const vm = createViewModel(false);
    vi.mocked(useMappingsCardViewModel).mockReturnValue(vm.value);
    const view = render(<MappingsCard />);

    await userEvent.click(view.getByRole('checkbox', { name: 'Select mapping editor.foreground' }));

    expect(vm.toggleMappingSelection).toHaveBeenCalledWith({
      tokenKey: 'editor.foreground',
      tokenType: 'theme',
    });
    expect(view.queryByLabelText('Bulk mapping assignments')).not.toBeInTheDocument();
  });

  it('sets group selection from the heading checkbox', async () => {
    const vm = createViewModel(false);
    vi.mocked(useMappingsCardViewModel).mockReturnValue(vm.value);
    const view = render(<MappingsCard />);

    await userEvent.click(view.getByRole('checkbox', { name: 'Select mappings in Ungrouped' }));

    expect(vm.value.setMappingGroupSelection).toHaveBeenCalledWith(null, true);
  });

  it('applies each supported assignment to the selected set and clears selection', async () => {
    const vm = createViewModel(true);
    vi.mocked(useMappingsCardViewModel).mockReturnValue(vm.value);
    const view = render(<MappingsCard />);

    expect(view.getByText('1 selected')).toBeInTheDocument();
    await userEvent.selectOptions(view.getByLabelText('Assign group to selected mappings'), 'base');
    await userEvent.selectOptions(view.getByLabelText('Assign color variable to selected mappings'), 'foreground');
    await userEvent.selectOptions(view.getByLabelText('Assign contrast variable to selected mappings'), 'mainContrast');
    await userEvent.selectOptions(view.getByLabelText('Assign color variable to selected mappings'), '__clear_assignment__');
    await userEvent.click(view.getByRole('button', { name: 'Clear selection' }));

    expect(vm.applySelectedMappingAssignment).toHaveBeenNthCalledWith(1, { kind: 'group', value: 'base' });
    expect(vm.applySelectedMappingAssignment).toHaveBeenNthCalledWith(2, { kind: 'color', value: 'foreground' });
    expect(vm.applySelectedMappingAssignment).toHaveBeenNthCalledWith(3, { kind: 'contrast', value: 'mainContrast' });
    expect(vm.applySelectedMappingAssignment).toHaveBeenNthCalledWith(4, { kind: 'color', value: null });
    expect(vm.clearMappingSelection).toHaveBeenCalledOnce();
  });
});
