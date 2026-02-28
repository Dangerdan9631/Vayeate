import { render, screen } from '@testing-library/react';
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
    themeBackgroundColorRef: null as string | null,
    onChangeThemeBackgroundColorRef: vi.fn(),
    mappings: overrides.mappings ?? [
      { token: { key: 'keyword.control', type: 'token' }, colorVariableRef: 'keywordColor', contrastVariableRef: null },
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

  it('renders IDE Primary Color and Theme Background selectors', () => {
    render(<EditorPreviewsCard {...makeProps()} />);
    expect(screen.getByText('Editor Previews')).toBeInTheDocument();
    expect(screen.getByLabelText(/IDE Primary Color Variable/i)).toBeInTheDocument();
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
    const labels = await screen.findAllByText('typescript / example.ts');
    expect(labels.length).toBeGreaterThanOrEqual(1);
  });
});
