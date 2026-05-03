export interface CreateTemplateDialogState {
  isCreating: boolean;
  isOpen: boolean;
  name: string;
}

export const emptyCreateTemplateData: CreateTemplateDialogState = {
  isCreating: false,
  isOpen: false,
  name: '',
};
