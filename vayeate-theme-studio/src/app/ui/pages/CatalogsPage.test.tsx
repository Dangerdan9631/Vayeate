import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppProvider } from '../context/AppContext';
import { CatalogsPage } from './CatalogsPage';
import type { Catalog } from '../../../model/schemas';
import { createInMemoryFsElectronApi, seedCatalogFile } from '../../../test-utils/electron-api-in-memory-fs';

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
  const api = createInMemoryFsElectronApi();
  (window as unknown as { electronAPI?: unknown }).electronAPI = {
    ...api,
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
    const api = createInMemoryFsElectronApi();
    seedCatalogFile(api.files, mockCatalog);
    (window as unknown as { electronAPI?: unknown }).electronAPI = {
      ...api,
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
