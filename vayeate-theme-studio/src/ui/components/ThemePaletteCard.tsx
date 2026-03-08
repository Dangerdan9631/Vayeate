interface ThemePaletteCardProps {
  hueAdjustment: number;
  onHueChange: (value: number) => void;
  onCommit: () => void;
  onRevert: () => void;
}

export function ThemePaletteCard({
  hueAdjustment,
  onHueChange,
  onCommit,
  onRevert,
}: ThemePaletteCardProps) {
  const showCommitRevert = hueAdjustment !== 0;

  return (
    <div className="catalog-details-card placeholder theme-palette-card">
      <h2>Theme Palette</h2>
      <div className="theme-palette-hue-row">
        <label htmlFor="theme-palette-hue-slider" className="theme-palette-hue-label">
          Hue Adjustment
        </label>
        {showCommitRevert && (
          <div className="theme-palette-actions">
            <button type="button" className="theme-palette-btn" onClick={onRevert} aria-label="Revert hue adjustment">
              Revert
            </button>
            <button type="button" className="theme-palette-btn" onClick={onCommit} aria-label="Commit hue adjustment">
              Commit
            </button>
          </div>
        )}
      </div>
      <div className="theme-palette-slider-wrap">
        <input
          id="theme-palette-hue-slider"
          type="range"
          className="theme-palette-hue-slider"
          min={-100}
          max={100}
          step={1}
          value={hueAdjustment}
          onChange={(e) => onHueChange(Number(e.target.value))}
          aria-label="Hue adjustment"
          aria-valuemin={-100}
          aria-valuemax={100}
          aria-valuenow={hueAdjustment}
        />
      </div>
    </div>
  );
}
