/**
 * In-progress fields for the create-theme dialog.
 */
export interface ThemeCreateDialogState {
  isCreating: boolean;
  isOpen: boolean;
  name: string;
}

/**
 * Default create-theme dialog state when closed.
 */
export const initialThemeCreateDialogState: ThemeCreateDialogState = {
  isCreating: false,
  isOpen: false,
  name: '',
};
