import { TAB_DEFINITIONS, type TabId } from '../tabs';

interface RibbonProps {
  activeTab: TabId;
  onTabChange: (tabId: TabId) => void;
}

export function Ribbon({ activeTab, onTabChange }: RibbonProps) {
  return (
    <aside className="ribbon">
      {TAB_DEFINITIONS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className="ribbon-tab"
          title={tab.label}
          aria-label={tab.label}
          aria-pressed={tab.id === activeTab}
          onClick={() => onTabChange(tab.id)}
        >
          <span className="material-symbols-outlined ribbon-icon">{tab.iconName}</span>
        </button>
      ))}
    </aside>
  );
}
