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
  const tokenCounts: Record<TokenType, number> = { theme: 0, 'textmate token': 0, 'semantic token': 0 };
  return {
    catalog: overrides.catalog ?? {
      name: 'test',
      version: '1.0.0',
      type: 'remote' as const,
      locked: false,
      sources: [],
      tokens: [],
      semanticTokenTypes: [],
      semanticTokenModifiers: [],
      semanticTokenLanguages: [],
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
        semanticTokenTypes: [],
        semanticTokenModifiers: [],
        semanticTokenLanguages: [],
      },
    });
    render(<CatalogDetailsCard {...props} />);
    expect(screen.queryByText('Sources')).not.toBeInTheDocument();
  });

  it('renders existing sources as rows', () => {
    const sources: Source[] = [
      { url: 'https://example.com/a', type: 'default', tokenType: 'theme' },
      { url: 'https://example.com/b', type: 'default', tokenType: 'textmate token' },
    ];
    const props = makeProps({
      catalog: {
        name: 'test',
        version: '1.0.0',
        type: 'remote',
        locked: false,
        sources,
        tokens: [],
        semanticTokenTypes: [],
        semanticTokenModifiers: [],
        semanticTokenLanguages: [],
      },
    });
    render(<CatalogDetailsCard {...props} />);
    const urlInputs = screen.getAllByPlaceholderText('https://...');
    expect(urlInputs).toHaveLength(3); // 2 existing + 1 add row
  });

  it('shows default, color-registry, and color-registry-set when token type is theme', () => {
    const sources: Source[] = [
      { url: 'https://example.com/a', type: 'default', tokenType: 'theme' },
    ];
    const props = makeProps({
      catalog: {
        name: 'test',
        version: '1.0.0',
        type: 'remote',
        locked: false,
        sources,
        tokens: [],
        semanticTokenTypes: [],
        semanticTokenModifiers: [],
        semanticTokenLanguages: [],
      },
    });
    render(<CatalogDetailsCard {...props} />);
    expect(screen.getAllByRole('option', { name: 'default' }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole('option', { name: 'color-registry' }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole('option', { name: 'color-registry-set' }).length).toBeGreaterThanOrEqual(1);
  });

  it('shows default and semantic-token-registry when token type is semantic token', () => {
    const sources: Source[] = [
      { url: 'https://example.com/a', type: 'default', tokenType: 'semantic token' },
    ];
    const props = makeProps({
      catalog: {
        name: 'test',
        version: '1.0.0',
        type: 'remote',
        locked: false,
        sources,
        tokens: [],
        semanticTokenTypes: [],
        semanticTokenModifiers: [],
        semanticTokenLanguages: [],
      },
    });
    render(<CatalogDetailsCard {...props} />);
    expect(screen.getAllByRole('option', { name: 'default' }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole('option', { name: 'semantic-token-registry' }).length).toBeGreaterThanOrEqual(1);
  });

  it('shows only semantic token as token type when source type is semantic-token-registry', () => {
    const sources: Source[] = [
      { url: 'https://example.com/tokenClassification.ts', type: 'semantic-token-registry', tokenType: 'semantic token' },
    ];
    const props = makeProps({
      catalog: {
        name: 'test',
        version: '1.0.0',
        type: 'remote',
        locked: false,
        sources,
        tokens: [],
        semanticTokenTypes: [],
        semanticTokenModifiers: [],
        semanticTokenLanguages: [],
      },
    });
    render(<CatalogDetailsCard {...props} />);
    const sourceTypeSelect = screen.getByDisplayValue('semantic-token-registry');
    const row = sourceTypeSelect.closest('.source-row');
    const tokenTypeSelect = row?.querySelectorAll('select')[0];
    const tokenTypeOptions = tokenTypeSelect?.querySelectorAll('option') ?? [];
    expect(tokenTypeOptions).toHaveLength(1);
    expect((tokenTypeOptions[0] as HTMLOptionElement).value).toBe('semantic token');
  });

  it('shows default, textmate-xml, and textmate-json when token type is textmate token', () => {
    const sources: Source[] = [
      { url: 'https://example.com/a', type: 'default', tokenType: 'textmate token' },
    ];
    const props = makeProps({
      catalog: {
        name: 'test',
        version: '1.0.0',
        type: 'remote',
        locked: false,
        sources,
        tokens: [],
        semanticTokenTypes: [],
        semanticTokenModifiers: [],
        semanticTokenLanguages: [],
      },
    });
    render(<CatalogDetailsCard {...props} />);
    expect(screen.getAllByRole('option', { name: 'default' }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole('option', { name: 'textmate-xml' }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole('option', { name: 'textmate-json' }).length).toBeGreaterThanOrEqual(1);
  });

  it('shows only textmate token as token type when source type is textmate-xml', () => {
    const sources: Source[] = [
      { url: 'https://example.com/JSON.tmLanguage', type: 'textmate-xml', tokenType: 'textmate token' },
    ];
    const props = makeProps({
      catalog: {
        name: 'test',
        version: '1.0.0',
        type: 'remote',
        locked: false,
        sources,
        tokens: [],
        semanticTokenTypes: [],
        semanticTokenModifiers: [],
        semanticTokenLanguages: [],
      },
    });
    render(<CatalogDetailsCard {...props} />);
    const sourceTypeSelect = screen.getByDisplayValue('textmate-xml');
    const row = sourceTypeSelect.closest('.source-row');
    const tokenTypeSelect = row?.querySelectorAll('select')[0];
    const tokenTypeOptions = tokenTypeSelect?.querySelectorAll('option') ?? [];
    expect(tokenTypeOptions).toHaveLength(1);
    expect((tokenTypeOptions[0] as HTMLOptionElement).value).toBe('textmate token');
  });

  it('shows only textmate token as token type when source type is textmate-json', () => {
    const sources: Source[] = [
      { url: 'https://example.com/rust.tmLanguage.json', type: 'textmate-json', tokenType: 'textmate token' },
    ];
    const props = makeProps({
      catalog: {
        name: 'test',
        version: '1.0.0',
        type: 'remote',
        locked: false,
        sources,
        tokens: [],
        semanticTokenTypes: [],
        semanticTokenModifiers: [],
        semanticTokenLanguages: [],
      },
    });
    render(<CatalogDetailsCard {...props} />);
    const sourceTypeSelect = screen.getByDisplayValue('textmate-json');
    const row = sourceTypeSelect.closest('.source-row');
    const tokenTypeSelect = row?.querySelectorAll('select')[0];
    const tokenTypeOptions = tokenTypeSelect?.querySelectorAll('option') ?? [];
    expect(tokenTypeOptions).toHaveLength(1);
    expect((tokenTypeOptions[0] as HTMLOptionElement).value).toBe('textmate token');
  });

  it('shows only theme as token type when source type is color-registry', () => {
    const sources: Source[] = [
      { url: 'https://example.com/colors.ts', type: 'color-registry', tokenType: 'theme' },
    ];
    const props = makeProps({
      catalog: {
        name: 'test',
        version: '1.0.0',
        type: 'remote',
        locked: false,
        sources,
        tokens: [],
        semanticTokenTypes: [],
        semanticTokenModifiers: [],
        semanticTokenLanguages: [],
      },
    });
    render(<CatalogDetailsCard {...props} />);
    const sourceTypeSelect = screen.getByDisplayValue('color-registry');
    const row = sourceTypeSelect.closest('.source-row');
    const tokenTypeSelect = row?.querySelectorAll('select')[0];
    const tokenTypeOptions = tokenTypeSelect?.querySelectorAll('option') ?? [];
    expect(tokenTypeOptions).toHaveLength(1);
    expect((tokenTypeOptions[0] as HTMLOptionElement).value).toBe('theme');
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

  it('calls onUpdateSources only on blur when editing source URL', async () => {
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
        semanticTokenTypes: [],
        semanticTokenModifiers: [],
        semanticTokenLanguages: [],
      },
    });
    render(<CatalogDetailsCard {...props} />);

    const urlInputs = screen.getAllByPlaceholderText('https://...');
    const existingSourceInput = urlInputs[0];
    await user.clear(existingSourceInput);
    expect(onUpdateSources).not.toHaveBeenCalled();
    await user.type(existingSourceInput, 'https://example.com/updated');
    expect(onUpdateSources).not.toHaveBeenCalled();
    await user.tab();

    expect(onUpdateSources).toHaveBeenCalledTimes(1);
    expect(onUpdateSources).toHaveBeenCalledWith([
      { url: 'https://example.com/updated', type: 'default', tokenType: 'theme' },
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
        semanticTokenTypes: [],
        semanticTokenModifiers: [],
        semanticTokenLanguages: [],
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
        semanticTokenTypes: [],
        semanticTokenModifiers: [],
        semanticTokenLanguages: [],
      },
    });
    render(<CatalogDetailsCard {...props} />);

    const urlInputs = screen.getAllByPlaceholderText('https://...');
    expect(urlInputs).toHaveLength(1); // only existing, no add row
    expect(urlInputs[0]).toBeDisabled();
  });
});
