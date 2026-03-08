import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ThemePaletteCard } from './ThemePaletteCard';

const defaultPaletteProps = {
  colorAssignments: [] as const,
  colorVariables: [] as const,
  groups: [] as const,
};

function renderCard(overrides: Record<string, unknown> = {}) {
  return render(
    <ThemePaletteCard
      hueAdjustment={0}
      onHueChange={vi.fn()}
      onCommit={vi.fn()}
      onRevert={vi.fn()}
      {...defaultPaletteProps}
      {...overrides}
    />,
  );
}

describe('ThemePaletteCard', () => {
  it('renders Theme Palette heading and Hue Adjustment label', () => {
    renderCard();
    expect(screen.getByRole('heading', { name: 'Theme Palette' })).toBeInTheDocument();
    expect(screen.getByLabelText('Hue adjustment')).toBeInTheDocument();
    expect(screen.getByText('Hue Adjustment')).toBeInTheDocument();
  });

  it('renders slider with range -100 to 100 and value at 0', () => {
    renderCard();
    const slider = screen.getByRole('slider', { name: 'Hue adjustment' });
    expect(slider).toHaveAttribute('min', '-100');
    expect(slider).toHaveAttribute('max', '100');
    expect(slider).toHaveValue('0');
  });

  it('does not show Commit or Revert when hueAdjustment is 0', () => {
    renderCard();
    expect(screen.queryByRole('button', { name: 'Commit' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Revert' })).not.toBeInTheDocument();
  });

  it('shows Commit and Revert when hueAdjustment is non-zero', () => {
    renderCard({ hueAdjustment: 50 });
    expect(screen.getByRole('button', { name: 'Commit hue adjustment' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Revert hue adjustment' })).toBeInTheDocument();
  });

  it('calls onHueChange when slider value changes', () => {
    const onHueChange = vi.fn();
    renderCard({ onHueChange });
    const slider = screen.getByRole('slider', { name: 'Hue adjustment' });
    fireEvent.change(slider, { target: { value: '50' } });
    expect(onHueChange).toHaveBeenCalledWith(50);
  });

  it('calls onRevert when Revert is clicked', async () => {
    const user = userEvent.setup();
    const onRevert = vi.fn();
    renderCard({ hueAdjustment: 30, onRevert });
    await user.click(screen.getByRole('button', { name: 'Revert hue adjustment' }));
    expect(onRevert).toHaveBeenCalledTimes(1);
  });

  it('calls onCommit when Commit is clicked', async () => {
    const user = userEvent.setup();
    const onCommit = vi.fn();
    renderCard({ hueAdjustment: 30, onCommit });
    await user.click(screen.getByRole('button', { name: 'Commit hue adjustment' }));
    expect(onCommit).toHaveBeenCalledTimes(1);
  });

  it('renders Cluster count (k) slider with min 1, max 12, default 5', () => {
    renderCard();
    const kSlider = screen.getByRole('slider', { name: 'Cluster count (k)' });
    expect(kSlider).toHaveAttribute('min', '1');
    expect(kSlider).toHaveAttribute('max', '12');
    expect(kSlider).toHaveValue('5');
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('shows palette section and primary swatches when one group has colors', () => {
    renderCard({
      colorAssignments: [
        { colorRef: 'a', dark: { value: '#ff0000' }, light: { value: '#ff0000' }, useDarkForLight: true },
        { colorRef: 'b', dark: { value: '#00ff00' }, light: null, useDarkForLight: true },
      ],
      colorVariables: [
        { key: 'a', groupRef: 'g1' },
        { key: 'b', groupRef: 'g1' },
      ],
      groups: ['g1'],
    });
    expect(screen.getByText('g1')).toBeInTheDocument();
    const primaries = screen.getAllByLabelText(/^Primary /);
    expect(primaries.length).toBeGreaterThanOrEqual(1);
  });

  it('changing k slider updates displayed value', () => {
    renderCard();
    const kSlider = screen.getByRole('slider', { name: 'Cluster count (k)' });
    fireEvent.change(kSlider, { target: { value: '8' } });
    expect(kSlider).toHaveValue('8');
    expect(screen.getByText('8')).toBeInTheDocument();
  });
});
