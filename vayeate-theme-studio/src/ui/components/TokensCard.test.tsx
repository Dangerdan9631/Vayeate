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
});
