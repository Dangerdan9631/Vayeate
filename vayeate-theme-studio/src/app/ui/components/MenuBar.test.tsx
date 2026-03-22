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
    fsCreateFile: () => Promise.resolve(),
    fsSaveFile: () => Promise.resolve(),
    fsLoadFile: () => Promise.resolve(null),
    fsDeleteFile: () => Promise.resolve(),
    fsListFiles: () => Promise.resolve([]),
    fetchUrl: () => Promise.resolve(''),
    closeWindow: () => {},
    reloadWindow: () => {},
    reloadWindowForce: () => {},
    toggleDevTools: () => {},
    minimizeWindow: () => {},
    maximizeWindow: () => {},
  };
  delete (window as unknown as { electronInitialColorScheme?: unknown }).electronInitialColorScheme;
});

afterEach(() => {
  delete (window as unknown as { electronAPI?: unknown }).electronAPI;
  delete (window as unknown as { electronInitialColorScheme?: unknown }).electronInitialColorScheme;
});

describe('MenuBar', () => {
  it('renders theme toggle button on the far right', () => {
    render(<MenuBarWithProviders />);
    const toggle = screen.getByRole('button', { name: 'Switch to light mode' });
    expect(toggle).toBeInTheDocument();
    expect(toggle.closest('.menu-theme-toggle-wrap')).toBeInTheDocument();
  });

  it('shows dark_mode icon by default (dark is the default)', () => {
    render(<MenuBarWithProviders />);
    const icon = document.querySelector('.menu-theme-toggle .material-symbols-outlined');
    expect(icon).toHaveTextContent('dark_mode');
  });

  it('shows light_mode icon when config is light', () => {
    (window as unknown as { electronInitialColorScheme?: unknown }).electronInitialColorScheme = 'light';
    render(<MenuBarWithProviders />);
    const icon = document.querySelector('.menu-theme-toggle .material-symbols-outlined');
    expect(icon).toHaveTextContent('light_mode');
  });

  it('toggles theme when theme button is clicked', async () => {
    render(<MenuBarWithProviders />);
    const toggle = screen.getByRole('button', { name: 'Switch to light mode' });
    expect(document.querySelector('.menu-theme-toggle .material-symbols-outlined')).toHaveTextContent('dark_mode');

    await act(async () => {
      toggle.click();
    });
    expect(document.querySelector('.menu-theme-toggle .material-symbols-outlined')).toHaveTextContent('light_mode');
    expect(screen.getByRole('button', { name: 'Switch to dark mode' })).toBeInTheDocument();

    await act(async () => {
      screen.getByRole('button', { name: 'Switch to dark mode' }).click();
    });
    expect(document.querySelector('.menu-theme-toggle .material-symbols-outlined')).toHaveTextContent('dark_mode');
  });

  it('renders File, Edit, History, View menus', () => {
    render(<MenuBarWithProviders />);
    expect(screen.getByRole('button', { name: 'File menu' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit menu' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'History menu' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'View menu' })).toBeInTheDocument();
  });
});
