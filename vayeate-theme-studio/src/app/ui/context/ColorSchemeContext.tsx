import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { AppContext } from './AppContext';
import { AppDispatchContext } from './slice-contexts';

export type ColorScheme = 'light' | 'dark';

function applyTheme(theme: ColorScheme) {
  document.documentElement.setAttribute('data-theme', theme);
}

interface ColorSchemeContextValue {
  theme: ColorScheme;
  toggleColorScheme: () => void;
}

const ColorSchemeContext = createContext<ColorSchemeContextValue | null>(null);

export function ColorSchemeProvider({ children }: { children: ReactNode }) {
  const appCtx = useContext(AppContext);
  const dispatch = useContext(AppDispatchContext);

  // Local state is only used when AppContext is not available (e.g., in unit tests).
  const [localScheme, setLocalScheme] = useState<ColorScheme>('light');

  const scheme: ColorScheme = appCtx ? appCtx.state.ui.colorScheme : localScheme;

  useEffect(() => {
    applyTheme(scheme);
  }, [scheme]);

  const toggleColorScheme = useCallback(() => {
    if (dispatch) {
      // In the full app: dispatch the action; the handler updates UiState + persists to disk.
      dispatch({ type: 'APP_BAR_THEME_CHECKBOX_ON_TOGGLE', checked: scheme !== 'light' });
    } else {
      // Standalone (no AppContext/dispatch) – update local state and apply theme directly (no persistence).
      setLocalScheme((prev) => {
        const next = prev === 'light' ? 'dark' : 'light';
        applyTheme(next);
        return next;
      });
    }
  }, [dispatch, scheme]);

  return (
    <ColorSchemeContext.Provider value={{ theme: scheme, toggleColorScheme }}>
      {children}
    </ColorSchemeContext.Provider>
  );
}

export function useColorScheme(): ColorSchemeContextValue {
  const value = useContext(ColorSchemeContext);
  if (!value) {
    throw new Error('useColorScheme must be used within ColorSchemeProvider');
  }
  return value;
}
