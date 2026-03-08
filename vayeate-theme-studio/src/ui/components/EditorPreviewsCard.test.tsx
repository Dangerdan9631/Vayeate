import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EditorPreviewsCard } from './EditorPreviewsCard';
import type {
  ColorAssignment,
  ContrastAssignment,
  ContrastVariable,
  Mapping,
} from '../../model/schemas';

vi.mock('../../services/preview-service', () => ({
  previewService: {
    loadPreviews: vi.fn(),
  },
}));

const previewService = await import('../../services/preview-service').then((m) => m.previewService);

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

describe('EditorPreviewsCard', () => {
  beforeEach(() => {
    vi.mocked(previewService.loadPreviews).mockResolvedValue([mockPreview]);
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
  });

  it('renders Dark and Light preview columns', () => {
    render(<EditorPreviewsCard {...makeProps()} />);
    expect(screen.getByRole('heading', { name: 'Dark' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Light' })).toBeInTheDocument();
  });

  it('loads previews on mount', async () => {
    render(<EditorPreviewsCard {...makeProps()} />);
    expect(previewService.loadPreviews).toHaveBeenCalled();
  });

  it('shows all preview blocks after load', async () => {
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
    await screen.findByLabelText('Show sample list');
    await user.click(screen.getByLabelText('Show sample list'));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'typescript' })).toBeInTheDocument();
  });

  it('closes dropdown and scrolls to sample when a sample is selected', async () => {
    const user = userEvent.setup();
    vi.mocked(previewService.loadPreviews).mockResolvedValue([
      mockPreview,
      { ...mockPreview, language: 'javascript', fileName: 'other.js', lines: mockPreview.lines },
    ]);
    render(<EditorPreviewsCard {...makeProps()} />);
    await screen.findByLabelText('Show sample list');
    await user.click(screen.getByLabelText('Show sample list'));
    const option = await screen.findByRole('option', { name: 'javascript' });
    await user.click(option);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});
