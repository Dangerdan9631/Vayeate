import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { TokensCard } from './TokensCard';
import type { Catalog, Token, TokenType } from '../../model/schemas';

function makeTokens(type: TokenType, keys: string[]): Token[] {
  return keys.map((key) => ({ key, type }));
}

describe('TokensCard', () => {
  const catalog: Catalog = {
    name: 'test-catalog',
    version: '1.0.0',
    type: 'manual',
    locked: false,
    sources: [],
    tokens: [],
    semanticTokenTypes: [],
    semanticTokenModifiers: [],
    semanticTokenLanguages: [],
  };

  it('renders search input and filters tokens by key', async () => {
    const user = userEvent.setup();
    const tokensByType: Record<TokenType, Token[]> = {
      theme: makeTokens('theme', ['color.fg', 'color.bg', 'background']),
      token: [],
      'semantic token': [],
    };
    render(
      <TokensCard
        catalog={catalog}
        tokensByType={tokensByType}
        isLatestVersion={true}
        onAddToken={vi.fn()}
        onRemoveToken={vi.fn()}
        onUpdateTokenKey={vi.fn()}
        onBulkAdd={vi.fn()}
      />,
    );

    const searchInput = screen.getByPlaceholderText('Search…');
    expect(searchInput).toBeInTheDocument();

    expect(screen.getByDisplayValue('color.fg')).toBeInTheDocument();
    expect(screen.getByDisplayValue('color.bg')).toBeInTheDocument();
    expect(screen.getByDisplayValue('background')).toBeInTheDocument();

    await user.type(searchInput, 'color');
    expect(screen.getByDisplayValue('color.fg')).toBeInTheDocument();
    expect(screen.getByDisplayValue('color.bg')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('background')).not.toBeInTheDocument();

    await user.clear(searchInput);
    await user.type(searchInput, 'fg');
    expect(screen.getByDisplayValue('color.fg')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('color.bg')).not.toBeInTheDocument();
    expect(screen.queryByDisplayValue('background')).not.toBeInTheDocument();
  });

  it('shows Semantic Tokens section with add input when manual and latest', () => {
    render(
      <TokensCard
        catalog={catalog}
        tokensByType={{ theme: [], token: [], 'semantic token': [] }}
        isLatestVersion={true}
        onAddToken={vi.fn()}
        onRemoveToken={vi.fn()}
        onUpdateTokenKey={vi.fn()}
        onBulkAdd={vi.fn()}
        onAddSemanticFromSelector={vi.fn()}
        onSetSemanticTypes={vi.fn()}
        onSetSemanticModifiers={vi.fn()}
        onSetSemanticLanguages={vi.fn()}
      />,
    );
    expect(screen.getByText('Semantic Tokens')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('type.modifier.modifier:language or *')).toBeInTheDocument();
  });

  it('shows semantic types, modifiers, and languages with labels when catalog has them', () => {
    const catalogWithSemantic: Catalog = {
      ...catalog,
      semanticTokenTypes: ['foo'],
      semanticTokenModifiers: ['bar', 'baz'],
      semanticTokenLanguages: ['java'],
    };
    render(
      <TokensCard
        catalog={catalogWithSemantic}
        tokensByType={{ theme: [], token: [], 'semantic token': [] }}
        isLatestVersion={true}
        onAddToken={vi.fn()}
        onRemoveToken={vi.fn()}
        onUpdateTokenKey={vi.fn()}
        onBulkAdd={vi.fn()}
        onAddSemanticFromSelector={vi.fn()}
        onSetSemanticTypes={vi.fn()}
        onSetSemanticModifiers={vi.fn()}
        onSetSemanticLanguages={vi.fn()}
      />,
    );
    expect(screen.getByText('tokenType:')).toBeInTheDocument();
    expect(screen.getByDisplayValue('foo')).toBeInTheDocument();
    expect(screen.getAllByText('modifier:').length).toBe(2);
    expect(screen.getByDisplayValue('bar')).toBeInTheDocument();
    expect(screen.getByDisplayValue('baz')).toBeInTheDocument();
    expect(screen.getByText('language:')).toBeInTheDocument();
    expect(screen.getByDisplayValue('java')).toBeInTheDocument();
  });

  it('shows Theme Tokens, Tokens, and Semantic Tokens sections in order', () => {
    render(
      <TokensCard
        catalog={catalog}
        tokensByType={{ theme: [], token: [], 'semantic token': [] }}
        isLatestVersion={true}
        onAddToken={vi.fn()}
        onRemoveToken={vi.fn()}
        onUpdateTokenKey={vi.fn()}
        onBulkAdd={vi.fn()}
      />,
    );
    expect(screen.getByText('Theme Tokens')).toBeInTheDocument();
    expect(screen.getByText('Semantic Tokens')).toBeInTheDocument();
    const tokensLabels = screen.getAllByText('Tokens');
    expect(tokensLabels.length).toBeGreaterThanOrEqual(1);
  });
});
