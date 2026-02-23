import { useState } from "react";
import type { Template_v2, Catalog, CatalogTarget, VariableType } from "../domain/types";

export interface TemplateTabV2Props {
  templates: string[];
  selectedTemplateId: string | null;
  template: Template_v2 | null;
  catalogs: Catalog[];
  onSelectTemplate: (id: string) => void;
  onCreateTemplate: (name: string) => void;
  onLockTemplateVersion: (template: Template_v2) => Promise<void>;
  onMigrateTemplateMappings: (template: Template_v2) => Promise<void>;
  canLockTemplate: boolean;
  onUpdateTemplateName: (name: string) => void;
  onUpdateCatalogRefs: (catalogRefs: string[]) => void;
  onAddColorVariable: (name: string) => void;
  onAddContrastVariable: (name: string, targetRatio: number) => void;
  onRemoveVariable: (variableId: string, variableType: VariableType) => void;
  onSetMappingVariable: (
    editorKey: string,
    target: CatalogTarget,
    variableType: VariableType,
    variableId: string | null
  ) => void;
  busy: boolean;
  error: string;
}

export function TemplateTabV2({
  templates,
  selectedTemplateId,
  template,
  catalogs,
  onSelectTemplate,
  onCreateTemplate,
  onLockTemplateVersion,
  onMigrateTemplateMappings,
  canLockTemplate,
  onUpdateTemplateName,
  onUpdateCatalogRefs,
  onAddColorVariable,
  onAddContrastVariable,
  onRemoveVariable,
  onSetMappingVariable,
  busy,
  error,
}: TemplateTabV2Props): JSX.Element {
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newColorVariableName, setNewColorVariableName] = useState("");
  const [newContrastVariableName, setNewContrastVariableName] = useState("");

  const compareSemverDesc = (left: string, right: string): number => {
    const leftParts = left.split(".").map((part) => Number.parseInt(part, 10) || 0);
    const rightParts = right.split(".").map((part) => Number.parseInt(part, 10) || 0);
    for (let index = 0; index < 3; index += 1) {
      if (leftParts[index] > rightParts[index]) return -1;
      if (leftParts[index] < rightParts[index]) return 1;
    }
    return 0;
  };

  const toCatalogRef = (catalog: Pick<Catalog, "name" | "version">): string => `${catalog.name}@${catalog.version}`;
  const parseCatalogRef = (catalogRef: string): { name: string; version: string } | null => {
    const separatorIndex = catalogRef.lastIndexOf("@");
    if (separatorIndex <= 0 || separatorIndex >= catalogRef.length - 1) {
      return null;
    }
    return {
      name: catalogRef.slice(0, separatorIndex),
      version: catalogRef.slice(separatorIndex + 1),
    };
  };

  const templateEligibleCatalogs = catalogs.filter((catalog) => catalog.source === "remote" || Boolean(catalog.locked));
  const catalogsByName = new Map<string, Catalog[]>();
  for (const catalog of templateEligibleCatalogs) {
    const existing = catalogsByName.get(catalog.name) ?? [];
    existing.push(catalog);
    catalogsByName.set(catalog.name, existing);
  }
  for (const [name, versions] of catalogsByName) {
    catalogsByName.set(name, versions.sort((a, b) => compareSemverDesc(a.version, b.version)));
  }

  const catalogRows = Array.from(catalogsByName.entries())
    .map(([name, versions]) => ({ name, versions }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const catalogByRef = new Map<string, Catalog>();
  for (const catalog of templateEligibleCatalogs) {
    catalogByRef.set(toCatalogRef(catalog), catalog);
  }

  const handleCreateTemplate = () => {
    if (newTemplateName.trim()) {
      onCreateTemplate(newTemplateName.trim());
      setNewTemplateName("");
    }
  };

  const handleAddColorVariableClick = () => {
    if (!newColorVariableName.trim()) {
      return;
    }

    onAddColorVariable(newColorVariableName.trim());
    setNewColorVariableName("");
  };

  const handleAddContrastVariableClick = () => {
    if (!newContrastVariableName.trim()) {
      return;
    }

    onAddContrastVariable(newContrastVariableName.trim(), 4.5);
    setNewContrastVariableName("");
  };

  const resolveCatalogRef = (catalogRef: string): Catalog | null => {
    const parsed = parseCatalogRef(catalogRef);
    if (parsed) {
      return catalogByRef.get(catalogRef) ?? null;
    }
    const byName = catalogsByName.get(catalogRef);
    return byName?.[0] ?? null;
  };

  const updateCatalogSelection = (catalogName: string, include: boolean, selectedVersion?: string) => {
    if (!template) return;

    const nextRefsByName = new Map<string, string>();
    for (const catalogRef of template.catalogRefs) {
      const parsed = parseCatalogRef(catalogRef);
      if (parsed) {
        nextRefsByName.set(parsed.name, catalogRef);
      } else {
        const fallbackCatalog = catalogsByName.get(catalogRef)?.[0];
        if (fallbackCatalog) {
          nextRefsByName.set(catalogRef, toCatalogRef(fallbackCatalog));
        }
      }
    }

    if (!include) {
      nextRefsByName.delete(catalogName);
    } else {
      const matchingCatalog = catalogsByName
        .get(catalogName)
        ?.find((entry) => entry.version === selectedVersion)
        ?? catalogsByName.get(catalogName)?.[0];
      if (!matchingCatalog) {
        return;
      }
      nextRefsByName.set(catalogName, toCatalogRef(matchingCatalog));
    }

    const nextCatalogRefs = catalogRows
      .map((row) => nextRefsByName.get(row.name))
      .filter((catalogRef): catalogRef is string => Boolean(catalogRef));

    onUpdateCatalogRefs(nextCatalogRefs);
  };

  const includedCatalogs = template
    ? template.catalogRefs
        .map((catalogRef) => resolveCatalogRef(catalogRef))
        .filter((catalog): catalog is Catalog => Boolean(catalog))
    : [];

  const includedCatalogsByName = new Map<string, Catalog>();
  for (const catalog of includedCatalogs) {
    if (!includedCatalogsByName.has(catalog.name)) {
      includedCatalogsByName.set(catalog.name, catalog);
    }
  }

  const mappingKeyId = (target: CatalogTarget, editorKey: string): string => `${target}::${editorKey}`;

  const mappingGroups = new Map<string, {
    target: CatalogTarget;
    editorKey: string;
    colorVariableId: string;
    contrastVariableId: string;
  }>();

  if (template) {
    for (const mapping of template.mappings) {
      const id = mappingKeyId(mapping.target, mapping.editorKey);
      const existing = mappingGroups.get(id) ?? {
        target: mapping.target,
        editorKey: mapping.editorKey,
        colorVariableId: "",
        contrastVariableId: "",
      };

      if (mapping.variableType === "color") {
        existing.colorVariableId = mapping.variableId;
      } else {
        existing.contrastVariableId = mapping.variableId;
      }

      mappingGroups.set(id, existing);
    }
  }

  const includedRows: Array<{
    keyId: string;
    elementName: string;
    target: CatalogTarget;
    editorKey: string;
    colorVariableId: string;
    contrastVariableId: string;
    isOrphan: boolean;
  }> = [];

  const includedRowsByKey = new Map<string, {
    keyId: string;
    elementName: string;
    target: CatalogTarget;
    editorKey: string;
    colorVariableId: string;
    contrastVariableId: string;
    isOrphan: boolean;
  }>();

  for (const catalog of Array.from(includedCatalogsByName.values())) {
    const targets: CatalogTarget[] = ["colors", "semanticTokens", "textMateScopes"];
    for (const target of targets) {
      for (const key of catalog.keys[target]) {
        const id = mappingKeyId(target, key);
        if (includedRowsByKey.has(id)) {
          continue;
        }

        const group = mappingGroups.get(id);
        includedRowsByKey.set(id, {
          keyId: id,
          elementName: key,
          target,
          editorKey: key,
          colorVariableId: group?.colorVariableId ?? "",
          contrastVariableId: group?.contrastVariableId ?? "",
          isOrphan: false,
        });
      }
    }
  }

  includedRows.push(...includedRowsByKey.values());

  const includedKeySet = new Set(includedRows.map((row) => row.keyId));
  const orphanRows = Array.from(mappingGroups.entries())
    .filter(([key]) => !includedKeySet.has(key))
    .map(([key, group]) => ({
      keyId: key,
      elementName: group.editorKey,
      target: group.target,
      editorKey: group.editorKey,
      colorVariableId: group.colorVariableId,
      contrastVariableId: group.contrastVariableId,
      isOrphan: true,
    }));

  const mappingRows = [...includedRows, ...orphanRows];
  const targetGroups: CatalogTarget[] = ["colors", "semanticTokens", "textMateScopes"];
  const targetLabel: Record<CatalogTarget, string> = {
    colors: "Colors",
    semanticTokens: "Semantic Tokens",
    textMateScopes: "TextMate Scopes",
  };

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, alignItems: "start" }}>
        <div style={{ display: "grid", gap: 12 }}>
          {/* Template Selection */}
          <article style={{ border: "1px solid #d0d0d0", borderRadius: 8, padding: 12 }}>
            <h2 style={{ margin: "0 0 10px", fontSize: 16 }}>Templates</h2>
            <div style={{ display: "grid", gap: 8 }}>
              <label>
                Select Template
                <select
                  value={selectedTemplateId || ""}
                  onChange={(e) => onSelectTemplate(e.target.value)}
                  style={{ width: "100%" }}
                >
                  <option value="">-- Select Template --</option>
                  {templates.map((id) => (
                    <option key={id} value={id}>
                      {id}
                    </option>
                  ))}
                </select>
              </label>

              {/* Create New Template */}
              <div style={{ borderTop: "1px solid #e1e1e1", paddingTop: 8, marginTop: 4 }}>
                <h3 style={{ margin: "0 0 8px", fontSize: 14 }}>Create New Template</h3>
                <div style={{ display: "grid", gap: 6 }}>
                  <input
                    placeholder="Template name"
                    value={newTemplateName}
                    onChange={(e) => setNewTemplateName(e.target.value)}
                    style={{ width: "100%" }}
                  />
                  <button
                    type="button"
                    onClick={handleCreateTemplate}
                    disabled={!newTemplateName.trim() || busy}
                  >
                    Create Template
                  </button>
                </div>
              </div>

            </div>
          </article>

          {template ? (
            <>
              {/* Template Info */}
              <article style={{ border: "1px solid #d0d0d0", borderRadius: 8, padding: 12 }}>
                <h2 style={{ margin: "0 0 10px", fontSize: 16 }}>Template: {template.name}</h2>
                <div style={{ display: "grid", gap: 8 }}>
                  <label>
                    Name
                    <input
                      value={template.name}
                      onChange={(e) => onUpdateTemplateName(e.target.value)}
                      style={{ width: "100%" }}
                    />
                  </label>
                  <div>
                    <strong>Locked:</strong> {template.locked ? "Yes" : "No"}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                    <span><strong>Version:</strong> {template.version}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <button
                        type="button"
                        onClick={() => void onMigrateTemplateMappings(template)}
                        disabled={busy}
                      >
                        Persist Mapping Migration
                      </button>
                      {!template.locked && (
                        <button type="button" onClick={() => void onLockTemplateVersion(template)} disabled={busy || !canLockTemplate}>
                          Lock Version
                        </button>
                      )}
                    </div>
                  </div>
                  {!canLockTemplate && !template.locked && (
                    <div style={{ fontSize: 12, color: "#b00020" }}>
                      All included catalog elements must have a mapping before locking.
                    </div>
                  )}
                  <div>
                    <strong>Catalogs:</strong> {template.catalogRefs.length}
                  </div>
                  <div>
                    <strong>Variables:</strong> {template.variables.color.length} color,{" "}
                    {template.variables.contrast.length} contrast
                  </div>
                  <div>
                    <strong>Mappings:</strong> {template.mappings.length}
                  </div>
                </div>
              </article>

              {/* Catalog Selection */}
              <article style={{ border: "1px solid #d0d0d0", borderRadius: 8, padding: 12 }}>
                <h2 style={{ margin: "0 0 10px", fontSize: 16 }}>Catalogs</h2>
                <div style={{ display: "grid", gap: 6 }}>
                  {catalogRows.map((row) => {
                    const selectedRef = template.catalogRefs.find((catalogRef) => {
                      const parsed = parseCatalogRef(catalogRef);
                      return parsed ? parsed.name === row.name : catalogRef === row.name;
                    });
                    const selectedCatalog = selectedRef ? resolveCatalogRef(selectedRef) : null;
                    const included = Boolean(selectedCatalog);

                    return (
                      <div
                        key={row.name}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "auto 1fr 140px",
                          gap: 8,
                          alignItems: "center",
                          border: "1px solid #e1e1e1",
                          borderRadius: 4,
                          padding: 8,
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={included}
                          onChange={(e) => updateCatalogSelection(row.name, e.target.checked)}
                          disabled={busy}
                          aria-label={`Include ${row.name}`}
                        />
                        <div>{row.name}</div>
                        <select
                          value={selectedCatalog?.version ?? row.versions[0]?.version ?? ""}
                          onChange={(e) => updateCatalogSelection(row.name, true, e.target.value)}
                          disabled={!included || busy}
                        >
                          {row.versions.map((versionedCatalog) => (
                            <option key={`${row.name}@${versionedCatalog.version}`} value={versionedCatalog.version}>
                              {versionedCatalog.version}
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  })}

                  {catalogRows.length === 0 && (
                    <div style={{ fontSize: 12, color: "#666" }}>
                      No eligible catalogs. Manual catalogs must be locked before template use.
                    </div>
                  )}
                </div>
              </article>
            </>
          ) : (
            <article style={{ border: "1px solid #d0d0d0", borderRadius: 8, padding: 12 }}>
              <p style={{ margin: 0, color: "#666" }}>Select or create a template to view details and catalogs.</p>
            </article>
          )}
        </div>

        {/* Mappings */}
        {template ? (
          <article style={{ border: "1px solid #d0d0d0", borderRadius: 8, padding: 12, display: "flex", flexDirection: "column", maxHeight: "calc(100dvh - 220px)" }}>
            <h2 style={{ margin: "0 0 10px", fontSize: 16 }}>Mappings ({template.mappings.length})</h2>
            <div style={{ flex: 1, minHeight: 0, overflow: "auto", paddingRight: 4 }}>
              <div style={{ display: "grid", gap: 4 }}>
                {targetGroups.map((target) => {
                  const rows = mappingRows.filter((row) => row.target === target);
                  if (rows.length === 0) {
                    return null;
                  }

                  return (
                    <section key={target} style={{ display: "grid", gap: 4 }}>
                      <h3 style={{ margin: "6px 0 2px", fontSize: 12, color: "#555" }}>
                        {targetLabel[target]} ({rows.length})
                      </h3>
                      {rows.map((row) => (
                        <div
                          key={row.keyId}
                          style={{
                            display: "grid",
                            gridTemplateColumns: "minmax(170px, 1fr) 1fr 1fr",
                            gap: 6,
                            padding: "5px 6px",
                            border: "1px solid #e1e1e1",
                            borderRadius: 4,
                            alignItems: "center",
                            fontSize: 12,
                            background: row.isOrphan ? "#fff8e1" : "transparent",
                          }}
                        >
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{row.elementName}</div>
                          </div>
                          <select
                            value={row.colorVariableId}
                            onChange={(e) => onSetMappingVariable(
                              row.editorKey,
                              row.target,
                              "color",
                              e.target.value || null
                            )}
                            disabled={busy}
                          >
                            <option value="">Color</option>
                            {template.variables.color.map((variable) => (
                              <option key={variable.id} value={variable.id}>
                                {variable.name}
                              </option>
                            ))}
                          </select>
                          <select
                            value={row.contrastVariableId}
                            onChange={(e) => onSetMappingVariable(
                              row.editorKey,
                              row.target,
                              "contrast",
                              e.target.value || null
                            )}
                            disabled={busy}
                          >
                            <option value="">Contrast</option>
                            {template.variables.contrast.map((variable) => (
                              <option key={variable.id} value={variable.id}>
                                {variable.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </section>
                  );
                })}

                {mappingRows.length === 0 && (
                  <div style={{ color: "#666" }}>No mapping elements available from included catalogs.</div>
                )}
              </div>
            </div>
          </article>
        ) : (
          <article style={{ border: "1px solid #d0d0d0", borderRadius: 8, padding: 12 }}>
            <p style={{ margin: 0, color: "#666" }}>Select a template to manage mappings.</p>
          </article>
        )}

        {/* Variables */}
        {template ? (
          <article style={{ border: "1px solid #d0d0d0", borderRadius: 8, padding: 12, display: "flex", flexDirection: "column", maxHeight: "calc(100dvh - 220px)" }}>
            <h2 style={{ margin: "0 0 10px", fontSize: 16 }}>Variables</h2>
            <div style={{ flex: 1, minHeight: 0, overflow: "auto", paddingRight: 4 }}>
              <section style={{ marginBottom: 12 }}>
                <h3 style={{ margin: "0 0 6px", fontSize: 14 }}>Color Variables</h3>
                <div style={{ display: "flex", gap: 8, marginBottom: 8, padding: 8, background: "#f5f5f5", borderRadius: 4 }}>
                  <input
                    placeholder="Color variable name"
                    value={newColorVariableName}
                    onChange={(e) => setNewColorVariableName(e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={handleAddColorVariableClick}
                    disabled={!newColorVariableName.trim() || busy}
                  >
                    Add
                  </button>
                </div>
                <div style={{ display: "grid", gap: 4 }}>
                  {template.variables.color.map((variable) => (
                    <div key={variable.id} style={{ display: "flex", justifyContent: "space-between", padding: 6, border: "1px solid #e1e1e1", borderRadius: 4 }}>
                      <span>
                        <strong>{variable.name}</strong> <span style={{ fontSize: 11, color: "#666" }}>({variable.id})</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => onRemoveVariable(variable.id, "color")}
                        style={{ fontSize: 11, padding: "2px 8px" }}
                        disabled={busy}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  {template.variables.color.length === 0 && (
                    <div style={{ color: "#666" }}>No color variables yet.</div>
                  )}
                </div>
              </section>

              <section>
                <h3 style={{ margin: "0 0 6px", fontSize: 14 }}>Contrast Variables</h3>
                <div style={{ display: "flex", gap: 8, marginBottom: 8, padding: 8, background: "#f5f5f5", borderRadius: 4 }}>
                  <input
                    placeholder="Contrast variable name"
                    value={newContrastVariableName}
                    onChange={(e) => setNewContrastVariableName(e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={handleAddContrastVariableClick}
                    disabled={!newContrastVariableName.trim() || busy}
                  >
                    Add
                  </button>
                </div>
                <div style={{ display: "grid", gap: 4 }}>
                  {template.variables.contrast.map((variable) => (
                    <div key={variable.id} style={{ display: "flex", justifyContent: "space-between", padding: 6, border: "1px solid #e1e1e1", borderRadius: 4 }}>
                      <span>
                        <strong>{variable.name}</strong> <span style={{ fontSize: 11, color: "#666" }}>({variable.id})</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => onRemoveVariable(variable.id, "contrast")}
                        style={{ fontSize: 11, padding: "2px 8px" }}
                        disabled={busy}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  {template.variables.contrast.length === 0 && (
                    <div style={{ color: "#666" }}>No contrast variables yet.</div>
                  )}
                </div>
              </section>
            </div>
          </article>
        ) : (
          <article style={{ border: "1px solid #d0d0d0", borderRadius: 8, padding: 12 }}>
            <p style={{ margin: 0, color: "#666" }}>Select a template to manage variables.</p>
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
