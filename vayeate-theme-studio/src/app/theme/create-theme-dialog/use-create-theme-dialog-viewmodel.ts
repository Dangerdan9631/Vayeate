import { useCallback, useMemo } from 'react';
import { container } from 'tsyringe';
import { useStore } from 'zustand';
import { useAppDispatch } from '../../core/action-queue/use-app-dispatch';
import { ThemeCreateDialogStore } from '../../../domain/state/ui/theme-create-dialog-store';
import { CreateThemeDialogActionType } from './actions/create-theme-dialog-action-type';

const NAME_REGEX = /^[a-zA-Z0-9-]+$/;
const themeCreateDialogStore = container.resolve(ThemeCreateDialogStore);

/**
 * Read model returned by useCreateThemeDialogViewModel.
 */
export interface CreateThemeDialogViewModel {
  title: string;
  name: string;
  canSubmit: boolean;
  showNameError: boolean;
  onOkClick: () => void;
  onCancelClick: () => void;
  onNameChange: (value: string) => void;
}

/**
 * Exposes Create Theme Dialog state and dispatches user or lifecycle actions.
 * @returns View-model state and action callbacks for the component.
 */
export function useCreateThemeDialogViewModel(): CreateThemeDialogViewModel {
  const dispatch = useAppDispatch();
  const name = useStore(themeCreateDialogStore.api, (state): string => state.state.name);
  const mode = useStore(themeCreateDialogStore.api, (state) => state.state.mode);
  const nameValid = useMemo(() => name.length > 0 && NAME_REGEX.test(name), [name]);
  const canSubmit = useMemo(() => nameValid, [nameValid]);
  const title = useMemo(() => (mode === 'duplicate' ? 'Duplicate Theme' : 'Create New Theme'), [mode]);

  const onOkClick = useCallback(() => {
    if (!canSubmit) return;
    void dispatch({ type: CreateThemeDialogActionType.OkButtonOnClick, params: { name } });
  }, [canSubmit, dispatch, name]);

  const onCancelClick = useCallback(() => {
    void dispatch({ type: CreateThemeDialogActionType.CancelButtonOnClick });
  }, [dispatch]);

  const onNameChange = useCallback((value: string) => {
    void dispatch({ type: CreateThemeDialogActionType.NameTextOnChange, value });
  }, [dispatch]);

  const showNameError = useMemo(() => name.length > 0 && !nameValid, [name, nameValid]);

  return {
    title,
    name,
    canSubmit,
    showNameError,
    onOkClick,
    onCancelClick,
    onNameChange,
  };
}

