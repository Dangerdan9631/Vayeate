export interface ThemeCreateDialogState {
  isCreating: boolean;
  isOpen: boolean;
  name: string;
}

export const initialThemeCreateDialogState: ThemeCreateDialogState = {
  isCreating: false,
  isOpen: false,
  name: '',
};
