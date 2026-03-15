import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ThemePaletteCard } from './ThemePaletteCard';
import { isEyedropperSupported, pickColorFromScreen } from '../utils/eyedropper';

vi.mock('../utils/eyedropper');

const defaultPaletteProps = {
  colorAssignments: [] as const,
  colorVariables: [] as const,
  groups: [] as const,
  checkedColorRefs: new Set<string>(),
  onSetColorGroupChecked: vi.fn(),
  onSetColorRefsChecked: vi.fn(),
  applyToDark: true,
  applyToLight: true,
  onApplyToDarkChange: vi.fn(),
  onApplyToLightChange: vi.fn(),
  clusterCountK: 5,
  onClusterCountDelta: vi.fn(),
  onClusterCountCommit: vi.fn(),
  selectedColorsDisplay: { kind: 'none' as const },
  onSetSelectedColors: vi.fn(),
};

function renderCard(overrides: Record<string, unknown> = {}) {
  return render(
    <ThemePaletteCard
      hueAdjustment={0}
      hueReferenceHex="#FF0000"
      onHueChange={vi.fn()}
      onHueReferenceChange={vi.fn()}
      onRecenter={vi.fn()}
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

  it('always shows Recenter button', () => {
    renderCard();
    expect(screen.getByRole('button', { name: 'Recenter hue slider to 0' })).toBeInTheDocument();
  });

  it('shows hue reference hex input with default value', () => {
    renderCard({ hueReferenceHex: '#FF0000' });
    const input = screen.getByLabelText('Hue reference color (hex)');
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue('#FF0000');
  });

  it('calls onHueChange when slider value changes', () => {
    const onHueChange = vi.fn();
    renderCard({ onHueChange });
    const slider = screen.getByRole('slider', { name: 'Hue adjustment' });
    fireEvent.change(slider, { target: { value: '50' } });
    expect(onHueChange).toHaveBeenCalledWith(50);
  });

  it('calls onRecenter when Recenter is clicked', async () => {
    const user = userEvent.setup();
    const onRecenter = vi.fn();
    renderCard({ hueAdjustment: 30, onRecenter });
    await user.click(screen.getByRole('button', { name: 'Recenter hue slider to 0' }));
    expect(onRecenter).toHaveBeenCalledTimes(1);
  });

  it('renders Cluster count (k) slider with min 1, max 12, default 5', () => {
    renderCard();
    const kSlider = screen.getByRole('slider', { name: 'Cluster count (k)' });
    expect(kSlider).toHaveAttribute('min', '1');
    expect(kSlider).toHaveAttribute('max', '12');
    expect(kSlider).toHaveValue('5');
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('shows palette section and swatches when one group has colors', () => {
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
    const swatches = screen.getAllByRole('button', { name: /#ff0000/i });
    expect(swatches.length).toBeGreaterThanOrEqual(1);
  });

  it('changing k slider calls onClusterCountDelta with new value', () => {
    const onClusterCountDelta = vi.fn();
    renderCard({ clusterCountK: 5, onClusterCountDelta });
    const kSlider = screen.getByRole('slider', { name: 'Cluster count (k)' });
    fireEvent.change(kSlider, { target: { value: '8' } });
    expect(onClusterCountDelta).toHaveBeenCalledWith(8);
    expect(kSlider).toHaveValue('5'); // controlled by prop
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('renders group checkbox linked to Variables card state and calls onSetColorGroupChecked when toggled', async () => {
    const user = userEvent.setup();
    const onSetColorGroupChecked = vi.fn();
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
      checkedColorRefs: new Set(['a', 'b']),
      onSetColorGroupChecked,
    });
    const groupCheckbox = screen.getByRole('checkbox', { name: 'Select all in group: g1' });
    expect(groupCheckbox).toBeInTheDocument();
    expect(groupCheckbox).toBeChecked();
    await user.click(groupCheckbox);
    expect(onSetColorGroupChecked).toHaveBeenCalledWith('g1', false);
  });

  it('copies hex to clipboard when primary swatch is right-clicked', () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    renderCard({
      colorAssignments: [
        { colorRef: 'a', dark: { value: '#ff0000' }, light: { value: '#ff0000' }, useDarkForLight: true },
      ],
      colorVariables: [{ key: 'a', groupRef: 'g1' }],
      groups: ['g1'],
      checkedColorRefs: new Set(['a']),
      onSetColorGroupChecked: vi.fn(),
      onSetColorRefsChecked: vi.fn(),
    });
    const primarySwatch = screen.getByRole('button', { name: /#ff0000/i });
    fireEvent.contextMenu(primarySwatch);
    expect(writeText).toHaveBeenCalledWith('#ff0000');
  });

  it('copies hex to clipboard when member swatch is right-clicked', () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    renderCard({
      colorAssignments: [
        { colorRef: 'a', dark: { value: '#aabbcc' }, light: { value: '#aabbcc' }, useDarkForLight: true },
        { colorRef: 'b', dark: { value: '#ddeeff' }, light: null, useDarkForLight: true },
      ],
      colorVariables: [
        { key: 'a', groupRef: 'g1' },
        { key: 'b', groupRef: 'g1' },
      ],
      groups: ['g1'],
      checkedColorRefs: new Set(['a', 'b']),
      onSetColorGroupChecked: vi.fn(),
      onSetColorRefsChecked: vi.fn(),
    });
    const copyDdeeff = screen.getByRole('button', { name: /#ddeeff/i });
    fireEvent.contextMenu(copyDdeeff);
    expect(writeText).toHaveBeenCalledWith('#ddeeff');
  });

  it('calls onSetColorRefsChecked when swatch is clicked to toggle variables', () => {
    vi.useFakeTimers();
    const onSetColorRefsChecked = vi.fn();
    renderCard({
      colorAssignments: [
        { colorRef: 'a', dark: { value: '#ff0000' }, light: { value: '#ff0000' }, useDarkForLight: true },
      ],
      colorVariables: [{ key: 'a', groupRef: 'g1' }],
      groups: ['g1'],
      checkedColorRefs: new Set(['a']),
      onSetColorGroupChecked: vi.fn(),
      onSetColorRefsChecked,
    });
    const primarySwatch = screen.getByRole('button', { name: /#ff0000/i });
    fireEvent.click(primarySwatch);
    expect(onSetColorRefsChecked).not.toHaveBeenCalled();
    vi.advanceTimersByTime(350);
    expect(onSetColorRefsChecked).toHaveBeenCalledWith(['a'], false);
    vi.useRealTimers();
  });

  it('double-click on primary when selected selects all refs in cluster', () => {
    const onSetColorRefsChecked = vi.fn();
    renderCard({
      colorAssignments: [
        { colorRef: 'a', dark: { value: '#ff0000' }, light: { value: '#ff0000' }, useDarkForLight: true },
      ],
      colorVariables: [{ key: 'a', groupRef: 'g1' }],
      groups: ['g1'],
      checkedColorRefs: new Set(['a']),
      onSetColorGroupChecked: vi.fn(),
      onSetColorRefsChecked,
    });
    const primarySwatch = screen.getByRole('button', { name: /#ff0000/i });
    fireEvent.click(primarySwatch);
    fireEvent.click(primarySwatch);
    expect(onSetColorRefsChecked).toHaveBeenCalledTimes(1);
    expect(onSetColorRefsChecked).toHaveBeenCalledWith(['a'], true);
  });

  it('double-click on primary when unselected unselects all refs in cluster', () => {
    const onSetColorRefsChecked = vi.fn();
    renderCard({
      colorAssignments: [
        { colorRef: 'a', dark: { value: '#ff0000' }, light: { value: '#ff0000' }, useDarkForLight: true },
      ],
      colorVariables: [{ key: 'a', groupRef: 'g1' }],
      groups: ['g1'],
      checkedColorRefs: new Set<string>(),
      onSetColorGroupChecked: vi.fn(),
      onSetColorRefsChecked,
    });
    const primarySwatch = screen.getByRole('button', { name: /#ff0000/i });
    fireEvent.click(primarySwatch);
    fireEvent.click(primarySwatch);
    expect(onSetColorRefsChecked).toHaveBeenCalledTimes(1);
    expect(onSetColorRefsChecked).toHaveBeenCalledWith(['a'], false);
  });

  it('renders cluster variant checkbox with light/dark icon and toggles cluster by dark/light', async () => {
    const user = userEvent.setup();
    renderCard();
    const clusterVariant = screen.getByRole('checkbox', {
      name: 'Cluster by dark theme colors',
    });
    expect(clusterVariant).toBeInTheDocument();
    expect(clusterVariant).toBeChecked();
    await user.click(clusterVariant);
    expect(screen.getByRole('checkbox', { name: 'Cluster by light theme colors' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Cluster by light theme colors' })).not.toBeChecked();
  });

  it('clusters by dark only when cluster variant is dark (default)', () => {
    renderCard({
      colorAssignments: [
        { colorRef: 'a', dark: { value: '#ff0000' }, light: { value: '#00ff00' }, useDarkForLight: false },
        { colorRef: 'b', dark: { value: '#0000ff' }, light: { value: '#ffff00' }, useDarkForLight: false },
      ],
      colorVariables: [
        { key: 'a', groupRef: 'g1' },
        { key: 'b', groupRef: 'g1' },
      ],
      groups: ['g1'],
    });
    const redSwatch = screen.getByRole('button', { name: /#ff0000/i });
    expect(redSwatch).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /#0000ff/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /#00ff00/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /#ffff00/i })).not.toBeInTheDocument();
  });

  it('renders apply-to-dark and apply-to-light checkboxes with correct icons, state, and tooltips', () => {
    renderCard({ applyToDark: true, applyToLight: false });
    const applyDark = screen.getByRole('checkbox', { name: 'Apply adjustments to dark theme colors' });
    const applyLight = screen.getByRole('checkbox', { name: 'Apply adjustments to light theme colors' });
    expect(applyDark).toBeInTheDocument();
    expect(applyLight).toBeInTheDocument();
    expect(applyDark).toBeChecked();
    expect(applyLight).not.toBeChecked();
    expect(screen.getByTitle('Apply hue adjustments to dark theme colors. Currently on.')).toBeInTheDocument();
    expect(screen.getByTitle('Apply hue adjustments to light theme colors. Currently off.')).toBeInTheDocument();
  });

  it('calls onApplyToDarkChange and onApplyToLightChange when apply checkboxes are toggled', async () => {
    const user = userEvent.setup();
    const onApplyToDarkChange = vi.fn();
    const onApplyToLightChange = vi.fn();
    renderCard({
      applyToDark: true,
      applyToLight: true,
      onApplyToDarkChange,
      onApplyToLightChange,
    });
    await user.click(screen.getByRole('checkbox', { name: 'Apply adjustments to dark theme colors' }));
    expect(onApplyToDarkChange).toHaveBeenCalledWith(false);
    await user.click(screen.getByRole('checkbox', { name: 'Apply adjustments to light theme colors' }));
    expect(onApplyToLightChange).toHaveBeenCalledWith(false);
  });

  it('renders color swatch disabled when selectedColorsDisplay is none', () => {
    renderCard({ selectedColorsDisplay: { kind: 'none' } });
    const swatch = screen.getByRole('button', { name: 'Select palette swatches to set color' });
    expect(swatch).toBeDisabled();
  });

  it('renders color swatch with filled color when selectedColorsDisplay is single', () => {
    renderCard({ selectedColorsDisplay: { kind: 'single', hex: '#aabbcc' } });
    const swatch = screen.getByRole('button', { name: 'Open color picker for selected variables' });
    expect(swatch).toHaveStyle({ backgroundColor: '#aabbcc' });
    expect(swatch).not.toBeDisabled();
  });

  it('opens color picker directly when swatch is clicked and selection is not none', async () => {
    const user = userEvent.setup();
    renderCard({ selectedColorsDisplay: { kind: 'single', hex: '#ff0000' } });
    const colorInput = screen.getByLabelText('Color');
    expect(colorInput).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Open color picker for selected variables' }));
    expect(colorInput).toHaveValue('#ff0000');
  });

  it('calls onSetSelectedColors with hex when hex input is blurred with valid value', async () => {
    const user = userEvent.setup();
    const onSetSelectedColors = vi.fn();
    renderCard({
      selectedColorsDisplay: { kind: 'single', hex: '#ff0000' },
      onSetSelectedColors,
    });
    const hexInput = screen.getByRole('textbox', { name: 'Hex color' });
    await user.clear(hexInput);
    await user.type(hexInput, '#00ff00');
    await user.tab();
    expect(onSetSelectedColors).toHaveBeenCalledWith('#00ff00');
  });

  describe('eyedropper (Pick from screen)', () => {
    beforeEach(() => {
      vi.mocked(isEyedropperSupported).mockReturnValue(false);
    });

    it('does not render Pick from screen button when eyedropper is not supported', () => {
      vi.mocked(isEyedropperSupported).mockReturnValue(false);
      renderCard({ selectedColorsDisplay: { kind: 'single', hex: '#ff0000' } });
      expect(screen.queryByRole('button', { name: 'Pick color from screen' })).not.toBeInTheDocument();
    });

    it('renders Pick from screen button disabled when supported and no selection', () => {
      vi.mocked(isEyedropperSupported).mockReturnValue(true);
      renderCard({ selectedColorsDisplay: { kind: 'none' } });
      const btn = screen.getByRole('button', { name: 'Pick color from screen' });
      expect(btn).toBeDisabled();
    });

    it('renders Pick from screen button enabled when supported and single selection', () => {
      vi.mocked(isEyedropperSupported).mockReturnValue(true);
      renderCard({ selectedColorsDisplay: { kind: 'single', hex: '#ff0000' } });
      const btn = screen.getByRole('button', { name: 'Pick color from screen' });
      expect(btn).not.toBeDisabled();
    });

    it('calls onSetSelectedColors with picked hex when Pick from screen returns a color', async () => {
      const user = userEvent.setup();
      vi.mocked(isEyedropperSupported).mockReturnValue(true);
      vi.mocked(pickColorFromScreen).mockResolvedValue('#aabbcc');
      const onSetSelectedColors = vi.fn();
      renderCard({
        selectedColorsDisplay: { kind: 'single', hex: '#ff0000' },
        onSetSelectedColors,
      });
      await user.click(screen.getByRole('button', { name: 'Pick color from screen' }));
      expect(pickColorFromScreen).toHaveBeenCalled();
      expect(onSetSelectedColors).toHaveBeenCalledWith('#aabbcc');
    });
  });
});
