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
  beforeEach(() => {
    document.documentElement.removeAttribute('data-theme');
  });

  it('defaults to dark in standalone mode', () => {
    render(
      <ColorSchemeProvider>
        <TestConsumer />
      </ColorSchemeProvider>,
    );
    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('toggleColorScheme flips theme in standalone mode (no persistence)', async () => {
    render(
      <ColorSchemeProvider>
        <TestConsumer />
      </ColorSchemeProvider>,
    );
    expect(screen.getByTestId('theme')).toHaveTextContent('dark');

    await act(async () => {
      screen.getByRole('button', { name: 'Toggle' }).click();
    });
    expect(screen.getByTestId('theme')).toHaveTextContent('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');

    await act(async () => {
      screen.getByRole('button', { name: 'Toggle' }).click();
    });
    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('useColorScheme throws when used outside provider', () => {
    expect(() => render(<TestConsumer />)).toThrow(
      'useColorScheme must be used within ColorSchemeProvider',
    );
  });
});

