import { useThemeViewModel } from '../viewmodel/use-theme-viewmodel';
import { useThemesPageChromeViewModel } from '../viewmodel/use-themes-page-chrome-viewmodel';
import { CreateThemeDialog } from './CreateThemeDialog';
import { LazyEditorPreviewsCard } from './LazyEditorPreviewsCard';
import { ThemeDetailsCard } from './ThemeDetailsCard';
import { ThemePaletteCard } from './ThemePaletteCard';
import { ThemeVariablesCard } from './ThemeVariablesCard';
import { ThemesCard } from './ThemesCard';

export function ThemesPage() {
  useThemeViewModel();
  const { saveError, createDialogOpen, dismissSaveError } = useThemesPageChromeViewModel();

  return (
    <>
      {saveError && (
        <div className="theme-save-error-banner" role="alert">
          <span className="theme-save-error-message">{saveError}</span>
          <button
            type="button"
            className="theme-save-error-dismiss"
            onClick={dismissSaveError}
            aria-label="Dismiss"
          >
            <span className="material-symbols-outlined" aria-hidden>close</span>
          </button>
        </div>
      )}
      <div className="themes-page-grid">
        <div className="themes-left-col">
          <ThemesCard />
          <ThemeDetailsCard />
          <ThemePaletteCard />
          <ThemeVariablesCard />
        </div>
        <div className="themes-right-col">
          <LazyEditorPreviewsCard />
        </div>
      </div>
      {createDialogOpen && <CreateThemeDialog />}
    </>
  );
}
