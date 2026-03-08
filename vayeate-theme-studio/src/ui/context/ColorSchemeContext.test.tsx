import { act, render, screen } from '@testing-library/react';
import { ColorSchemeProvider, useColorScheme } from './ColorSchemeContext';

function TestConsumer() {
  const { theme, toggleColorScheme } = useColorScheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <button type="button" onClick={toggleColorScheme}>
        Toggle
      </button>
    </div>
  );
}

describe('ColorSchemeContext', () => {
  const getStored = () => localStorage.getItem('vayeate-theme-studio-color-scheme');
  const setStored = (v: string) => localStorage.setItem('vayeate-theme-studio-color-scheme', v);

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('defaults to light when localStorage is empty', () => {
    render(
      <ColorSchemeProvider>
        <TestConsumer />
      </ColorSchemeProvider>,
    );
    expect(screen.getByTestId('theme')).toHaveTextContent('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('initializes from localStorage when value is dark', () => {
    setStored('dark');
    render(
      <ColorSchemeProvider>
        <TestConsumer />
      </ColorSchemeProvider>,
    );
    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('initializes to light when localStorage has invalid value', () => {
    setStored('invalid');
    render(
      <ColorSchemeProvider>
        <TestConsumer />
      </ColorSchemeProvider>,
    );
    expect(screen.getByTestId('theme')).toHaveTextContent('light');
  });

  it('toggleColorScheme flips theme and persists to localStorage', async () => {
    render(
      <ColorSchemeProvider>
        <TestConsumer />
      </ColorSchemeProvider>,
    );
    expect(screen.getByTestId('theme')).toHaveTextContent('light');
    expect(getStored()).toBeNull();

    await act(async () => {
      screen.getByRole('button', { name: 'Toggle' }).click();
    });
    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    expect(getStored()).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

    await act(async () => {
      screen.getByRole('button', { name: 'Toggle' }).click();
    });
    expect(screen.getByTestId('theme')).toHaveTextContent('light');
    expect(getStored()).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('useColorScheme throws when used outside provider', () => {
    expect(() => render(<TestConsumer />)).toThrow(
      'useColorScheme must be used within ColorSchemeProvider',
    );
  });
});
