import { useThemeViewModel } from './use-theme-viewmodel';
import { useThemesPageChromeViewModel } from './use-themes-page-chrome-viewmodel';
import { CreateThemeDialog } from '../create-theme-dialog/CreateThemeDialog';
import { LazyEditorPreviewsCard } from '../editor-previews-card/LazyEditorPreviewsCard';
import { ThemeDetailsCard } from '../theme-details-card/ThemeDetailsCard';
import { ThemePaletteCard } from '../theme-palette-card/ThemePaletteCard';
import { ThemeVariablesCard } from '../theme-variables-card/ThemeVariablesCard';
import { ThemesCard } from '../themes-card/ThemesCard';

/**
 * Renders the Themes Page UI for the theme editor.
 */
export function ThemesPage() {
  const { isPageLoading, isThemeLoading, isThemeLoaded } = useThemeViewModel();
  const { saveError, createDialogOpen, onDismissSaveErrorClick } = useThemesPageChromeViewModel();

  return (
    <>
      {saveError && (
        <div className="theme-save-error-banner" role="alert">
          <span className="theme-save-error-message">{saveError}</span>
          <button
            type="button"
            className="theme-save-error-dismiss"
            onClick={onDismissSaveErrorClick}
            aria-label="Dismiss"
          >
            <span className="material-symbols-outlined" aria-hidden>close</span>
          </button>
        </div>
      )}
      {isPageLoading ? (
        <div className="placeholder">
          <h2>Themes</h2>
          <p>Loading themes...</p>
        </div>
      ) : (
        <div className="themes-page-grid">
          <div className="themes-left-col">
            <ThemesCard />
            {isThemeLoading && (
              <div className="theme-details-card placeholder">
                <h2>Theme details</h2>
                <p>Loading theme...</p>
              </div>
            )}
            {isThemeLoaded && (
              <>
                <ThemeDetailsCard />
                <ThemePaletteCard />
                <ThemeVariablesCard />
              </>
            )}
          </div>
          {isThemeLoaded && (
            <div className="themes-right-col">
              <LazyEditorPreviewsCard />
            </div>
          )}
        </div>
      )}
      {createDialogOpen && <CreateThemeDialog />}
    </>
  );
}
