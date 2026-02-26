import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppProvider } from '../context/AppContext';
import { CatalogsPage } from './CatalogsPage';
import type { Catalog } from '../../model/schemas';

const mockCatalog: Catalog = {
  name: 'mock-catalog',
  version: '1.0.0',
  type: 'manual',
  locked: false,
  sources: [],
  tokens: [],
};

beforeEach(() => {
  (window as unknown as { electronAPI?: unknown }).electronAPI = {
    createCatalog: () => Promise.resolve(mockCatalog),
    saveCatalog: () => Promise.resolve(),
    loadCatalog: () => Promise.resolve(null),
    listCatalogs: () => Promise.resolve([]),
  };
});

afterEach(() => {
  delete (window as unknown as { electronAPI?: unknown }).electronAPI;
});

describe('CatalogsPage', () => {
  it('shows Create Catalog button when no catalog exists', () => {
    render(
      <AppProvider>
        <CatalogsPage />
      </AppProvider>
    );
    expect(screen.getByRole('button', { name: /create catalog/i })).toBeInTheDocument();
  });

  it('shows catalog JSON in textarea after Create Catalog is clicked', async () => {
    const user = userEvent.setup();
    render(
      <AppProvider>
        <CatalogsPage />
      </AppProvider>
    );

    await user.click(screen.getByRole('button', { name: /create catalog/i }));

    const textarea = await screen.findByRole('textbox');
    expect(textarea).toHaveClass('catalog-json-view');
    expect((textarea as HTMLTextAreaElement).value).toContain('mock-catalog');
  });

  it('replaces button with textarea after creation', async () => {
    const user = userEvent.setup();
    render(
      <AppProvider>
        <CatalogsPage />
      </AppProvider>
    );

    expect(screen.getByRole('button', { name: /create catalog/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /create catalog/i }));

    await screen.findByRole('textbox');
    expect(screen.queryByRole('button', { name: /create catalog/i })).not.toBeInTheDocument();
  });
});
