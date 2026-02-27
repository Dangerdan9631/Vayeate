import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { CatalogDetailsCard } from './CatalogDetailsCard';
import type { Catalog, Source, TokenType } from '../../model/schemas';

function makeProps(overrides: Partial<{
  catalog: Catalog;
  isLatestVersion: boolean;
  onUpdateSources: (sources: Source[]) => void;
  onSync: () => void;
}> = {}) {
  const tokenCounts: Record<TokenType, number> = { theme: 0, token: 0, 'semantic token': 0 };
  return {
    catalog: overrides.catalog ?? {
      name: 'test',
      version: '1.0.0',
      type: 'remote' as const,
      locked: false,
      sources: [],
      tokens: [],
    },
    tokenCounts,
    isLatestVersion: overrides.isLatestVersion ?? true,
    onDeleteVersion: vi.fn(),
    onLock: vi.fn(),
    onSync: overrides.onSync ?? vi.fn(),
    onUpdateSources: overrides.onUpdateSources ?? vi.fn(),
    onRevert: vi.fn(),
  };
}

describe('CatalogDetailsCard sources UI', () => {
  it('shows sources section for remote catalogs', () => {
    const props = makeProps();
    render(<CatalogDetailsCard {...props} />);
    expect(screen.getByText('Sources')).toBeInTheDocument();
  });

  it('hides sources section for manual catalogs', () => {
    const props = makeProps({
      catalog: {
        name: 'test',
        version: '1.0.0',
        type: 'manual',
        locked: false,
        sources: [],
        tokens: [],
      },
    });
    render(<CatalogDetailsCard {...props} />);
    expect(screen.queryByText('Sources')).not.toBeInTheDocument();
  });

  it('renders existing sources as rows', () => {
    const sources: Source[] = [
      { url: 'https://example.com/a', type: 'default', tokenType: 'theme' },
      { url: 'https://example.com/b', type: 'default', tokenType: 'token' },
    ];
    const props = makeProps({
      catalog: {
        name: 'test',
        version: '1.0.0',
        type: 'remote',
        locked: false,
        sources,
        tokens: [],
      },
    });
    render(<CatalogDetailsCard {...props} />);
    const urlInputs = screen.getAllByPlaceholderText('https://...');
    expect(urlInputs).toHaveLength(3); // 2 existing + 1 add row
  });

  it('calls onUpdateSources when add button clicked', async () => {
    const user = userEvent.setup();
    const onUpdateSources = vi.fn();
    const props = makeProps({ onUpdateSources });
    render(<CatalogDetailsCard {...props} />);

    const urlInput = screen.getByPlaceholderText('https://...');
    await user.type(urlInput, 'https://example.com/new');
    await user.click(screen.getByLabelText('Add source'));

    expect(onUpdateSources).toHaveBeenCalledWith([
      { url: 'https://example.com/new', type: 'default', tokenType: 'theme' },
    ]);
  });

  it('calls onUpdateSources when remove button clicked', async () => {
    const user = userEvent.setup();
    const onUpdateSources = vi.fn();
    const sources: Source[] = [
      { url: 'https://example.com/a', type: 'default', tokenType: 'theme' },
    ];
    const props = makeProps({
      onUpdateSources,
      catalog: {
        name: 'test',
        version: '1.0.0',
        type: 'remote',
        locked: false,
        sources,
        tokens: [],
      },
    });
    render(<CatalogDetailsCard {...props} />);

    await user.click(screen.getByLabelText('Remove source'));

    expect(onUpdateSources).toHaveBeenCalledWith([]);
  });

  it('shows Sync button for remote catalog at latest version', () => {
    const props = makeProps();
    render(<CatalogDetailsCard {...props} />);
    expect(screen.getByRole('button', { name: 'Sync' })).toBeInTheDocument();
  });

  it('disables source editing when not latest version', () => {
    const sources: Source[] = [
      { url: 'https://example.com/a', type: 'default', tokenType: 'theme' },
    ];
    const props = makeProps({
      isLatestVersion: false,
      catalog: {
        name: 'test',
        version: '1.0.0',
        type: 'remote',
        locked: false,
        sources,
        tokens: [],
      },
    });
    render(<CatalogDetailsCard {...props} />);

    const urlInputs = screen.getAllByPlaceholderText('https://...');
    expect(urlInputs).toHaveLength(1); // only existing, no add row
    expect(urlInputs[0]).toBeDisabled();
  });
});
