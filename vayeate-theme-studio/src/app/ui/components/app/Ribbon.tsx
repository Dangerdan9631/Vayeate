import type { MouseEvent } from 'react';
import { TAB_DEFINITIONS, type TabId } from '../../tabs';

interface RibbonProps {
  activeTab: TabId;
  onTabChange: (tabId: TabId) => void;
}

export function Ribbon({ activeTab, onTabChange }: RibbonProps) {
  function handleTabClick(e: MouseEvent<HTMLButtonElement>) {
    const tabId = e.currentTarget.dataset.tabId as TabId;
    onTabChange(tabId);
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
