import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ThemePaletteCard } from './ThemePaletteCard';

describe('ThemePaletteCard', () => {
  it('renders Theme Palette heading and Hue Adjustment label', () => {
    render(
      <ThemePaletteCard
        hueAdjustment={0}
        onHueChange={vi.fn()}
        onCommit={vi.fn()}
        onRevert={vi.fn()}
      />,
    );
    expect(screen.getByRole('heading', { name: 'Theme Palette' })).toBeInTheDocument();
    expect(screen.getByLabelText('Hue adjustment')).toBeInTheDocument();
    expect(screen.getByText('Hue Adjustment')).toBeInTheDocument();
  });

  it('renders slider with range -100 to 100 and value at 0', () => {
    render(
      <ThemePaletteCard
        hueAdjustment={0}
        onHueChange={vi.fn()}
        onCommit={vi.fn()}
        onRevert={vi.fn()}
      />,
    );
    const slider = screen.getByRole('slider', { name: 'Hue adjustment' });
    expect(slider).toHaveAttribute('min', '-100');
    expect(slider).toHaveAttribute('max', '100');
    expect(slider).toHaveValue('0');
  });

  it('does not show Commit or Revert when hueAdjustment is 0', () => {
    render(
      <ThemePaletteCard
        hueAdjustment={0}
        onHueChange={vi.fn()}
        onCommit={vi.fn()}
        onRevert={vi.fn()}
      />,
    );
    expect(screen.queryByRole('button', { name: 'Commit' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Revert' })).not.toBeInTheDocument();
  });

  it('shows Commit and Revert when hueAdjustment is non-zero', () => {
    render(
      <ThemePaletteCard
        hueAdjustment={50}
        onHueChange={vi.fn()}
        onCommit={vi.fn()}
        onRevert={vi.fn()}
      />,
    );
    expect(screen.getByRole('button', { name: 'Commit hue adjustment' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Revert hue adjustment' })).toBeInTheDocument();
  });

  it('calls onHueChange when slider value changes', () => {
    const onHueChange = vi.fn();
    render(
      <ThemePaletteCard
        hueAdjustment={0}
        onHueChange={onHueChange}
        onCommit={vi.fn()}
        onRevert={vi.fn()}
      />,
    );
    const slider = screen.getByRole('slider', { name: 'Hue adjustment' });
    fireEvent.change(slider, { target: { value: '50' } });
    expect(onHueChange).toHaveBeenCalledWith(50);
  });

  it('calls onRevert when Revert is clicked', async () => {
    const user = userEvent.setup();
    const onRevert = vi.fn();
    render(
      <ThemePaletteCard
        hueAdjustment={30}
        onHueChange={vi.fn()}
        onCommit={vi.fn()}
        onRevert={onRevert}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Revert hue adjustment' }));
    expect(onRevert).toHaveBeenCalledTimes(1);
  });

  it('calls onCommit when Commit is clicked', async () => {
    const user = userEvent.setup();
    const onCommit = vi.fn();
    render(
      <ThemePaletteCard
        hueAdjustment={30}
        onHueChange={vi.fn()}
        onCommit={onCommit}
        onRevert={vi.fn()}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Commit hue adjustment' }));
    expect(onCommit).toHaveBeenCalledTimes(1);
  });
});
