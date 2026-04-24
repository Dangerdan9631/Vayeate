import { useCallback, useMemo } from 'react';
import { container } from 'tsyringe';
import { useStore } from 'zustand';
import { useAppDispatch } from '../../../common/context/use-app-dispatch';
import { ThemesStore } from '../../../../domain/state/theme/themes-store';
import { CreateThemeDialogActionType } from './actions/create-theme-dialog-action-type';

const NAME_REGEX = /^[a-zA-Z0-9-]+$/;
const themesStore = container.resolve(ThemesStore);

export interface CreateThemeDialogViewModel {
  name: string;
  canSubmit: boolean;
  showNameError: boolean;
  onOkClick: () => void;
  onCancelClick: () => void;
  onNameChange: (value: string) => void;
}

export function useCreateThemeDialogViewModel(): CreateThemeDialogViewModel {
  const dispatch = useAppDispatch();
  const name = useStore(themesStore.api, (state): string => state.state.createFormName);
  const nameValid = useMemo(() => name.length > 0 && NAME_REGEX.test(name), [name]);
  const canSubmit = useMemo(() => nameValid, [nameValid]);

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
    name,
    canSubmit,
    showNameError,
    onOkClick,
    onCancelClick,
    onNameChange,
  };
}

