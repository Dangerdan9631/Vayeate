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
    colorVariableKeys: ['editorBg'],
    idePrimaryColorRef: null as string | null,
    onChangeIdePrimaryColorRef: vi.fn(),
    idePrimaryColorContrastRef: null as string | null,
    onChangeIdePrimaryColorContrastRef: vi.fn(),
    themeBackgroundColorRef: null as string | null,
    onChangeThemeBackgroundColorRef: vi.fn(),
    mappings: overrides.mappings ?? [
      { token: { key: 'keyword.control', type: 'textmate token' }, colorVariableRef: 'keywordColor', contrastVariableRef: null, groupRef: null },
    ],
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

  it('renders IDE Primary Color, IDE Primary Contrast, and Theme Background selectors', () => {
    render(<EditorPreviewsCard {...makeProps()} />);
    expect(screen.getByText('Editor Previews')).toBeInTheDocument();
    expect(screen.getByLabelText(/IDE Primary Color Variable/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/IDE Primary Contrast Variable/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Theme Background Color Variable/i)).toBeInTheDocument();
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
