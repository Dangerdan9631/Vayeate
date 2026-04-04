import type { TabId } from '../../domain/state/ui/ui-state';

export type { TabId };

export type TabDefinition = {
  id: TabId;
  label: string;
  iconName: string;
};

export const TAB_DEFINITIONS: TabDefinition[] = [
  { id: 'catalogs', label: 'Catalogs', iconName: 'library_books' },
  { id: 'templates', label: 'Templates', iconName: 'sticky_note_2' },
  { id: 'themes', label: 'Themes', iconName: 'color_lens' },
];
