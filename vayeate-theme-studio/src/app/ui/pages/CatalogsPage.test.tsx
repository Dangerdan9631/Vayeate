import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppProvider } from '../context/AppContext';
import { CatalogsPage } from './CatalogsPage';
import type { Catalog } from '../../../model/schemas';

const mockCatalog: Catalog = {
  name: 'mock-catalog',
  version: '1.0.0',
  type: 'manual',
  locked: false,
  sources: [],
  tokens: [],
  semanticTokenTypes: [],
  semanticTokenModifiers: [],
  semanticTokenLanguages: [],
};

beforeEach(() => {
  (window as unknown as { electronAPI?: unknown }).electronAPI = {
    createCatalog: () => Promise.resolve(mockCatalog),
    saveCatalog: () => Promise.resolve(),
    loadCatalog: () => Promise.resolve(null),
    listCatalogs: () => Promise.resolve([]),
    deleteCatalog: () => Promise.resolve(),
    fetchUrl: () => Promise.resolve(''),
  };
});

afterEach(() => {
  delete (window as unknown as { electronAPI?: unknown }).electronAPI;
});

describe('CatalogsPage', () => {
  it('shows Create new catalog button', () => {
    render(
      <AppProvider>
        <CatalogsPage />
      </AppProvider>,
    );
    expect(screen.getByRole('button', { name: /create new catalog/i })).toBeInTheDocument();
  });

  it('opens create dialog when Create new catalog is clicked', async () => {
    const user = userEvent.setup();
    render(
      <AppProvider>
        <CatalogsPage />
      </AppProvider>,
    );

    await user.click(screen.getByRole('button', { name: /create new catalog/i }));
    expect(screen.getByText('Create New Catalog')).toBeInTheDocument();
  });

  it('shows catalog details after creating a catalog through dialog', async () => {
    (window as unknown as { electronAPI?: unknown }).electronAPI = {
      createCatalog: () => Promise.resolve(mockCatalog),
      saveCatalog: () => Promise.resolve(),
      loadCatalog: () => Promise.resolve(mockCatalog),
      listCatalogs: () => Promise.resolve([{ name: 'mock-catalog', version: '1.0.0' }]),
      deleteCatalog: () => Promise.resolve(),
      fetchUrl: () => Promise.resolve(''),
    };

    const user = userEvent.setup();
    render(
      <AppProvider>
        <CatalogsPage />
      </AppProvider>,
    );

    await user.click(screen.getByRole('button', { name: /create new catalog/i }));

    const nameInput = screen.getByPlaceholderText('my-catalog');
    await user.type(nameInput, 'mock-catalog');
    await user.click(screen.getByRole('button', { name: 'OK' }));

    const detailsHeading = await screen.findByText('Catalog Details', {}, { timeout: 3000 });
    expect(detailsHeading).toBeInTheDocument();
  });
});
