import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { MappingsCard } from './MappingsCard';
import type { Mapping, TokenType } from '../../model/schemas';

function mapping(
  key: string,
  type: TokenType,
  overrides: Partial<Mapping> = {},
): Mapping {
  return {
    token: { key, type },
    colorVariableRef: null,
    contrastVariableRef: null,
    groupRef: null,
    ...overrides,
  };
}

const defaultProps = {
  mappingsByType: {
    theme: [],
    'textmate token': [],
    'semantic token': [
      mapping('*', 'semantic token'),
      mapping('class', 'semantic token'),
      mapping('class.declaration', 'semantic token'),
    ],
  } as Record<TokenType, Mapping[]>,
  groups: [] as readonly string[],
  colorVariables: [] as readonly { key: string; groupRef: string | null }[],
  contrastVariables: [] as readonly { key: string; comparisonSourceRef: string | null; groupRef: string | null }[],
  orphanKeys: new Set<string>(),
  canEdit: true,
  semanticCatalog: {
    semanticTokenTypes: ['class', 'function'],
    semanticTokenModifiers: ['readonly', 'static', 'declaration'],
    semanticTokenLanguages: ['typescript'],
  },
  onUpdateGroupRef: vi.fn(),
  onUpdateColorRef: vi.fn(),
  onUpdateContrastRef: vi.fn(),
  onAddSemanticVariant: vi.fn(),
  onRemoveMapping: vi.fn(),
};

describe('MappingsCard semantic token UI', () => {
  it('shows each semantic type as a mapping row (not a section header)', () => {
    render(<MappingsCard {...defaultProps} />);

    // Expand Ungrouped group to see Semantic Tokens
    const ungroupedHeader = screen.getByRole('button', { name: /Ungrouped/i });
    expect(ungroupedHeader).toBeInTheDocument();
    // Semantic Tokens section is inside; types are rendered as rows with token name
    expect(screen.getByText('Semantic Tokens')).toBeInTheDocument();

    // Type names appear as token names in rows (not as tree headers)
    const classToken = screen.getByTitle('class');
    const starToken = screen.getByTitle('*');
    expect(classToken).toBeInTheDocument();
    expect(starToken).toBeInTheDocument();

    // "*" row appears (for modifiers that apply to all types)
    expect(starToken.closest('.mapping-row')).toBeInTheDocument();
  });

  it('shows * row first in Semantic Tokens section', () => {
    render(<MappingsCard {...defaultProps} />);

    const semanticSection = screen.getByText('Semantic Tokens').closest('.tree-section');
    expect(semanticSection).toBeInTheDocument();
    const tokenNames = semanticSection!.querySelectorAll('.mapping-token-name');
    const firstTokenText = tokenNames[0]?.getAttribute('title') ?? tokenNames[0]?.textContent ?? '';
    expect(firstTokenText).toBe('*');
  });

  it('shows plus button on the same row as the type mapping', () => {
    render(<MappingsCard {...defaultProps} />);

    const addButtons = screen.getAllByRole('button', { name: /Add variant/i });
    expect(addButtons.length).toBeGreaterThanOrEqual(1);

    // Plus should be inside a mapping row (same row as type)
    const classRow = screen.getByTitle('class').closest('.mapping-row');
    expect(classRow).toBeInTheDocument();
    const plusInClassRow = classRow!.querySelector('button[aria-label="Add variant"]');
    expect(plusInClassRow).toBeInTheDocument();
  });

  it('clicking plus shows add row with modifier multiselect dropdown', async () => {
    const user = userEvent.setup();
    render(<MappingsCard {...defaultProps} />);

    const plusButton = screen.getAllByRole('button', { name: /Add variant/i })[0];
    await user.click(plusButton);

    // Add row appears with Modifiers dropdown (not checkbox list)
    const modifiersButton = screen.getByRole('button', { name: /Select modifiers|Modifiers/i });
    expect(modifiersButton).toBeInTheDocument();
    const addFormButtons = screen.getAllByRole('button', { name: /^Add$/i });
    expect(addFormButtons.some((b) => b.textContent === 'Add')).toBe(true);
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
  });

  it('modifier dropdown allows multiselect', async () => {
    const user = userEvent.setup();
    render(<MappingsCard {...defaultProps} />);

    const plusButton = screen.getAllByRole('button', { name: /Add variant/i })[0];
    await user.click(plusButton);

    const modifiersButton = screen.getByRole('button', { name: /Select modifiers|Modifiers/i });
    await user.click(modifiersButton);

    // Dropdown opens with checkbox options
    const readonlyCheck = screen.getByRole('checkbox', { name: /readonly/i });
    const staticCheck = screen.getByRole('checkbox', { name: /static/i });
    expect(readonlyCheck).toBeInTheDocument();
    expect(staticCheck).toBeInTheDocument();

    await user.click(readonlyCheck);
    await user.click(staticCheck);
    expect(readonlyCheck).toBeChecked();
    expect(staticCheck).toBeChecked();
  });

  it('calls onAddSemanticVariant with selected modifiers when Add is clicked', async () => {
    const user = userEvent.setup();
    const onAddSemanticVariant = vi.fn();
    render(
      <MappingsCard
        {...defaultProps}
        onAddSemanticVariant={onAddSemanticVariant}
      />,
    );

    // Click plus on the class row so the callback is called with type 'class'
    const classRow = screen.getByTitle('class').closest('.mapping-row');
    const plusInClassRow = classRow!.querySelector('button[aria-label="Add variant"]');
    await user.click(plusInClassRow as HTMLButtonElement);

    const modifiersButton = screen.getByRole('button', { name: /Select modifiers|Modifiers/i });
    await user.click(modifiersButton);
    await user.click(screen.getByRole('checkbox', { name: /readonly/i }));
    await user.click(screen.getByRole('checkbox', { name: /static/i }));

    const addButton = screen.getAllByRole('button').find((b) => b.textContent === 'Add');
    expect(addButton).toBeTruthy();
    await user.click(addButton!);

    expect(onAddSemanticVariant).toHaveBeenCalledTimes(1);
    expect(onAddSemanticVariant).toHaveBeenCalledWith(
      'class',
      expect.arrayContaining(['readonly', 'static']),
      null,
    );
  });
});
