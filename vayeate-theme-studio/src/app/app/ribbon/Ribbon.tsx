import type { MouseEvent } from 'react';
import type { TabId } from '../../../domain/state/ui/ui-state';
import { useAppDispatch } from '../../core/action-queue/use-app-dispatch';
import { AppRibbonActionType } from './actions/app-ribbon-action-type';

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
  const dispatch = useAppDispatch();

  function handleTabClick(e: MouseEvent<HTMLButtonElement>) {
    const tabId = e.currentTarget.dataset.tabId as TabId;
    dispatch({ type: AppRibbonActionType.TabButtonOnClick, tabId });
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
