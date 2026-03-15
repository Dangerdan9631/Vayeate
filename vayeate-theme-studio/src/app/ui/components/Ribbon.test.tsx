import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Ribbon } from './Ribbon';

describe('Ribbon', () => {
  it('renders tab buttons for catalogs, templates, themes', () => {
    const onTabChange = vi.fn();
    render(<Ribbon activeTab="catalogs" onTabChange={onTabChange} />);

    expect(screen.getByRole('button', { name: 'Catalogs' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Templates' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Themes' })).toBeInTheDocument();
  });

  it('sets aria-pressed on active tab', () => {
    render(<Ribbon activeTab="themes" onTabChange={() => {}} />);

    const catalogsBtn = screen.getByRole('button', { name: 'Catalogs' });
    const themesBtn = screen.getByRole('button', { name: 'Themes' });

    expect(catalogsBtn).toHaveAttribute('aria-pressed', 'false');
    expect(themesBtn).toHaveAttribute('aria-pressed', 'true');
  });

  it('calls onTabChange when tab is clicked', async () => {
    const user = userEvent.setup();
    const onTabChange = vi.fn();
    render(<Ribbon activeTab="catalogs" onTabChange={onTabChange} />);

    await user.click(screen.getByRole('button', { name: 'Templates' }));

    expect(onTabChange).toHaveBeenCalledWith('templates');
  });
});
