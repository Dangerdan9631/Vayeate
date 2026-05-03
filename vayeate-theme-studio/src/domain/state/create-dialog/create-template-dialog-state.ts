export interface CreateTemplateDialogState {
  isOpen: boolean;
  name: string;
}

export const emptyCreateTemplateData: CreateTemplateDialogState = {
  isOpen: false,
  name: '',
};
