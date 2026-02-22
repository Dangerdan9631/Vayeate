import type {
  CatalogPin,
  CatalogRemoteSnapshot,
  CatalogSnapshot,
  CatalogValidationReport,
  ElementBinding,
  ThemeTemplate,
} from "../domain/types";

export interface CatalogTabProps {
  catalogPin: CatalogPin | null;
  catalogPinDraft: CatalogPin | null;
  catalogSnapshot: CatalogSnapshot | null;
  catalogRemoteSnapshot: CatalogRemoteSnapshot | null;
  catalogReport: CatalogValidationReport | null;
  catalogBindingTarget: ElementBinding["target"];
  catalogBindingKey: string;
  catalogBusy: boolean;
  catalogError: string;
  catalogKeyOptions: string[];
  template: ThemeTemplate;
  setCatalogBindingTarget: (target: ElementBinding["target"]) => void;
  setCatalogBindingKey: (key: string) => void;
  updateCatalogPinField: (field: "pinnedVersion" | "updatePolicy", value: string) => void;
  updateCatalogPinSource: (
    field: "themeColorRegistryUrl" | "semanticTokenRegistryUrl" | "scopeGuidanceUrl",
    value: string,
  ) => void;
  refreshCatalogStatus: () => Promise<void>;
  handleSaveCatalogPin: () => Promise<void>;
  setCatalogPinDraft: (pin: CatalogPin | null) => void;
  handleSyncCatalog: () => Promise<void>;
  addCatalogBinding: (key: string) => void;
  addAllMissingCatalogBindings: () => void;
  handleApplyFullCoverage: () => void;
}

