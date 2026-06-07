import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { StatusBar } from './StatusBar';

const viewModelMocks = vi.hoisted(() => ({
  useStatusBarViewModel: vi.fn(),
}));

vi.mock('./use-status-bar-viewmodel', () => ({
  useStatusBarViewModel: viewModelMocks.useStatusBarViewModel,
}));

describe('status bar renderer workflows', () => {
  it('stays quiet when no queue progress is active', () => {
    viewModelMocks.useStatusBarViewModel.mockReturnValue({
      showProgressArea: false,
      queueStatusText: '',
      runningActionDescriptions: [],
    });

    const view = render(<StatusBar />);

    expect(view.queryByRole('status')).toBeNull();
    expect(view.container.querySelector('.status-progress-area')).toBeNull();
  });

  it('renders derived queue progress without introducing a separate action flow', () => {
    viewModelMocks.useStatusBarViewModel.mockReturnValue({
      showProgressArea: true,
      queueStatusText: 'Sync catalog, 2 queued',
      runningActionDescriptions: ['[Action] Sync catalog', '[Preview] Rebuild preview'],
    });

    const view = render(<StatusBar />);

    expect(view.getByText('Sync catalog, 2 queued')).toBeInTheDocument();
    expect(view.getByRole('status')).toHaveTextContent('Executing');
    expect(view.getByText('[Action] Sync catalog')).toBeInTheDocument();
    expect(view.getByText('[Preview] Rebuild preview')).toBeInTheDocument();
  });
});
