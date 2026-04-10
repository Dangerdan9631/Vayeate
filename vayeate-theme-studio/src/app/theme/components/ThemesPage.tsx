import { useCallback } from 'react';
import { useAppDispatch } from '../../common/context/use-app-dispatch';
import { useThemeViewModel, useThemesPageChromeViewModel } from '../viewmodel/use-theme-viewmodel';
import { ThemeActionType } from '../actions/theme-action-type';
import { CreateThemeDialog } from './CreateThemeDialog';
import { EditorPreviewsCard } from './EditorPreviewsCard';
import { ThemeDetailsCard } from './ThemeDetailsCard';
import { ThemePaletteCard } from './ThemePaletteCard';
import { ThemeVariablesCard } from './ThemeVariablesCard';
import { ThemesCard } from './ThemesCard';

export function ThemesPage() {
  useThemeViewModel();
  const { saveError, createDialogOpen } = useThemesPageChromeViewModel();
  const dispatch = useAppDispatch();
  const dismissSaveError = useCallback(() => {
    dispatch({ type: ThemeActionType.ThemePageSaveErrorDismissButtonOnClick });
  }, [dispatch]);

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
          <EditorPreviewsCard />
        </div>
      </div>
      {createDialogOpen && <CreateThemeDialog />}
    </>
  );
}