export function CatalogTab({
  catalogPin,
  catalogPinDraft,
  catalogSnapshot,
  catalogRemoteSnapshot,
  catalogReport,
  catalogBindingTarget,
  catalogBindingKey,
  catalogBusy,
  catalogError,
  catalogKeyOptions,
  template,
  setCatalogBindingTarget,
  setCatalogBindingKey,
  updateCatalogPinField,
  updateCatalogPinSource,
  refreshCatalogStatus,
  handleSaveCatalogPin,
  setCatalogPinDraft,
  handleSyncCatalog,
  addCatalogBinding,
  addAllMissingCatalogBindings,
  handleApplyFullCoverage,
}: CatalogTabProps): JSX.Element {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <article style={{ border: "1px solid #d0d0d0", borderRadius: 8, padding: 12 }}>
        <h2 style={{ margin: "0 0 10px", fontSize: 16 }}>Catalog Pin Configuration</h2>
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <button type="button" onClick={() => void refreshCatalogStatus()} disabled={catalogBusy}>
            Refresh Status
          </button>
          <button type="button" onClick={() => void handleSaveCatalogPin()} disabled={catalogBusy || !catalogPinDraft}>
            Save Pin
          </button>
          <button type="button" onClick={() => setCatalogPinDraft(catalogPin)} disabled={catalogBusy || !catalogPin}>
            Reset Pin Draft
          </button>
          <button type="button" onClick={() => void handleSyncCatalog()} disabled={catalogBusy}>
            Sync Snapshot
          </button>
        </div>
        {catalogPinDraft ? (
          <div style={{ fontSize: 12, marginBottom: 8, display: "grid", gap: 6 }}>
            <label>
              Pinned version
              <input
                value={catalogPinDraft.pinnedVersion}
                onChange={(event) => updateCatalogPinField("pinnedVersion", event.target.value)}
                style={{ width: "100%" }}
              />
            </label>
            <label>
              Update policy
              <select
                value={catalogPinDraft.updatePolicy}
                onChange={(event) => updateCatalogPinField("updatePolicy", event.target.value)}
                style={{ width: "100%" }}
              >
                <option value="manual">manual</option>
                <option value="scheduled">scheduled</option>
              </select>
            </label>
            <label>
              Theme Color Registry URL
              <input
                value={catalogPinDraft.sources.themeColorRegistryUrl}
                onChange={(event) => updateCatalogPinSource("themeColorRegistryUrl", event.target.value)}
                style={{ width: "100%" }}
              />
            </label>
            <label>
              Semantic Token Registry URL
              <input
                value={catalogPinDraft.sources.semanticTokenRegistryUrl}
                onChange={(event) => updateCatalogPinSource("semanticTokenRegistryUrl", event.target.value)}
                style={{ width: "100%" }}
              />
            </label>
            <label>
              Scope Guidance URL
              <input
                value={catalogPinDraft.sources.scopeGuidanceUrl}
                onChange={(event) => updateCatalogPinSource("scopeGuidanceUrl", event.target.value)}
                style={{ width: "100%" }}
              />
            </label>
          </div>
        ) : null}
        {catalogError ? <p style={{ margin: 0, color: "#b00020" }}>{catalogError}</p> : null}
      </article>

      <article style={{ border: "1px solid #d0d0d0", borderRadius: 8, padding: 12 }}>
        <h2 style={{ margin: "0 0 10px", fontSize: 16 }}>Catalog Snapshot Status</h2>
        {catalogSnapshot ? (
          <div style={{ fontSize: 12, marginBottom: 8 }}>
            <div>Generated: {catalogSnapshot.generatedAt}</div>
            <div>Source mode: {catalogSnapshot.source}</div>
            <div>Color keys: {catalogSnapshot.colorKeys.length}</div>
            <div>Semantic tokens: {catalogSnapshot.semanticTokenKeys.length}</div>
            <div>TextMate scopes: {catalogSnapshot.textMateScopes.length}</div>
          </div>
        ) : (
          <p style={{ margin: "0 0 8px", fontSize: 12, color: "#666" }}>
            No snapshot yet. Run <strong>Sync Snapshot</strong> to create `catalog/snapshot.json` and
            `catalog/report.json`.
          </p>
        )}
        {catalogRemoteSnapshot ? (
          <div style={{ fontSize: 12, marginBottom: 8 }}>
            <div>Remote fetched: {catalogRemoteSnapshot.fetchedAt}</div>
            <div>Remote color keys: {catalogRemoteSnapshot.colorKeys.length}</div>
            <div>Remote semantic tokens: {catalogRemoteSnapshot.semanticTokenKeys.length}</div>
            <div>Remote TextMate scopes: {catalogRemoteSnapshot.textMateScopes.length}</div>
          </div>
        ) : (
          <div style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>Remote snapshot is not available yet.</div>
        )}
      </article>

      <article style={{ border: "1px solid #d0d0d0", borderRadius: 8, padding: 12 }}>
        <h2 style={{ margin: "0 0 10px", fontSize: 16 }}>Validation Report</h2>
        {catalogReport ? (
          <div style={{ fontSize: 12 }}>
            <div style={{ color: catalogReport.valid ? "#0b5f2a" : "#b00020", marginBottom: 4 }}>
              Validation: {catalogReport.valid ? "valid" : "has errors"}
            </div>
            <div style={{ marginBottom: 4 }}>
              Drift (remote-only): colors={catalogReport.stats.remoteOnlyColorKeys}, semantic=
              {catalogReport.stats.remoteOnlySemanticTokenKeys}, scopes={catalogReport.stats.remoteOnlyTextMateScopes}
            </div>
            <div style={{ marginBottom: 4 }}>
              Unique (local-only): colors={catalogReport.stats.localOnlyColorKeys}, semantic=
              {catalogReport.stats.localOnlySemanticTokenKeys}, scopes={catalogReport.stats.localOnlyTextMateScopes}
            </div>
            {catalogReport.issues.length > 0 ? (
              <div style={{ marginTop: 8 }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>Issues:</div>
                {catalogReport.issues.map((issue, index) => (
                  <div
                    key={index}
                    style={{
                      padding: 6,
                      border: "1px solid #e1e1e1",
                      borderRadius: 4,
                      marginBottom: 4,
                      background: issue.severity === "error" ? "#ffeef2" : "#fff9e6",
                    }}
                  >
                    <div style={{ fontWeight: 600 }}>
                      {issue.severity.toUpperCase()} ({issue.code})
                    </div>
                    <div>{issue.message}</div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ) : (
          <p style={{ margin: 0, fontSize: 12, color: "#666" }}>
            Validation report will appear after catalog sync.
          </p>
        )}
      </article>

      <article style={{ border: "1px solid #d0d0d0", borderRadius: 8, padding: 12 }}>
        <h2 style={{ margin: "0 0 10px", fontSize: 16 }}>Quick Add Catalog Bindings</h2>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
          <label>
            Target
            <select
              value={catalogBindingTarget}
              onChange={(event) => setCatalogBindingTarget(event.target.value as ElementBinding["target"])}
              style={{ marginLeft: 6 }}
            >
              <option value="colors">colors</option>
              <option value="tokenColors">tokenColors</option>
              <option value="semanticTokenColors">semanticTokenColors</option>
            </select>
          </label>
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <input
            placeholder="Enter catalog key or select from dropdown"
            value={catalogBindingKey}
            onChange={(event) => setCatalogBindingKey(event.target.value)}
            style={{ flex: 1 }}
          />
          <button type="button" onClick={() => addCatalogBinding(catalogBindingKey)}>
            Add Single
          </button>
        </div>
        {catalogSnapshot && catalogKeyOptions.length > 0 ? (
          <div style={{ marginBottom: 8 }}>
            <label>
              Available keys ({catalogKeyOptions.length})
              <select
                value={catalogBindingKey}
                onChange={(event) => setCatalogBindingKey(event.target.value)}
                style={{ width: "100%", marginTop: 4 }}
                size={5}
              >
                {catalogKeyOptions.map((key) => (
                  <option key={key} value={key}>
                    {key}
                  </option>
                ))}
              </select>
            </label>
          </div>
        ) : null}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button type="button" onClick={addAllMissingCatalogBindings} disabled={!catalogSnapshot}>
            Add All Missing (Target)
          </button>
          <button type="button" onClick={handleApplyFullCoverage} disabled={!catalogSnapshot}>
            Apply Full Coverage
          </button>
        </div>
        <p style={{ margin: "8px 0 0", fontSize: 12, color: "#666" }}>
          <strong>Add All Missing</strong> covers the selected target. <strong>Full Coverage</strong> covers all
          targets.
        </p>
        <p style={{ margin: "4px 0 0", fontSize: 12, color: "#666" }}>
          Current bindings: {template.bindings.filter((b) => b.target === catalogBindingTarget).length} of{" "}
          {catalogKeyOptions.length} for {catalogBindingTarget}.
        </p>
      </article>
    </div>
  );
}
