import { useState } from "react";
import type { Catalog, CatalogTarget } from "../domain/types";

export interface CatalogTabV2Props {
  catalogs: Catalog[];
  selectedCatalogRef: string | null;
  onSelectCatalog: (catalogRef: string) => void;
  onCreateCatalog: (name: string, source: "remote" | "manual") => void;
  onSyncCatalog: (catalog: Catalog) => Promise<void>;
  onDeleteCatalogVersion: (catalog: Catalog) => Promise<void>;
  onLockCatalogVersion: (catalog: Catalog) => Promise<void>;
  onAddKey: (catalog: Catalog, target: CatalogTarget, key: string) => Promise<void>;
  onRemoveKey: (catalog: Catalog, target: CatalogTarget, key: string) => Promise<void>;
  onSaveCatalog: (catalog: Catalog) => Promise<void>;
  onUpdateSource: (catalog: Catalog, field: "themeColorRegistryUrl" | "semanticTokenRegistryUrl" | "scopeGuidanceUrl", value: string) => void;
  busy: boolean;
  error: string;
}

export function CatalogTabV2({
  catalogs,
  selectedCatalogRef,
  onSelectCatalog,
  onCreateCatalog,
  onSyncCatalog,
  onDeleteCatalogVersion,
  onLockCatalogVersion,
  onAddKey,
  onRemoveKey,
  onSaveCatalog,
  onUpdateSource,
  busy,
  error,
}: CatalogTabV2Props): JSX.Element {
  const [newCatalogName, setNewCatalogName] = useState("");
  const [newCatalogSource, setNewCatalogSource] = useState<"remote" | "manual">("manual");
  const [newColorKey, setNewColorKey] = useState("");
  const [newSemanticKey, setNewSemanticKey] = useState("");
  const [newScopeKey, setNewScopeKey] = useState("");

  const toCatalogRef = (catalog: Catalog): string => `${catalog.name}@${catalog.version}`;
  
  const selectedCatalog = catalogs.find((c) => toCatalogRef(c) === selectedCatalogRef) || null;
  const isRemote = selectedCatalog?.source === "remote";
  const isManual = selectedCatalog?.source === "manual";
  const isLocked = Boolean(selectedCatalog?.locked);

  const handleCreateCatalog = () => {
    if (newCatalogName.trim()) {
      onCreateCatalog(newCatalogName.trim(), newCatalogSource);
      setNewCatalogName("");
    }
  };

  const handleAddKey = (target: CatalogTarget) => {
    if (!selectedCatalog) {
      return;
    }

    if (target === "colors" && newColorKey.trim()) {
      void onAddKey(selectedCatalog, target, newColorKey.trim());
      setNewColorKey("");
      return;
    }

    if (target === "semanticTokens" && newSemanticKey.trim()) {
      void onAddKey(selectedCatalog, target, newSemanticKey.trim());
      setNewSemanticKey("");
      return;
    }

    if (target === "textMateScopes" && newScopeKey.trim()) {
      void onAddKey(selectedCatalog, target, newScopeKey.trim());
      setNewScopeKey("");
    }
  };

  const handleRemoveKey = (target: CatalogTarget, key: string) => {
    if (selectedCatalog) {
      void onRemoveKey(selectedCatalog, target, key);
    }
  };

  const handleSyncCatalog = () => {
    if (selectedCatalog) {
      void onSyncCatalog(selectedCatalog);
    }
  };

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12, alignItems: "start" }}>
        <div style={{ display: "grid", gap: 12 }}>
          {/* Catalog Selection */}
          <article style={{ border: "1px solid #d0d0d0", borderRadius: 8, padding: 12 }}>
            <h2 style={{ margin: "0 0 10px", fontSize: 16 }}>Catalogs</h2>
            <div style={{ display: "grid", gap: 8 }}>
              <label>
                Select Catalog
                <select
                  value={selectedCatalogRef || ""}
                  onChange={(e) => onSelectCatalog(e.target.value)}
                  style={{ width: "100%" }}
                >
                  <option value="">-- Select Catalog --</option>
                  {catalogs.map((catalog) => (
                    <option key={toCatalogRef(catalog)} value={toCatalogRef(catalog)}>
                      {catalog.name} ({catalog.source}) - v{catalog.version}
                    </option>
                  ))}
                </select>
              </label>

              {/* Create New Catalog */}
              <div style={{ borderTop: "1px solid #e1e1e1", paddingTop: 8, marginTop: 4 }}>
                <h3 style={{ margin: "0 0 8px", fontSize: 14 }}>Create New Catalog</h3>
                <div style={{ display: "grid", gap: 6 }}>
                  <input
                    placeholder="Catalog name"
                    value={newCatalogName}
                    onChange={(e) => setNewCatalogName(e.target.value)}
                    style={{ width: "100%" }}
                  />
                  <div style={{ display: "flex", gap: 12 }}>
                    <label>
                      <input
                        type="radio"
                        checked={newCatalogSource === "manual"}
                        onChange={() => setNewCatalogSource("manual")}
                      />{" "}
                      Manual (Editable)
                    </label>
                    <label>
                      <input
                        type="radio"
                        checked={newCatalogSource === "remote"}
                        onChange={() => setNewCatalogSource("remote")}
                      />{" "}
                      Remote (Read-only)
                    </label>
                  </div>
                  <button type="button" onClick={handleCreateCatalog} disabled={!newCatalogName.trim() || busy}>
                    Create Catalog
                  </button>
                </div>
              </div>
            </div>
          </article>

          {selectedCatalog ? (
            <>
            {/* Catalog Info */}
            <article style={{ border: "1px solid #d0d0d0", borderRadius: 8, padding: 12 }}>
              <h2 style={{ margin: "0 0 10px", fontSize: 16 }}>
                {selectedCatalog.name}{" "}
                <span style={{ fontSize: 12, fontWeight: 400, color: isRemote ? "#b00020" : "#0b5f2a" }}>
                  ({isRemote ? "Remote - Read Only" : "Manual - Editable"})
                </span>
              </h2>
              <div style={{ display: "grid", gap: 6, fontSize: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                  <span><strong>Version:</strong> {selectedCatalog.version}</span>
                  <button type="button" onClick={() => void onDeleteCatalogVersion(selectedCatalog)} disabled={busy}>
                    Delete Version
                  </button>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                  <span><strong>Source:</strong> {selectedCatalog.source}</span>
                  {isRemote && (
                    <button type="button" onClick={handleSyncCatalog} disabled={busy}>
                      Sync
                    </button>
                  )}
                </div>
                {isManual && (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                    <span><strong>Locked:</strong> {isLocked ? "Yes" : "No"}</span>
                    {!isLocked && (
                      <button type="button" onClick={() => void onLockCatalogVersion(selectedCatalog)} disabled={busy}>
                        Lock Version
                      </button>
                    )}
                  </div>
                )}
                <div>
                  <strong>Colors:</strong> {selectedCatalog.keys.colors.length}
                </div>
                <div>
                  <strong>Semantic Tokens:</strong> {selectedCatalog.keys.semanticTokens.length}
                </div>
                <div>
                  <strong>TextMate Scopes:</strong> {selectedCatalog.keys.textMateScopes.length}
                </div>
              </div>

              {isRemote && (
                <div style={{ marginTop: 12, borderTop: "1px solid #e1e1e1", paddingTop: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, gap: 8 }}>
                    <h3 style={{ margin: 0, fontSize: 14 }}>Remote Sources</h3>
                    <button
                      type="button"
                      onClick={() => void onSaveCatalog(selectedCatalog)}
                      disabled={busy}
                    >
                      Save Sources
                    </button>
                  </div>
                  <div style={{ display: "grid", gap: 8 }}>
                    <label style={{ fontSize: 12 }}>
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>Colors Registry URL</div>
                      <input
                        type="text"
                        value={selectedCatalog.sources?.themeColorRegistryUrl || ""}
                        onChange={(e) => onUpdateSource(selectedCatalog, "themeColorRegistryUrl", e.target.value)}
                        placeholder="https://..."
                        style={{ width: "100%", fontSize: 12 }}
                      />
                    </label>
                    <label style={{ fontSize: 12 }}>
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>Semantic Tokens Registry URL</div>
                      <input
                        type="text"
                        value={selectedCatalog.sources?.semanticTokenRegistryUrl || ""}
                        onChange={(e) => onUpdateSource(selectedCatalog, "semanticTokenRegistryUrl", e.target.value)}
                        placeholder="https://..."
                        style={{ width: "100%", fontSize: 12 }}
                      />
                    </label>
                    <label style={{ fontSize: 12 }}>
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>Scope Guidance URL</div>
                      <input
                        type="text"
                        value={selectedCatalog.sources?.scopeGuidanceUrl || ""}
                        onChange={(e) => onUpdateSource(selectedCatalog, "scopeGuidanceUrl", e.target.value)}
                        placeholder="https://..."
                        style={{ width: "100%", fontSize: 12 }}
                      />
                    </label>
                  </div>
                </div>
              )}
            </article>

            </>
          ) : null}
        </div>

        {/* Keys Display */}
        {selectedCatalog ? (
          <article style={{ border: "1px solid #d0d0d0", borderRadius: 8, padding: 12, display: "flex", flexDirection: "column", maxHeight: "calc(100dvh - 220px)" }}>
            <h2 style={{ margin: "0 0 10px", fontSize: 16 }}>Keys</h2>

            <div style={{ flex: 1, minHeight: 0, overflow: "auto", fontSize: 12, paddingRight: 4 }}>
              <details open style={{ border: "1px solid #e1e1e1", borderRadius: 4, padding: 8, marginBottom: 8 }}>
                <summary style={{ fontWeight: 600, cursor: "pointer" }}>Colors ({selectedCatalog.keys.colors.length})</summary>
                <div style={{ marginTop: 6 }}>
                {isManual && (
                  <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                    <button type="button" onClick={() => handleAddKey("colors")} disabled={!newColorKey.trim() || busy}>
                      Add
                    </button>
                    <input
                      placeholder="Add color key"
                      value={newColorKey}
                      onChange={(e) => setNewColorKey(e.target.value)}
                      style={{ flex: 1 }}
                    />
                  </div>
                )}
                {selectedCatalog.keys.colors.length > 0 ? (
                  selectedCatalog.keys.colors.map((key) => (
                    <div key={key} style={{ display: "flex", alignItems: "center", gap: 8, padding: "2px 0" }}>
                      {isManual && (
                        <button
                          type="button"
                          onClick={() => handleRemoveKey("colors", key)}
                          style={{ marginLeft: "auto", fontSize: 11, padding: "1px 6px" }}
                          disabled={busy}
                        >
                          Remove
                        </button>
                      )}
                      <span style={{ flex: 1, minWidth: 0 }}>{key}</span>
                    </div>
                  ))
                ) : (
                  <div style={{ color: "#666" }}>No color keys</div>
                )}
                </div>
              </details>

              <details open style={{ border: "1px solid #e1e1e1", borderRadius: 4, padding: 8, marginBottom: 8 }}>
                <summary style={{ fontWeight: 600, cursor: "pointer" }}>Semantic Tokens ({selectedCatalog.keys.semanticTokens.length})</summary>
                <div style={{ marginTop: 6 }}>
                {isManual && (
                  <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                    <button type="button" onClick={() => handleAddKey("semanticTokens")} disabled={!newSemanticKey.trim() || busy}>
                      Add
                    </button>
                    <input
                      placeholder="Add semantic token key"
                      value={newSemanticKey}
                      onChange={(e) => setNewSemanticKey(e.target.value)}
                      style={{ flex: 1 }}
                    />
                  </div>
                )}
                {selectedCatalog.keys.semanticTokens.length > 0 ? (
                  selectedCatalog.keys.semanticTokens.map((key) => (
                    <div key={key} style={{ display: "flex", alignItems: "center", gap: 8, padding: "2px 0" }}>
                      {isManual && (
                        <button
                          type="button"
                          onClick={() => handleRemoveKey("semanticTokens", key)}
                          style={{ marginLeft: "auto", fontSize: 11, padding: "1px 6px" }}
                          disabled={busy}
                        >
                          Remove
                        </button>
                      )}
                      <span style={{ flex: 1, minWidth: 0 }}>{key}</span>
                    </div>
                  ))
                ) : (
                  <div style={{ color: "#666" }}>No semantic token keys</div>
                )}
                </div>
              </details>

              <details open style={{ border: "1px solid #e1e1e1", borderRadius: 4, padding: 8 }}>
                <summary style={{ fontWeight: 600, cursor: "pointer" }}>TextMate Scopes ({selectedCatalog.keys.textMateScopes.length})</summary>
                <div style={{ marginTop: 6 }}>
                {isManual && (
                  <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                    <button type="button" onClick={() => handleAddKey("textMateScopes")} disabled={!newScopeKey.trim() || busy}>
                      Add
                    </button>
                    <input
                      placeholder="Add TextMate scope key"
                      value={newScopeKey}
                      onChange={(e) => setNewScopeKey(e.target.value)}
                      style={{ flex: 1 }}
                    />
                  </div>
                )}
                {selectedCatalog.keys.textMateScopes.length > 0 ? (
                  selectedCatalog.keys.textMateScopes.map((key) => (
                    <div key={key} style={{ display: "flex", alignItems: "center", gap: 8, padding: "2px 0" }}>
                      {isManual && (
                        <button
                          type="button"
                          onClick={() => handleRemoveKey("textMateScopes", key)}
                          style={{ marginLeft: "auto", fontSize: 11, padding: "1px 6px" }}
                          disabled={busy}
                        >
                          Remove
                        </button>
                      )}
                      <span style={{ flex: 1, minWidth: 0 }}>{key}</span>
                    </div>
                  ))
                ) : (
                  <div style={{ color: "#666" }}>No TextMate scope keys</div>
                )}
                </div>
              </details>
            </div>
          </article>
        ) : (
          <article style={{ border: "1px solid #d0d0d0", borderRadius: 8, padding: 12 }}>
            <p style={{ margin: 0, color: "#666" }}>Select a catalog to view keys.</p>
          </article>
        )}
      </div>

      {error && (
        <div style={{ padding: 12, background: "#ffeef2", border: "1px solid #b00020", borderRadius: 6, color: "#b00020" }}>
          {error}
        </div>
      )}
    </div>
  );
}
