import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ThemeVariablesCard } from './ThemeVariablesCard';
import type {
  ColorAssignment,
  ColorVariable,
  ContrastAssignment,
  ContrastVariable,
} from '../../model/schemas';

const colorAssignments: ColorAssignment[] = [
  { colorRef: 'primary', dark: { value: '#ff0000' }, light: { value: '#cc0000' }, useDarkForLight: false },
];

const contrastAssignments: ContrastAssignment[] = [
  {
    contrastVariableRef: 'textContrast',
    dark: { value: 4.5, comparisonMethod: 'greaterThan' as const, min: null, max: null },
    light: null,
    useDarkForLight: true,
  },
];

const colorVariables: ColorVariable[] = [{ key: 'primary', groupRef: null }];
const contrastVariables: ContrastVariable[] = [
  { key: 'textContrast', comparisonSourceRef: 'primary', groupRef: null },
];

function makeProps(overrides: {
  checkedColorRefs?: Set<string>;
  checkedContrastRefs?: Set<string>;
  colorSectionState?: 'all' | 'none' | 'some';
  contrastSectionState?: 'all' | 'none' | 'some';
  cardState?: 'all' | 'none' | 'some';
} = {}) {
  return {
    colorAssignments,
    contrastAssignments,
    colorVariables,
    contrastVariables,
    groups: [] as readonly string[],
    orphanColorKeys: new Set<string>(),
    orphanContrastKeys: new Set<string>(),
    checkedColorRefs: overrides.checkedColorRefs ?? new Set(['primary']),
    checkedContrastRefs: overrides.checkedContrastRefs ?? new Set(['textContrast']),
    onToggleColorChecked: vi.fn(),
    onToggleContrastChecked: vi.fn(),
    onSetAllColorChecked: vi.fn(),
    onSetAllContrastChecked: vi.fn(),
    onSetAllVariablesChecked: vi.fn(),
    onSetColorGroupChecked: vi.fn(),
    onSetContrastGroupChecked: vi.fn(),
    colorSectionState: overrides.colorSectionState ?? 'all',
    contrastSectionState: overrides.contrastSectionState ?? 'all',
    cardState: overrides.cardState ?? 'all',
    onUpdateColorDark: vi.fn(),
    onUpdateColorLight: vi.fn(),
    onUpdateColorUseDark: vi.fn(),
    onUpdateContrastDark: vi.fn(),
    onUpdateContrastLight: vi.fn(),
    onUpdateContrastUseDark: vi.fn(),
  };
}

describe('ThemeVariablesCard', () => {
  it('renders Variables heading and select-all checkbox', () => {
    render(<ThemeVariablesCard {...makeProps()} />);
    expect(screen.getByRole('heading', { name: 'Variables' })).toBeInTheDocument();
    expect(
      screen.getByRole('checkbox', { name: 'Select all variables for palette adjustments' }),
    ).toBeInTheDocument();
  });

  it('renders section checkboxes for Color Variables and Contrast Variables', () => {
    render(<ThemeVariablesCard {...makeProps()} />);
    expect(
      screen.getByRole('checkbox', { name: 'Select all color variables' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('checkbox', { name: 'Select all contrast variables' }),
    ).toBeInTheDocument();
  });

  it('renders variable row checkboxes', () => {
    render(<ThemeVariablesCard {...makeProps()} />);
    expect(
      screen.getByRole('checkbox', { name: /Include primary in palette adjustments/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('checkbox', { name: /Include textContrast in palette adjustments/i }),
    ).toBeInTheDocument();
  });

  it('card checkbox is checked when cardState is all', () => {
    render(<ThemeVariablesCard {...makeProps({ cardState: 'all' })} />);
    const cardCheckbox = screen.getByRole('checkbox', {
      name: 'Select all variables for palette adjustments',
    });
    expect(cardCheckbox).toBeChecked();
  });

  it('card checkbox is unchecked when cardState is none', () => {
    render(<ThemeVariablesCard {...makeProps({ cardState: 'none' })} />);
    const cardCheckbox = screen.getByRole('checkbox', {
      name: 'Select all variables for palette adjustments',
    });
    expect(cardCheckbox).not.toBeChecked();
  });

  it('calls onToggleColorChecked when color variable checkbox is clicked', async () => {
    const user = userEvent.setup();
    const onToggleColorChecked = vi.fn();
    render(
      <ThemeVariablesCard
        {...makeProps()}
        onToggleColorChecked={onToggleColorChecked}
      />,
    );
    await user.click(
      screen.getByRole('checkbox', { name: /Include primary in palette adjustments/i }),
    );
    expect(onToggleColorChecked).toHaveBeenCalledWith('primary');
  });

  it('calls onSetAllVariablesChecked when card checkbox is clicked and state is some', async () => {
    const user = userEvent.setup();
    const onSetAllVariablesChecked = vi.fn();
    render(
      <ThemeVariablesCard
        {...makeProps({ cardState: 'some' })}
        onSetAllVariablesChecked={onSetAllVariablesChecked}
      />,
    );
    await user.click(
      screen.getByRole('checkbox', { name: 'Select all variables for palette adjustments' }),
    );
    expect(onSetAllVariablesChecked).toHaveBeenCalledWith(true);
  });

  it('renders group subsection checkboxes for Color and Contrast', () => {
    render(<ThemeVariablesCard {...makeProps()} />);
    const groupCheckboxes = screen.getAllByRole('checkbox', { name: 'Select all in group: Ungrouped' });
    expect(groupCheckboxes).toHaveLength(2);
  });

  it('calls onSetColorGroupChecked when color group checkbox is clicked', async () => {
    const user = userEvent.setup();
    const onSetColorGroupChecked = vi.fn();
    render(
      <ThemeVariablesCard
        {...makeProps()}
        onSetColorGroupChecked={onSetColorGroupChecked}
      />,
    );
    const colorGroupCheckboxes = screen.getAllByRole('checkbox', { name: 'Select all in group: Ungrouped' });
    await user.click(colorGroupCheckboxes[0]);
    expect(onSetColorGroupChecked).toHaveBeenCalledWith('__ungrouped__', expect.any(Boolean));
  });

  it('calls onSetContrastGroupChecked when contrast group checkbox is clicked', async () => {
    const user = userEvent.setup();
    const onSetContrastGroupChecked = vi.fn();
    render(
      <ThemeVariablesCard
        {...makeProps()}
        onSetContrastGroupChecked={onSetContrastGroupChecked}
      />,
    );
    const groupCheckboxes = screen.getAllByRole('checkbox', { name: 'Select all in group: Ungrouped' });
    await user.click(groupCheckboxes[1]);
    expect(onSetContrastGroupChecked).toHaveBeenCalledWith('__ungrouped__', expect.any(Boolean));
  });
});
