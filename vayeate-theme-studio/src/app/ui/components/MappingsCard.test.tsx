import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MappingsCard } from './MappingsCard';
import type { Mapping, TokenType } from '../../../model/schemas';

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
    'semantic token': [],
  } as Record<TokenType, Mapping[]>,
  groups: [] as readonly string[],
  colorVariables: [] as readonly { key: string; groupRef: string | null }[],
  contrastVariables: [] as readonly { key: string; comparisonSourceRef: string | null; groupRef: string | null }[],
  orphanKeys: new Set<string>(),
  canEdit: true,
  onUpdateGroupRef: vi.fn(),
  onUpdateColorRef: vi.fn(),
  onUpdateContrastRef: vi.fn(),
};

describe('MappingsCard', () => {
  it('renders Mappings header and search', () => {
    render(<MappingsCard {...defaultProps} />);
    expect(screen.getByRole('heading', { name: /Mappings/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search/i)).toBeInTheDocument();
  });

  it('shows theme and textmate token sections when mappings exist', () => {
    render(
      <MappingsCard
        {...defaultProps}
        mappingsByType={{
          theme: [mapping('editor.background', 'theme')],
          'textmate token': [mapping('comment', 'textmate token')],
          'semantic token': [],
        }}
      />,
    );
    expect(screen.getByText('Theme Tokens')).toBeInTheDocument();
    expect(screen.getByText('Textmate Tokens')).toBeInTheDocument();
    expect(screen.getByTitle('editor.background')).toBeInTheDocument();
    expect(screen.getByTitle('comment')).toBeInTheDocument();
  });

  it('shows Semantic Tokens section when semantic token mappings exist', () => {
    render(
      <MappingsCard
        {...defaultProps}
        mappingsByType={{
          theme: [],
          'textmate token': [],
          'semantic token': [
            mapping('class', 'semantic token'),
            mapping('function', 'semantic token'),
          ],
        }}
      />,
    );
    expect(screen.getByText('Semantic Tokens')).toBeInTheDocument();
    expect(screen.getByTitle('class')).toBeInTheDocument();
    expect(screen.getByTitle('function')).toBeInTheDocument();
  });

  it('shows Add variant button and variant rows when semanticVariant is provided', async () => {
    const onAdd = vi.fn();
    const onUpdateKey = vi.fn();
    render(
      <MappingsCard
        {...defaultProps}
        mappingsByType={{
          theme: [],
          'textmate token': [],
          'semantic token': [
            mapping('class', 'semantic token'),
            mapping('class.readonly', 'semantic token'),
          ],
        }}
        semanticVariant={{
          semanticTokenModifiers: ['readonly', 'static'],
          semanticTokenLanguages: ['typescript'],
          onAddSemanticVariant: onAdd,
          onUpdateSemanticVariantKey: onUpdateKey,
        }}
      />,
    );
    expect(screen.getByText('Semantic Tokens')).toBeInTheDocument();
    expect(screen.getByTitle('class')).toBeInTheDocument();
    const addButtons = screen.getAllByRole('button', { name: /add semantic token variant/i });
    expect(addButtons.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole('button', { name: /modifiers/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /language/i })).toBeInTheDocument();
  });

  it('shows virtual * block when semanticVariant is provided even with no semantic token mappings', () => {
    render(
      <MappingsCard
        {...defaultProps}
        mappingsByType={{
          theme: [],
          'textmate token': [],
          'semantic token': [],
        }}
        semanticVariant={{
          semanticTokenModifiers: [],
          semanticTokenLanguages: [],
          onAddSemanticVariant: vi.fn(),
          onUpdateSemanticVariantKey: vi.fn(),
        }}
      />,
    );
    expect(screen.getByText('Semantic Tokens')).toBeInTheDocument();
    expect(screen.getByTitle('*')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add semantic token variant/i })).toBeInTheDocument();
  });

  it('shows group dropdown for * variants (e.g. *.readonly)', () => {
    render(
      <MappingsCard
        {...defaultProps}
        mappingsByType={{
          theme: [],
          'textmate token': [],
          'semantic token': [
            mapping('*.readonly', 'semantic token', { groupRef: 'g1' }),
          ],
        }}
        groups={['g1', 'g2']}
        semanticVariant={{
          semanticTokenModifiers: ['readonly'],
          semanticTokenLanguages: [],
          onAddSemanticVariant: vi.fn(),
          onUpdateSemanticVariantKey: vi.fn(),
        }}
      />,
    );
    expect(screen.getAllByTitle('*').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByTitle('*.readonly')).toBeInTheDocument();
    const groupSelects = screen.getAllByTitle('Group');
    expect(groupSelects.length).toBeGreaterThanOrEqual(1);
    const variantWrapper = document.querySelector('.mapping-variant-wrapper');
    expect(variantWrapper).toBeInTheDocument();
    const groupSelectInVariant = variantWrapper?.querySelector('select[title="Group"]');
    expect(groupSelectInVariant).toBeInTheDocument();
  });
});
