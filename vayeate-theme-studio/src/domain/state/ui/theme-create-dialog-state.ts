export type ThemeCreateDialogMode = 'create' | 'duplicate';

/**
 * In-progress fields for the create-theme dialog.
 */
export interface ThemeCreateDialogState {
  isCreating: boolean;
  isOpen: boolean;
  mode: ThemeCreateDialogMode;
  name: string;
}

/**
 * Default create-theme dialog state when closed.
 */
export const initialThemeCreateDialogState: ThemeCreateDialogState = {
  isCreating: false,
  isOpen: false,
  mode: 'create',
  name: '',
};
