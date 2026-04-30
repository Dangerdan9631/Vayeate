import type { MouseEvent } from 'react';
import type { TabId } from '../../../model/app-ui';
import { useRibbonViewModel } from './use-ribbon-viewmodel';

type TabDefinition = {
  id: TabId;
  label: string;
  iconName: string;
};

const TAB_DEFINITIONS: TabDefinition[] = [
  { id: 'catalogs', label: 'Catalogs', iconName: 'library_books' },
  { id: 'templates', label: 'Templates', iconName: 'sticky_note_2' },
  { id: 'themes', label: 'Themes', iconName: 'color_lens' },
];

interface RibbonProps {
  activeTab: TabId;
}

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
