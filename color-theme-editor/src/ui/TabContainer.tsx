import { ReactNode } from "react";

export interface TabDefinition {
  id: string;
  label: string;
  content: ReactNode;
}

export interface TabContainerProps {
  tabs: TabDefinition[];
  activeTabId: string;
  onTabChange: (tabId: string) => void;
}

export function TabContainer({ tabs, activeTabId, onTabChange }: TabContainerProps): JSX.Element {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1, minHeight: 0, overflow: "hidden" }}>
      <nav style={{ display: "flex", gap: 4, borderBottom: "2px solid #d0d0d0" }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            style={{
              padding: "10px 20px",
              border: "none",
              borderBottom: activeTabId === tab.id ? "3px solid #0066cc" : "3px solid transparent",
              background: activeTabId === tab.id ? "#f5f5f5" : "transparent",
              cursor: "pointer",
              fontWeight: activeTabId === tab.id ? 600 : 400,
              color: activeTabId === tab.id ? "#0066cc" : "#1f1f1f",
              fontSize: 14,
              transition: "all 0.2s",
            }}
          >
            {tab.label}
          </button>
        ))}
      </nav>
      <div style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>{tabs.find((tab) => tab.id === activeTabId)?.content}</div>
    </div>
  );
}
