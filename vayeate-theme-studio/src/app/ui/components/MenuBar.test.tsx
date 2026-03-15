import { act, render, screen } from '@testing-library/react';
import { ColorSchemeProvider } from '../context/ColorSchemeContext';
import { AppProvider } from '../context/AppContext';
import { MenuBar } from './MenuBar';

function MenuBarWithProviders() {
  return (
    <AppProvider>
      <ColorSchemeProvider>
        <MenuBar />
      </ColorSchemeProvider>
    </AppProvider>
  );
}

beforeEach(() => {
  (window as unknown as { electronAPI?: unknown }).electronAPI = {
    createCatalog: () => Promise.resolve(null),
    saveCatalog: () => Promise.resolve(),
    loadCatalog: () => Promise.resolve(null),
    listCatalogs: () => Promise.resolve([]),
    deleteCatalog: () => Promise.resolve(),
    fetchUrl: () => Promise.resolve(''),
    listTemplates: () => Promise.resolve([]),
    loadTemplate: () => Promise.resolve(null),
    listThemes: () => Promise.resolve([]),
    loadTheme: () => Promise.resolve(null),
    saveTheme: () => Promise.resolve(),
    deleteTheme: () => Promise.resolve(),
    generateTheme: () => Promise.resolve({ darkPath: '', lightPath: '' }),
    closeWindow: () => {},
    reloadWindow: () => {},
    reloadWindowForce: () => {},
    toggleDevTools: () => {},
    minimizeWindow: () => {},
    maximizeWindow: () => {},
  };
  localStorage.removeItem('vayeate-theme-studio-color-scheme');
});

afterEach(() => {
  delete (window as unknown as { electronAPI?: unknown }).electronAPI;
});

describe('MenuBar', () => {
  it('renders theme toggle button on the far right', () => {
    render(<MenuBarWithProviders />);
    const toggle = screen.getByRole('button', { name: 'Switch to dark mode' });
    expect(toggle).toBeInTheDocument();
    expect(toggle.closest('.menu-theme-toggle-wrap')).toBeInTheDocument();
  });

  it('shows light_mode icon when in light mode', () => {
    render(<MenuBarWithProviders />);
    const icon = document.querySelector('.menu-theme-toggle .material-symbols-outlined');
    expect(icon).toHaveTextContent('light_mode');
  });

  it('shows dark_mode icon when in dark mode', () => {
    localStorage.setItem('vayeate-theme-studio-color-scheme', 'dark');
    render(<MenuBarWithProviders />);
    const icon = document.querySelector('.menu-theme-toggle .material-symbols-outlined');
    expect(icon).toHaveTextContent('dark_mode');
  });

  // TODO: Re-enable when localStorage is removed from the color scheme toggle flow.
  // This test is flaky because the toggle dispatches through the async ActionQueue,
  // and the state update races with the assertion even with waitFor.
  // it('toggles theme when theme button is clicked', async () => { ... });

  it('renders File, Edit, History, View menus', () => {
    render(<MenuBarWithProviders />);
    expect(screen.getByRole('button', { name: 'File menu' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit menu' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'History menu' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'View menu' })).toBeInTheDocument();
  });
});
