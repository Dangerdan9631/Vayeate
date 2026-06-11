import type { MouseEvent } from 'react';
import type { TabId } from '../../../model/app-ui';
import { useRibbonViewModel } from './use-ribbon-viewmodel';

/**
 * Display metadata for one primary navigation tab in the ribbon.
 */
type TabDefinition = {
  id: TabId;
  label: string;
  iconName: string;
};

/**
 * Static tab order and labels for catalogs, templates, and themes.
 */
const TAB_DEFINITIONS: TabDefinition[] = [
  { id: 'catalogs', label: 'Catalogs', iconName: 'library_books' },
  { id: 'templates', label: 'Templates', iconName: 'sticky_note_2' },
  { id: 'themes', label: 'Themes', iconName: 'color_lens' },
];

/**
 * Props for the vertical ribbon tab strip.
 */
interface RibbonProps {
  activeTab: TabId;
}

/**
 * Vertical tab strip for switching the main content area between primary pages.
 */
export function Ribbon({ activeTab }: RibbonProps) {
  const viewModel = useRibbonViewModel();

  function handleTabClick(e: MouseEvent<HTMLButtonElement>) {
    const tabId = e.currentTarget.dataset.tabId as TabId;
    viewModel.onRibbonTabButtonClick(tabId);
  }

  return (
    <aside className="ribbon">
      {TAB_DEFINITIONS.map((tab) => (
        <button
          key={tab.id}
          data-tab-id={tab.id}
          type="button"
          className="ribbon-tab"
          title={tab.label}
          aria-label={tab.label}
          aria-pressed={tab.id === activeTab}
          onClick={handleTabClick}
        >
          <span className="material-symbols-outlined ribbon-icon">{tab.iconName}</span>
        </button>
      ))}
    </aside>
  );
}
