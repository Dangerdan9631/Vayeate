import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EditorPreviewsCard } from './EditorPreviewsCard';
import type {
  ColorAssignment,
  ContrastAssignment,
  ContrastVariable,
  Mapping,
} from '../../../model/schemas';
import type { ThemesState } from '../../../domain/state/app-state';

const mockUseThemesState = vi.fn();
vi.mock('../context/slice-contexts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../context/slice-contexts')>();
  return {
    ...actual,
    useThemesState: () => mockUseThemesState(),
  };
});

function makeProps(overrides: Partial<{
  colorAssignments: readonly ColorAssignment[];
  contrastAssignments: readonly ContrastAssignment[];
  contrastVariables: readonly ContrastVariable[];
  mappings: readonly Mapping[];
}> = {}) {
  return {
    colorAssignments: overrides.colorAssignments ?? [
      { colorRef: 'editorBg', dark: { value: '#1e1e1e' }, light: { value: '#ffffff' }, useDarkForLight: false },
    ],
    contrastAssignments: overrides.contrastAssignments ?? [],
    contrastVariables: overrides.contrastVariables ?? [],
    mappings: overrides.mappings ?? [
      { token: { key: 'keyword.control', type: 'textmate token' }, colorVariableRef: 'keywordColor', contrastVariableRef: null, groupRef: null },
    ],
    idePrimaryTokenRef: null as string | null,
    onChangeIdePrimaryTokenRef: vi.fn(),
    ideForegroundTokenRef: null as string | null,
    onChangeIdeForegroundTokenRef: vi.fn(),
    themeBackgroundTokenRef: null as string | null,
    onChangeThemeBackgroundTokenRef: vi.fn(),
    themeForegroundTokenRef: null as string | null,
    onChangeThemeForegroundTokenRef: vi.fn(),
    lineNumberBackgroundTokenRef: null as string | null,
    onChangeLineNumberBackgroundTokenRef: vi.fn(),
    lineNumberForegroundTokenRef: null as string | null,
    onChangeLineNumberForegroundTokenRef: vi.fn(),
    ideTabTokenRef: null as string | null,
    onChangeIdeTabTokenRef: vi.fn(),
    ideTabBarBackgroundTokenRef: null as string | null,
    onChangeIdeTabBarBackgroundTokenRef: vi.fn(),
    ideTabBarForegroundTokenRef: null as string | null,
    onChangeIdeTabBarForegroundTokenRef: vi.fn(),
    editorPreviewScrollbarBackgroundTokenRef: null as string | null,
    onChangeEditorPreviewScrollbarBackgroundTokenRef: vi.fn(),
    editorPreviewScrollbarForegroundTokenRef: null as string | null,
    onChangeEditorPreviewScrollbarForegroundTokenRef: vi.fn(),
    editorPreviewSelectionBackgroundTokenRef: null as string | null,
    onChangeEditorPreviewSelectionBackgroundTokenRef: vi.fn(),
    editorPreviewMenuForegroundTokenRef: null as string | null,
    onChangeEditorPreviewMenuForegroundTokenRef: vi.fn(),
    editorPreviewMenuBackgroundTokenRef: null as string | null,
    onChangeEditorPreviewMenuBackgroundTokenRef: vi.fn(),
  };
}

const mockPreview = {
  language: 'typescript',
  fileName: 'example.ts',
  lines: [
    {
      tokens: [
        { text: 'const', scopes: ['source.ts', 'keyword.control.ts'] },
        { text: ' ', scopes: ['source.ts'] },
        { text: 'x', scopes: ['source.ts', 'variable.other.readwrite.ts'] },
      ],
    },
  ],
};

function mockThemesState(editorPreviews: ThemesState['editorPreviews'] = [mockPreview]): ThemesState {
  return { editorPreviews } as ThemesState;
}

describe('EditorPreviewsCard', () => {
  beforeEach(() => {
    mockUseThemesState.mockReturnValue(mockThemesState());
  });

  it('renders IDE Foreground, IDE Background, Editor Foreground, Editor Background, and other token selectors', () => {
    render(<EditorPreviewsCard {...makeProps()} />);
    expect(screen.getByText('Editor Previews')).toBeInTheDocument();
    expect(screen.getByText('IDE Foreground')).toBeInTheDocument();
    expect(screen.getByText('IDE Background')).toBeInTheDocument();
    expect(screen.getByText('Editor Foreground')).toBeInTheDocument();
    expect(screen.getByText('Editor Background')).toBeInTheDocument();
    expect(screen.getByText('Line Number Foreground')).toBeInTheDocument();
    expect(screen.getByText('IDE Current Tab Color')).toBeInTheDocument();
    expect(screen.getByText('Selection Background')).toBeInTheDocument();
    expect(screen.getByText('Menu Foreground')).toBeInTheDocument();
    expect(screen.getByText('Menu Background')).toBeInTheDocument();
  });

  it('renders Dark and Light preview columns', () => {
    render(<EditorPreviewsCard {...makeProps()} />);
    expect(screen.getByRole('heading', { name: 'Dark' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Light' })).toBeInTheDocument();
  });

  it('shows previews from state', () => {
    mockUseThemesState.mockReturnValue(mockThemesState([mockPreview]));
    render(<EditorPreviewsCard {...makeProps()} />);
    const labels = screen.getAllByText('typescript');
    expect(labels.length).toBeGreaterThanOrEqual(1);
  });

  it('shows all preview blocks when editorPreviews in state', async () => {
    render(<EditorPreviewsCard {...makeProps()} />);
    const labels = await screen.findAllByText('typescript');
    expect(labels.length).toBeGreaterThanOrEqual(1);
  });

  it('shows sticky bar with current sample name when previews are loaded', async () => {
    const { container } = render(<EditorPreviewsCard {...makeProps()} />);
    await screen.findAllByText('typescript');
    const stickyLabels = container.querySelectorAll('.theme-preview-sticky-bar-label');
    expect(stickyLabels).toHaveLength(2);
  });

  it('opens sample dropdown when Show sample list button is clicked', async () => {
    const user = userEvent.setup();
    render(<EditorPreviewsCard {...makeProps()} />);
    const buttons = await screen.findAllByLabelText('Show sample list');
    await user.click(buttons[0]);
    const listboxes = screen.getAllByRole('listbox');
    expect(listboxes.length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole('option', { name: 'typescript' }).length).toBeGreaterThanOrEqual(1);
  });

  it('closes dropdown and scrolls to sample when a sample is selected', async () => {
    const user = userEvent.setup();
    const secondPreview = { ...mockPreview, language: 'javascript', fileName: 'other.js', lines: mockPreview.lines };
    mockUseThemesState.mockReturnValue(mockThemesState([mockPreview, secondPreview]));
    render(<EditorPreviewsCard {...makeProps()} />);
    const buttons = await screen.findAllByLabelText('Show sample list');
    await user.click(buttons[0]);
    const options = await screen.findAllByRole('option', { name: 'javascript' });
    await user.click(options[0]);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});
