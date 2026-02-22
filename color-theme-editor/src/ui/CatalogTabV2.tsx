import { useState } from "react";
import type { Catalog, CatalogTarget } from "../domain/types";

export interface CatalogTabV2Props {
  catalogs: Catalog[];
  selectedCatalogName: string | null;
  onSelectCatalog: (name: string) => void;
  onCreateCatalog: (name: string, source: "remote" | "manual") => void;
  onSyncCatalog: (name: string, updateVersion: boolean) => Promise<void>;
  onAddKey: (catalogName: string, target: CatalogTarget, key: string) => Promise<void>;
  onRemoveKey: (catalogName: string, target: CatalogTarget, key: string) => Promise<void>;
  onSaveCatalog: (catalog: Catalog) => Promise<void>;
  onUpdateSource: (catalogName: string, field: "themeColorRegistryUrl" | "semanticTokenRegistryUrl" | "scopeGuidanceUrl", value: string) => void;
  busy: boolean;
  error: string;
}

export function CatalogTabV2({
  catalogs,
  selectedCatalogName,
  onSelectCatalog,
  onCreateCatalog,
  onSyncCatalog,
  onAddKey,
  onRemoveKey,
  onSaveCatalog,
  onUpdateSource,
  busy,
  error,
}: CatalogTabV2Props): JSX.Element {
  const [newCatalogName, setNewCatalogName] = useState("");
  const [newCatalogSource, setNewCatalogSource] = useState<"remote" | "manual">("manual");
  const [newKeyTarget, setNewKeyTarget] = useState<CatalogTarget>("colors");
  const [newKeyValue, setNewKeyValue] = useState("");
  
  const selectedCatalog = catalogs.find((c) => c.name === selectedCatalogName) || null;
  const isRemote = selectedCatalog?.source === "remote";
  const isManual = selectedCatalog?.source === "manual";

  const handleCreateCatalog = () => {
    if (newCatalogName.trim()) {
      onCreateCatalog(newCatalogName.trim(), newCatalogSource);
      setNewCatalogName("");
    }
  };

  const handleAddKey = () => {
    if (selectedCatalogName && newKeyValue.trim()) {
      void onAddKey(selectedCatalogName, newKeyTarget, newKeyValue.trim());
      setNewKeyValue("");
    }
  };

  const handleRemoveKey = (target: CatalogTarget, key: string) => {
    if (selectedCatalogName) {
      void onRemoveKey(selectedCatalogName, target, key);
    }
  };

  const handleSyncCatalog = (updateVersion: boolean) => {
    if (selectedCatalogName) {
      void onSyncCatalog(selectedCatalogName, updateVersion);
    }
  };

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {/* Catalog Selection */}
      <article style={{ border: "1px solid #d0d0d0", borderRadius: 8, padding: 12 }}>
        <h2 style={{ margin: "0 0 10px", fontSize: 16 }}>Catalogs</h2>
        <div style={{ display: "grid", gap: 8 }}>
          <label>
            Select Catalog
            <select
              value={selectedCatalogName || ""}
              onChange={(e) => onSelectCatalog(e.target.value)}
              style={{ width: "100%" }}
            >
              <option value="">-- Select Catalog --</option>
              {catalogs.map((catalog) => (
                <option key={catalog.name} value={catalog.name}>
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
              <div>
                <strong>Version:</strong> {selectedCatalog.version}
              </div>
              <div>
                <strong>Source:</strong> {selectedCatalog.source}
              </div>
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
                <h3 style={{ margin: "0 0 8px", fontSize: 14 }}>Remote Sources</h3>
                <div style={{ display: "grid", gap: 8 }}>
                  <label style={{ fontSize: 12 }}>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>Colors Registry URL</div>
                    <input
                      type="text"
                      value={selectedCatalog.sources?.themeColorRegistryUrl || ""}
                      onChange={(e) => onUpdateSource(selectedCatalogName, "themeColorRegistryUrl", e.target.value)}
                      placeholder="https://..."
                      style={{ width: "100%", fontSize: 12 }}
                    />
                  </label>
                  <label style={{ fontSize: 12 }}>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>Semantic Tokens Registry URL</div>
                    <input
                      type="text"
                      value={selectedCatalog.sources?.semanticTokenRegistryUrl || ""}
                      onChange={(e) => onUpdateSource(selectedCatalogName, "semanticTokenRegistryUrl", e.target.value)}
                      placeholder="https://..."
                      style={{ width: "100%", fontSize: 12 }}
                    />
                  </label>
                  <label style={{ fontSize: 12 }}>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>Scope Guidance URL</div>
                    <input
                      type="text"
                      value={selectedCatalog.sources?.scopeGuidanceUrl || ""}
                      onChange={(e) => onUpdateSource(selectedCatalogName, "scopeGuidanceUrl", e.target.value)}
                      placeholder="https://..."
                      style={{ width: "100%", fontSize: 12 }}
                    />
                  </label>
                  <button 
                    type="button" 
                    onClick={() => void onSaveCatalog(selectedCatalog)} 
                    disabled={busy}
                    style={{ marginTop: 4 }}
                  >
                    Save Sources
                  </button>
                </div>
              </div>
            )}

            {isRemote && (
              <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                <button type="button" onClick={() => handleSyncCatalog(false)} disabled={busy}>
                  Sync (Keep Version)
                </button>
                <button type="button" onClick={() => handleSyncCatalog(true)} disabled={busy}>
                  Sync (Update Version)
                </button>
              </div>
            )}
          </article>

          {/* Add/Remove Keys (Manual only) */}
          {isManual && (
            <article style={{ border: "1px solid #d0d0d0", borderRadius: 8, padding: 12 }}>
              <h2 style={{ margin: "0 0 10px", fontSize: 16 }}>Add Key</h2>
              <div style={{ display: "grid", gap: 8 }}>
                <div style={{ display: "flex", gap: 8 }}>
                  <select value={newKeyTarget} onChange={(e) => setNewKeyTarget(e.target.value as CatalogTarget)}>
                    <option value="colors">Colors</option>
                    <option value="semanticTokens">Semantic Tokens</option>
                    <option value="textMateScopes">TextMate Scopes</option>
                  </select>
                  <input
                    placeholder="Key name (e.g., editor.background)"
                    value={newKeyValue}
                    onChange={(e) => setNewKeyValue(e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <button type="button" onClick={handleAddKey} disabled={!newKeyValue.trim() || busy}>
                    Add
                  </button>
                </div>
              </div>
            </article>
          )}

          {/* Keys Display */}
          <article style={{ border: "1px solid #d0d0d0", borderRadius: 8, padding: 12 }}>
            <h2 style={{ margin: "0 0 10px", fontSize: 16 }}>Keys</h2>
            
            {/* Colors */}
            <div style={{ marginBottom: 12 }}>
              <h3 style={{ margin: "0 0 6px", fontSize: 14 }}>Colors ({selectedCatalog.keys.colors.length})</h3>
              <div style={{ maxHeight: 150, overflow: "auto", fontSize: 12, border: "1px solid #e1e1e1", borderRadius: 4, padding: 8 }}>
                {selectedCatalog.keys.colors.length > 0 ? (
                  selectedCatalog.keys.colors.map((key) => (
                    <div key={key} style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}>
                      <span>{key}</span>
                      {isManual && (
                        <button
                          type="button"
                          onClick={() => handleRemoveKey("colors", key)}
                          style={{ fontSize: 11, padding: "1px 6px" }}
                          disabled={busy}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div style={{ color: "#666" }}>No color keys</div>
                )}
              </div>
            </div>

            {/* Semantic Tokens */}
            <div style={{ marginBottom: 12 }}>
              <h3 style={{ margin: "0 0 6px", fontSize: 14 }}>Semantic Tokens ({selectedCatalog.keys.semanticTokens.length})</h3>
              <div style={{ maxHeight: 150, overflow: "auto", fontSize: 12, border: "1px solid #e1e1e1", borderRadius: 4, padding: 8 }}>
                {selectedCatalog.keys.semanticTokens.length > 0 ? (
                  selectedCatalog.keys.semanticTokens.map((key) => (
                    <div key={key} style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}>
                      <span>{key}</span>
                      {isManual && (
                        <button
                          type="button"
                          onClick={() => handleRemoveKey("semanticTokens", key)}
                          style={{ fontSize: 11, padding: "1px 6px" }}
                          disabled={busy}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div style={{ color: "#666" }}>No semantic token keys</div>
                )}
              </div>
            </div>

            {/* TextMate Scopes */}
            <div>
              <h3 style={{ margin: "0 0 6px", fontSize: 14 }}>TextMate Scopes ({selectedCatalog.keys.textMateScopes.length})</h3>
              <div style={{ maxHeight: 150, overflow: "auto", fontSize: 12, border: "1px solid #e1e1e1", borderRadius: 4, padding: 8 }}>
                {selectedCatalog.keys.textMateScopes.length > 0 ? (
                  selectedCatalog.keys.textMateScopes.map((key) => (
                    <div key={key} style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}>
                      <span>{key}</span>
                      {isManual && (
                        <button
                          type="button"
                          onClick={() => handleRemoveKey("textMateScopes", key)}
                          style={{ fontSize: 11, padding: "1px 6px" }}
                          disabled={busy}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div style={{ color: "#666" }}>No TextMate scope keys</div>
                )}
              </div>
            </div>
          </article>
        </>
      ) : (
        <article style={{ border: "1px solid #d0d0d0", borderRadius: 8, padding: 12 }}>
          <p style={{ margin: 0, color: "#666" }}>Select a catalog to view and edit keys.</p>
        </article>
      )}

      {error && (
        <div style={{ padding: 12, background: "#ffeef2", border: "1px solid #b00020", borderRadius: 6, color: "#b00020" }}>
          {error}
        </div>
      )}
    </div>
  );
}
