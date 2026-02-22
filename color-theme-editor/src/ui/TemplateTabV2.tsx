import { useState } from "react";
import type { Template_v2, Catalog, CatalogTarget, VariableType, ColorVariable_v2, ContrastVariable } from "../domain/types";

export interface TemplateTabV2Props {
  templates: string[];
  selectedTemplateId: string | null;
  template: Template_v2 | null;
  catalogs: Catalog[];
  onSelectTemplate: (id: string) => void;
  onCreateTemplate: (name: string, catalogRefs: string[]) => void;
  onSaveTemplate: (template: Template_v2) => Promise<void>;
  onUpdateTemplateName: (name: string) => void;
  onAddCatalogRef: (catalogName: string) => void;
  onRemoveCatalogRef: (catalogName: string) => void;
  onAddColorVariable: (name: string) => void;
  onAddContrastVariable: (name: string, targetRatio: number) => void;
  onRemoveVariable: (variableId: string, variableType: VariableType) => void;
  onAddMapping: (catalogName: string, catalogKey: string, catalogTarget: CatalogTarget, variableId: string, variableType: VariableType) => void;
  onRemoveMapping: (catalogName: string, catalogKey: string, catalogTarget: CatalogTarget) => void;
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
  onSaveTemplate,
  onUpdateTemplateName,
  onAddCatalogRef,
  onRemoveCatalogRef,
  onAddColorVariable,
  onAddContrastVariable,
  onRemoveVariable,
  onAddMapping,
  onRemoveMapping,
  busy,
  error,
}: TemplateTabV2Props): JSX.Element {
  const [newTemplateName, setNewTemplateName] = useState("");
  const [selectedCatalogs, setSelectedCatalogs] = useState<string[]>([]);
  const [newVarName, setNewVarName] = useState("");
  const [newVarType, setNewVarType] = useState<"color" | "contrast">("color");
  const [newContrastRatio, setNewContrastRatio] = useState("4.5");
  const [mappingCatalog, setMappingCatalog] = useState("");
  const [mappingTarget, setMappingTarget] = useState<CatalogTarget>("colors");
  const [mappingKey, setMappingKey] = useState("");
  const [mappingVariable, setMappingVariable] = useState("");
  const templateEligibleCatalogs = catalogs.filter((catalog) => catalog.source === "remote" || Boolean(catalog.locked));

  const handleCreateTemplate = () => {
    if (newTemplateName.trim() && selectedCatalogs.length > 0) {
      onCreateTemplate(newTemplateName.trim(), selectedCatalogs);
      setNewTemplateName("");
      setSelectedCatalogs([]);
    }
  };

  const handleAddVariable = () => {
    if (newVarName.trim()) {
      if (newVarType === "color") {
        onAddColorVariable(newVarName.trim());
      } else {
        const ratio = parseFloat(newContrastRatio);
        if (!isNaN(ratio) && ratio > 0) {
          onAddContrastVariable(newVarName.trim(), ratio);
        }
      }
      setNewVarName("");
    }
  };

  const handleAddMapping = () => {
    if (mappingCatalog && mappingKey.trim() && mappingVariable) {
      const variable = allVariables.find((v) => v.id === mappingVariable);
      if (variable) {
        const varType: VariableType = "targetRatio" in variable ? "contrast" : "color";
        onAddMapping(mappingCatalog, mappingKey.trim(), mappingTarget, mappingVariable, varType);
        setMappingKey("");
      }
    }
  };

  const toggleCatalogSelection = (catalogName: string) => {
    setSelectedCatalogs((prev) =>
      prev.includes(catalogName) ? prev.filter((n) => n !== catalogName) : [...prev, catalogName]
    );
  };

  const allVariables: Array<(ColorVariable_v2 | ContrastVariable) & { type: VariableType }> = template
    ? [
        ...template.variables.color.map((v) => ({ ...v, type: "color" as const })),
        ...template.variables.contrast.map((v) => ({ ...v, type: "contrast" as const })),
      ]
    : [];

  const availableKeys = template && mappingCatalog
    ? templateEligibleCatalogs.find((c) => c.name === mappingCatalog)?.keys[mappingTarget] || []
    : [];

  return (
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
              <div style={{ maxHeight: 100, overflow: "auto", border: "1px solid #e1e1e1", borderRadius: 4, padding: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Select Catalogs:</div>
                {templateEligibleCatalogs.map((catalog) => (
                  <label key={catalog.name} style={{ display: "block", fontSize: 12 }}>
                    <input
                      type="checkbox"
                      checked={selectedCatalogs.includes(catalog.name)}
                      onChange={() => toggleCatalogSelection(catalog.name)}
                    />{" "}
                    {catalog.name} ({catalog.source}{catalog.source === "manual" ? `, v${catalog.version}` : ""})
                  </label>
                ))}
                {templateEligibleCatalogs.length === 0 && (
                  <div style={{ fontSize: 12, color: "#666" }}>
                    No eligible catalogs. Manual catalogs must be locked before template use.
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={handleCreateTemplate}
                disabled={!newTemplateName.trim() || selectedCatalogs.length === 0 || busy}
              >
                Create Template
              </button>
            </div>
          </div>

          {template && (
            <button type="button" onClick={() => void onSaveTemplate(template)} disabled={busy}>
              Save Template
            </button>
          )}
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
                <strong>Catalogs:</strong> {template.catalogRefs.join(", ")}
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

          {/* Variables */}
          <article style={{ border: "1px solid #d0d0d0", borderRadius: 8, padding: 12 }}>
            <h2 style={{ margin: "0 0 10px", fontSize: 16 }}>Variables</h2>
            
            {/* Add Variable */}
            <div style={{ display: "grid", gap: 6, marginBottom: 12, padding: 8, background: "#f5f5f5", borderRadius: 4 }}>
              <div style={{ display: "flex", gap: 8 }}>
                <select value={newVarType} onChange={(e) => setNewVarType(e.target.value as "color" | "contrast")}>
                  <option value="color">Color</option>
                  <option value="contrast">Contrast</option>
                </select>
                <input
                  placeholder="Variable name"
                  value={newVarName}
                  onChange={(e) => setNewVarName(e.target.value)}
                  style={{ flex: 1 }}
                />
                {newVarType === "contrast" && (
                  <input
                    type="number"
                    placeholder="Ratio"
                    value={newContrastRatio}
                    onChange={(e) => setNewContrastRatio(e.target.value)}
                    style={{ width: 80 }}
                    step="0.1"
                    min="1"
                  />
                )}
                <button type="button" onClick={handleAddVariable} disabled={!newVarName.trim() || busy}>
                  Add
                </button>
              </div>
            </div>

            {/* Color Variables */}
            {template.variables.color.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <h3 style={{ margin: "0 0 6px", fontSize: 14 }}>Color Variables</h3>
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
                </div>
              </div>
            )}

            {/* Contrast Variables */}
            {template.variables.contrast.length > 0 && (
              <div>
                <h3 style={{ margin: "0 0 6px", fontSize: 14 }}>Contrast Variables</h3>
                <div style={{ display: "grid", gap: 4 }}>
                  {template.variables.contrast.map((variable) => (
                    <div key={variable.id} style={{ display: "flex", justifyContent: "space-between", padding: 6, border: "1px solid #e1e1e1", borderRadius: 4 }}>
                      <span>
                        <strong>{variable.name}</strong> (ratio: {variable.targetRatio}){" "}
                        <span style={{ fontSize: 11, color: "#666" }}>({variable.id})</span>
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
                </div>
              </div>
            )}
          </article>

          {/* Mappings */}
          <article style={{ border: "1px solid #d0d0d0", borderRadius: 8, padding: 12 }}>
            <h2 style={{ margin: "0 0 10px", fontSize: 16 }}>Mappings ({template.mappings.length})</h2>
            
            {/* Add Mapping */}
            {allVariables.length > 0 && (
              <div style={{ display: "grid", gap: 6, marginBottom: 12, padding: 8, background: "#f5f5f5", borderRadius: 4 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
                  <select
                    value={mappingCatalog}
                    onChange={(e) => setMappingCatalog(e.target.value)}
                  >
                    <option value="">Select Catalog</option>
                    {template.catalogRefs
                      .filter((name) => templateEligibleCatalogs.some((catalog) => catalog.name === name))
                      .map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={mappingTarget}
                    onChange={(e) => setMappingTarget(e.target.value as CatalogTarget)}
                  >
                    <option value="colors">Colors</option>
                    <option value="semanticTokens">Semantic Tokens</option>
                    <option value="textMateScopes">TextMate Scopes</option>
                  </select>
                  <select
                    value={mappingVariable}
                    onChange={(e) => setMappingVariable(e.target.value)}
                  >
                    <option value="">Select Variable</option>
                    {allVariables.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.type})
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {mappingCatalog && availableKeys.length > 0 ? (
                    <select
                      value={mappingKey}
                      onChange={(e) => setMappingKey(e.target.value)}
                      style={{ flex: 1 }}
                    >
                      <option value="">Select Key</option>
                      {availableKeys.map((key) => (
                        <option key={key} value={key}>
                          {key}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      placeholder="Catalog key"
                      value={mappingKey}
                      onChange={(e) => setMappingKey(e.target.value)}
                      style={{ flex: 1 }}
                    />
                  )}
                  <button
                    type="button"
                    onClick={handleAddMapping}
                    disabled={!mappingCatalog || !mappingKey.trim() || !mappingVariable || busy}
                  >
                    Add Mapping
                  </button>
                </div>
              </div>
            )}

            {/* Existing Mappings */}
            <div style={{ display: "grid", gap: 4, maxHeight: 300, overflow: "auto" }}>
              {template.mappings.map((mapping, idx) => {
                const variable = allVariables.find((v) => v.id === mapping.variableId);
                return (
                  <div key={idx} style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 8, padding: 6, border: "1px solid #e1e1e1", borderRadius: 4, alignItems: "center", fontSize: 12 }}>
                    <span style={{ fontWeight: 600, color: "#0066cc" }}>{variable?.name || mapping.variableId}</span>
                    <span>
                      <span style={{ color: "#666" }}>{mapping.catalogName}</span> → {mapping.catalogKey}{" "}
                      <span style={{ fontSize: 11, color: "#888" }}>({mapping.catalogTarget})</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => onRemoveMapping(mapping.catalogName, mapping.catalogKey, mapping.catalogTarget)}
                      style={{ fontSize: 11, padding: "2px 8px" }}
                      disabled={busy}
                    >
                      Remove
                    </button>
                  </div>
                );
              })}
            </div>
          </article>
        </>
      ) : (
        <article style={{ border: "1px solid #d0d0d0", borderRadius: 8, padding: 12 }}>
          <p style={{ margin: 0, color: "#666" }}>Select or create a template to define variables and mappings.</p>
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
