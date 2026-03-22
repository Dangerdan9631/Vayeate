import { useState } from 'react';
import { act, render, screen } from '@testing-library/react';
import { AppProvider } from '../context/AppContext';
import { useAppState } from '../context/useAppState';
import { ContentArea } from './ContentArea';
import type { Theme } from '../../../model/schemas';
import type { TabId } from '../tabs';
import { ThemeActionType } from '../../actions/action-types';
import { createInMemoryFsElectronApi, seedThemeFile } from '../../../test-utils/electron-api-in-memory-fs';

const mockTheme: Theme = {
  name: 'test-theme',
  version: '1.0.0',
  templateRef: null,
  idePrimaryTokenRef: null,
  ideForegroundTokenRef: null,
  themeBackgroundTokenRef: null,
  themeForegroundTokenRef: null,
  lineNumberBackgroundTokenRef: null,
  lineNumberForegroundTokenRef: null,
  ideTabTokenRef: null,
  ideTabBarBackgroundTokenRef: null,
  ideTabBarForegroundTokenRef: null,
  editorPreviewScrollbarBackgroundTokenRef: null,
  editorPreviewScrollbarForegroundTokenRef: null,
  editorPreviewSelectionBackgroundTokenRef: null,
  editorPreviewMenuForegroundTokenRef: null,
  editorPreviewMenuBackgroundTokenRef: null,
  colorAssignments: [],
  contrastAssignments: [],
  applyPaletteToDark: true,
  applyPaletteToLight: true,
  paletteClusterCountK: 5,
  paletteClusterGroupIds: [],
};

beforeEach(() => {
  const api = createInMemoryFsElectronApi();
  seedThemeFile(api.files, mockTheme);
  (window as unknown as { electronAPI?: unknown }).electronAPI = {
    ...api,
    fetchUrl: () => Promise.resolve(''),
  };
});

afterEach(() => {
  delete (window as unknown as { electronAPI?: unknown }).electronAPI;
});

describe('ContentArea', () => {
  it('renders all three tab panels with only the active one visible', () => {
    render(
      <AppProvider>
        <ContentArea activeTab="catalogs" />
      </AppProvider>,
    );

    const panels = document.querySelectorAll('.content-area-panel');
    expect(panels).toHaveLength(3);

    const activePanels = document.querySelectorAll('.content-area-panel[data-active="true"]');
    expect(activePanels).toHaveLength(1);
    expect(activePanels[0]).toContainElement(screen.getByRole('heading', { name: 'Catalogs' }));
  });

  it('shows Themes panel when activeTab is themes', () => {
    render(
      <AppProvider>
        <ContentArea activeTab="themes" />
      </AppProvider>,
    );

    const activePanels = document.querySelectorAll('.content-area-panel[data-active="true"]');
    expect(activePanels).toHaveLength(1);
    expect(activePanels[0]).toContainElement(screen.getByRole('heading', { name: 'Themes' }));
  });

  it('shows Templates panel when activeTab is templates', () => {
    render(
      <AppProvider>
        <ContentArea activeTab="templates" />
      </AppProvider>,
    );

    const activePanels = document.querySelectorAll('.content-area-panel[data-active="true"]');
    expect(activePanels).toHaveLength(1);
    expect(activePanels[0]).toContainElement(screen.getByRole('heading', { name: 'Templates' }));
  });

  it('preserves theme selection when switching tabs and back', async () => {
    const ref: { current: { state: ReturnType<typeof useAppState>['state']; dispatch: ReturnType<typeof useAppState>['dispatch'] } | null } = { current: null };
    const tabRef: { current: { setTab: (tab: TabId) => void } | null } = { current: null };

    function Wrapper() {
      const [activeTab, setActiveTab] = useState<TabId>('themes');
      tabRef.current = { setTab: setActiveTab };
      const app = useAppState();
      ref.current = { state: app.state, dispatch: app.dispatch };
      return <ContentArea activeTab={activeTab} />;
    }

    render(
      <AppProvider>
        <Wrapper />
      </AppProvider>,
    );

    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
      ref.current!.dispatch({ type: ThemeActionType.ThemeThemesVersionListOnCommit, name: 'test-theme', version: '1.0.0' });
      await new Promise((r) => setTimeout(r, 150));
    });
    expect(ref.current!.state.themes.selectedRef).toEqual({ name: 'test-theme', version: '1.0.0' });

    await act(async () => {
      tabRef.current!.setTab('templates');
      await new Promise((r) => setTimeout(r, 50));
    });
    await act(async () => {
      tabRef.current!.setTab('themes');
      await new Promise((r) => setTimeout(r, 50));
    });
    expect(ref.current!.state.themes.selectedRef).toEqual({ name: 'test-theme', version: '1.0.0' });
  });
});
