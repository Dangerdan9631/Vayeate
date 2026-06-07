import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Ribbon } from './Ribbon';

const viewModelMocks = vi.hoisted(() => ({
  useRibbonViewModel: vi.fn(),
}));

vi.mock('./use-ribbon-viewmodel', () => ({
  useRibbonViewModel: viewModelMocks.useRibbonViewModel,
}));

describe('ribbon renderer workflows', () => {
  it('renders tabs and forwards clicks through one named viewmodel callback', async () => {
    const user = userEvent.setup();
    const onRibbonTabButtonClick = vi.fn();
    viewModelMocks.useRibbonViewModel.mockReturnValue({ onRibbonTabButtonClick });

    const view = render(<Ribbon activeTab="templates" />);
    const buttons = view.getAllByRole('button');

    expect(view.getByRole('button', { name: 'Templates' })).toHaveAttribute('aria-pressed', 'true');

    await user.click(buttons[0]);
    await user.click(buttons[1]);
    await user.click(buttons[2]);

    expect(onRibbonTabButtonClick).toHaveBeenNthCalledWith(1, 'catalogs');
    expect(onRibbonTabButtonClick).toHaveBeenNthCalledWith(2, 'templates');
    expect(onRibbonTabButtonClick).toHaveBeenNthCalledWith(3, 'themes');
  });
});
