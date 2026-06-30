/**
 * In-progress fields for the create-template dialog.
 */
export interface CreateTemplateDialogState {
  isCreating: boolean;
  isOpen: boolean;
  name: string;
}

/**
 * Default create-template dialog data used when opening a new dialog session.
 */
export const emptyCreateTemplateData: CreateTemplateDialogState = {
  isCreating: false,
  isOpen: false,
  name: '',
};
