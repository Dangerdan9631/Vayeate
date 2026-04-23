import { useThemeViewModel } from './use-theme-viewmodel';
import { useThemesPageChromeViewModel } from './use-themes-page-chrome-viewmodel';
import { CreateThemeDialog } from '../create-theme-dialog/CreateThemeDialog';
import { LazyEditorPreviewsCard } from '../editor-previews-card/LazyEditorPreviewsCard';
import { ThemeDetailsCard } from '../theme-details-card/ThemeDetailsCard';
import { ThemePaletteCard } from '../theme-palette-card/ThemePaletteCard';
import { ThemeVariablesCard } from '../theme-variables-card/ThemeVariablesCard';
import { ThemesCard } from '../themes-card/ThemesCard';

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
