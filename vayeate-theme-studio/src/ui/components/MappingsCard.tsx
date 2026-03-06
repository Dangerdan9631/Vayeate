import { useEffect, useRef, useState } from 'react';
import { parseSemanticSelector } from '../../core/semantic-token';
import type {
  ColorVariable,
  ColorVariableKey,
  ContrastVariable,
  ContrastVariableKey,
  Mapping,
  TokenType,
} from '../../model/schemas';

const UNGROUPED_KEY = '__ungrouped__';

export interface SemanticCatalogProp {
  semanticTokenTypes: string[];
  semanticTokenModifiers: string[];
  semanticTokenLanguages: string[];
}

interface MappingsCardProps {
  mappingsByType: Record<TokenType, Mapping[]>;
  groups: readonly string[];
  colorVariables: readonly ColorVariable[];
  contrastVariables: readonly ContrastVariable[];
  orphanKeys: Set<string>;
  canEdit: boolean;
  semanticCatalog?: SemanticCatalogProp | null;
  onUpdateGroupRef: (tokenKey: string, tokenType: TokenType, groupRef: string | null) => void;
  onUpdateColorRef: (
    tokenKey: string,
    tokenType: TokenType,
    ref: ColorVariableKey | null,
    isOrphan?: boolean,
  ) => void;
  onUpdateContrastRef: (tokenKey: string, tokenType: TokenType, ref: ContrastVariableKey | null) => void;
  onAddSemanticVariant?: (type: string, modifiers: string[], language: string | null) => void;
  onRemoveMapping?: (tokenKey: string, tokenType: TokenType) => void;
}

const TOKEN_TYPES: TokenType[] = ['theme', 'token', 'semantic token'];

function getSemanticType(key: string): string {
  try {
    const parsed = parseSemanticSelector(key);
    return parsed.type || '*';
  } catch {
    return '*';
  }
}

function SemanticTokenTreeSection({
  mappings,
  groups,
  colorVariables,
  contrastVariables,
  orphanKeys,
  canEdit,
  semanticCatalog,
  onUpdateGroupRef,
  onUpdateColorRef,
  onUpdateContrastRef,
  onAddSemanticVariant,
  onRemoveMapping,
}: {
  mappings: Mapping[];
  groups: readonly string[];
  colorVariables: readonly ColorVariable[];
  contrastVariables: readonly ContrastVariable[];
  orphanKeys: Set<string>;
  canEdit: boolean;
  semanticCatalog: SemanticCatalogProp;
  onUpdateGroupRef: (tokenKey: string, tokenType: TokenType, groupRef: string | null) => void;
  onUpdateColorRef: (
    tokenKey: string,
    tokenType: TokenType,
    ref: ColorVariableKey | null,
    isOrphan?: boolean,
  ) => void;
  onUpdateContrastRef: (tokenKey: string, tokenType: TokenType, ref: ContrastVariableKey | null) => void;
  onAddSemanticVariant: (type: string, modifiers: string[], language: string | null) => void;
  onRemoveMapping: (tokenKey: string, tokenType: TokenType) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const typesFromMappings = new Set(mappings.map((m) => getSemanticType(m.token.key)));
  const allTypes = [
    ...new Set([...semanticCatalog.semanticTokenTypes, '*', ...typesFromMappings]),
  ].sort((a, b) => (a === '*' ? -1 : b === '*' ? 1 : a.localeCompare(b)));

  const byType = new Map<string, { base: Mapping | null; variants: Mapping[] }>();
  for (const type of allTypes) {
    byType.set(type, { base: null, variants: [] });
  }
  for (const m of mappings) {
    const type = getSemanticType(m.token.key);
    const rec = byType.get(type) ?? { base: null, variants: [] };
    if (m.token.key === type) {
      rec.base = m;
    } else {
      rec.variants.push(m);
    }
    byType.set(type, rec);
  }

  return (
    <div className="tree-section">
      <button
        type="button"
        className="tree-header"
        onClick={() => setCollapsed(!collapsed)}
      >
        <span className="material-symbols-outlined tree-chevron">
          {collapsed ? 'chevron_right' : 'expand_more'}
        </span>
        <span className="tree-label">Semantic Tokens</span>
        <span className="tree-count">({mappings.length})</span>
      </button>
      {!collapsed && (
        <div className="tree-children">
          {allTypes.map((type) => (
            <SemanticTypeBlock
              key={type}
              type={type}
              base={byType.get(type)?.base ?? null}
              variants={byType.get(type)?.variants ?? []}
              groups={groups}
              colorVariables={colorVariables}
              contrastVariables={contrastVariables}
              orphanKeys={orphanKeys}
              canEdit={canEdit}
              semanticCatalog={semanticCatalog}
              onUpdateGroupRef={onUpdateGroupRef}
              onUpdateColorRef={onUpdateColorRef}
              onUpdateContrastRef={onUpdateContrastRef}
              onAddSemanticVariant={onAddSemanticVariant}
              onRemoveMapping={onRemoveMapping}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ModifierMultiselectDropdown({
  modifiers,
  selected,
  onToggle,
  disabled,
  id,
}: {
  modifiers: readonly string[];
  selected: string[];
  onToggle: (mod: string) => void;
  disabled?: boolean;
  id: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const label =
    selected.length === 0
      ? 'Modifiers'
      : selected.length <= 2
        ? selected.join(', ')
        : `Modifiers (${selected.length})`;

  return (
    <div className="mapping-modifier-dropdown-wrap" ref={ref}>
      <button
        type="button"
        className={`mappings-filter-btn mapping-modifier-btn ${open ? 'mappings-filter-btn-open' : ''} ${selected.length > 0 ? 'mappings-filter-btn-active' : ''}`}
        onClick={() => !disabled && setOpen((v) => !v)}
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="Select modifiers"
        id={id}
      >
        <span className="mappings-filter-btn-label">{label}</span>
        <span className="material-symbols-outlined mappings-filter-chevron">
          {open ? 'expand_less' : 'expand_more'}
        </span>
      </button>
      {open && (
        <div
          className="mappings-filter-dropdown mapping-modifier-dropdown"
          role="listbox"
          aria-multiselectable="true"
          aria-labelledby={id}
        >
          {modifiers.length === 0 ? (
            <div className="mappings-filter-empty">None in catalog</div>
          ) : (
            modifiers.map((mod) => (
              <label key={mod} className="mappings-filter-check">
                <input
                  type="checkbox"
                  checked={selected.includes(mod)}
                  onChange={() => onToggle(mod)}
                />
                <span>{mod}</span>
              </label>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function SemanticTypeBlock({
  type,
  base,
  variants,
  groups,
  colorVariables,
  contrastVariables,
  orphanKeys,
  canEdit,
  semanticCatalog,
  onUpdateGroupRef,
  onUpdateColorRef,
  onUpdateContrastRef,
  onAddSemanticVariant,
  onRemoveMapping,
}: {
  type: string;
  base: Mapping | null;
  variants: Mapping[];
  groups: readonly string[];
  colorVariables: readonly ColorVariable[];
  contrastVariables: readonly ContrastVariable[];
  orphanKeys: Set<string>;
  canEdit: boolean;
  semanticCatalog: SemanticCatalogProp;
  onUpdateGroupRef: (tokenKey: string, tokenType: TokenType, groupRef: string | null) => void;
  onUpdateColorRef: (
    tokenKey: string,
    tokenType: TokenType,
    ref: ColorVariableKey | null,
    isOrphan?: boolean,
  ) => void;
  onUpdateContrastRef: (tokenKey: string, tokenType: TokenType, ref: ContrastVariableKey | null) => void;
  onAddSemanticVariant: (type: string, modifiers: string[], language: string | null) => void;
  onRemoveMapping: (tokenKey: string, tokenType: TokenType) => void;
}) {
  const [showAddVariant, setShowAddVariant] = useState(false);
  const [selectedModifiers, setSelectedModifiers] = useState<string[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const modifierDropdownId = `modifier-dropdown-${type.replace(/[^a-z0-9]/gi, '-')}`;

  const toggleModifier = (mod: string) => {
    setSelectedModifiers((prev) =>
      prev.includes(mod) ? prev.filter((m) => m !== mod) : [...prev, mod].sort(),
    );
  };

  const handleAddVariant = () => {
    const lang = selectedLanguage.trim() || null;
    if (selectedModifiers.length === 0 && !lang) return;
    onAddSemanticVariant(type, selectedModifiers, lang);
    setSelectedModifiers([]);
    setSelectedLanguage('');
    setShowAddVariant(false);
  };

  const renderMappingRow = (m: Mapping, isVariant: boolean, showPlusOnRow: boolean) => {
    const mKey = `${m.token.type}::${m.token.key}`;
    const isOrphan = orphanKeys.has(mKey);
    return (
      <div
        key={mKey}
        className={`mapping-row ${isVariant ? 'mapping-row-variant' : ''} ${isOrphan ? 'mapping-orphan' : ''}`}
      >
        <select
          className="field-select mapping-var-select"
          value={m.groupRef ?? ''}
          disabled={!canEdit}
          onChange={(e) =>
            onUpdateGroupRef(m.token.key, m.token.type, e.target.value || null)
          }
          title="Group"
        >
          <option value="">Ungrouped</option>
          {[...groups].sort((a, b) => a.localeCompare(b)).map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
        <span className="mapping-token-name" title={m.token.key}>
          {m.token.key}
        </span>
        {isOrphan && (
          <span className="material-symbols-outlined mapping-warning-icon" title="Token not in catalog">
            warning
          </span>
        )}
        <select
          className="field-select mapping-var-select"
          value={m.colorVariableRef ?? ''}
          disabled={!canEdit}
          onChange={(e) =>
            onUpdateColorRef(m.token.key, m.token.type, e.target.value || null, isOrphan)
          }
        >
          <option value="">— color —</option>
          {[...colorVariables].sort((a, b) => a.key.localeCompare(b.key)).map((v) => (
            <option key={v.key} value={v.key}>{v.key}</option>
          ))}
        </select>
        <select
          className="field-select mapping-var-select"
          value={m.contrastVariableRef ?? ''}
          disabled={!canEdit}
          onChange={(e) =>
            onUpdateContrastRef(m.token.key, m.token.type, e.target.value || null)
          }
        >
          <option value="">— contrast —</option>
          {[...contrastVariables].sort((a, b) => a.key.localeCompare(b.key)).map((v) => (
            <option key={v.key} value={v.key}>{v.key}</option>
          ))}
        </select>
        {isVariant && canEdit && (
          <button
            type="button"
            className="btn-icon btn-danger-icon"
            title="Remove variant"
            onClick={() => onRemoveMapping(m.token.key, m.token.type)}
            aria-label="Remove variant"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        )}
        {showPlusOnRow && canEdit && (
          <button
            type="button"
            className="btn-icon btn-add-icon"
            title="Add variant"
            onClick={() => setShowAddVariant(true)}
            aria-label="Add variant"
          >
            <span className="material-symbols-outlined">add</span>
          </button>
        )}
      </div>
    );
  };

  const typeRow = base ? (
    renderMappingRow(base, false, !showAddVariant)
  ) : (
    <div className="mapping-row mapping-type-row-no-base">
      <select
        className="field-select mapping-var-select"
        disabled
        value=""
        title="Group"
      >
        <option value="">Ungrouped</option>
      </select>
      <span className="mapping-token-name" title={type}>
        {type}
      </span>
      <select className="field-select mapping-var-select" disabled value="">
        <option value="">— color —</option>
      </select>
      <select className="field-select mapping-var-select" disabled value="">
        <option value="">— contrast —</option>
      </select>
      {canEdit && !showAddVariant && (
        <button
          type="button"
          className="btn-icon btn-add-icon"
          title="Add variant"
          onClick={() => setShowAddVariant(true)}
          aria-label="Add variant"
        >
          <span className="material-symbols-outlined">add</span>
        </button>
      )}
    </div>
  );

  return (
    <div className="semantic-type-block">
      {typeRow}
      {variants.map((m) => renderMappingRow(m, true, false))}
      {canEdit && showAddVariant && (
        <div className="mapping-row mapping-variant-form-row">
          <ModifierMultiselectDropdown
            id={modifierDropdownId}
            modifiers={semanticCatalog.semanticTokenModifiers}
            selected={selectedModifiers}
            onToggle={toggleModifier}
          />
          <select
            className="field-select mapping-var-select mapping-variant-lang-select"
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            aria-label="Language"
          >
            <option value="">— language —</option>
            {semanticCatalog.semanticTokenLanguages.map((lang) => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
          <button
            type="button"
            className="btn-secondary btn-sm"
            onClick={handleAddVariant}
            disabled={selectedModifiers.length === 0 && !selectedLanguage.trim()}
          >
            Add
          </button>
          <button
            type="button"
            className="btn-secondary btn-sm"
            onClick={() => {
              setShowAddVariant(false);
              setSelectedModifiers([]);
              setSelectedLanguage('');
            }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

function tokenTypeLabel(tokenType: TokenType): string {
  return tokenType === 'theme'
    ? 'Theme Tokens'
    : tokenType === 'token'
      ? 'Tokens'
      : 'Semantic Tokens';
}

function GroupSection({
  groupLabel,
  byType,
  groups,
  colorVariables,
  contrastVariables,
  orphanKeys,
  canEdit,
  semanticCatalog,
  onUpdateGroupRef,
  onUpdateColorRef,
  onUpdateContrastRef,
  onAddSemanticVariant,
  onRemoveMapping,
}: {
  groupLabel: string;
  byType: Record<TokenType, Mapping[]>;
  groups: readonly string[];
  colorVariables: readonly ColorVariable[];
  contrastVariables: readonly ContrastVariable[];
  orphanKeys: Set<string>;
  canEdit: boolean;
  semanticCatalog?: SemanticCatalogProp | null;
  onUpdateGroupRef: (tokenKey: string, tokenType: TokenType, groupRef: string | null) => void;
  onUpdateColorRef: (
    tokenKey: string,
    tokenType: TokenType,
    ref: ColorVariableKey | null,
    isOrphan?: boolean,
  ) => void;
  onUpdateContrastRef: (tokenKey: string, tokenType: TokenType, ref: ContrastVariableKey | null) => void;
  onAddSemanticVariant?: (type: string, modifiers: string[], language: string | null) => void;
  onRemoveMapping?: (tokenKey: string, tokenType: TokenType) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const totalInGroup = TOKEN_TYPES.reduce((sum, tt) => sum + byType[tt].length, 0);

  return (
    <div className="tree-section">
      <button
        type="button"
        className="tree-header"
        onClick={() => setCollapsed(!collapsed)}
      >
        <span className="material-symbols-outlined tree-chevron">
          {collapsed ? 'chevron_right' : 'expand_more'}
        </span>
        <span className="tree-label">{groupLabel}</span>
        <span className="tree-count">({totalInGroup})</span>
      </button>
      {!collapsed && (
        <div className="tree-children">
          {TOKEN_TYPES.map((tt) => {
            const useSemanticTree =
              tt === 'semantic token' &&
              semanticCatalog &&
              onAddSemanticVariant &&
              onRemoveMapping;
            if (byType[tt].length === 0 && !useSemanticTree) return null;
            if (useSemanticTree) {
              return (
                <SemanticTokenTreeSection
                  key={tt}
                  mappings={byType[tt]}
                  groups={groups}
                  colorVariables={colorVariables}
                  contrastVariables={contrastVariables}
                  orphanKeys={orphanKeys}
                  canEdit={canEdit}
                  semanticCatalog={semanticCatalog}
                  onUpdateGroupRef={onUpdateGroupRef}
                  onUpdateColorRef={onUpdateColorRef}
                  onUpdateContrastRef={onUpdateContrastRef}
                  onAddSemanticVariant={onAddSemanticVariant}
                  onRemoveMapping={onRemoveMapping}
                />
              );
            }
            return (
              <MappingTypeSection
                key={tt}
                tokenType={tt}
                mappings={byType[tt]}
                groups={groups}
                colorVariables={colorVariables}
                contrastVariables={contrastVariables}
                orphanKeys={orphanKeys}
                canEdit={canEdit}
                onUpdateGroupRef={onUpdateGroupRef}
                onUpdateColorRef={onUpdateColorRef}
                onUpdateContrastRef={onUpdateContrastRef}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function MappingTypeSection({
  tokenType,
  mappings,
  groups,
  colorVariables,
  contrastVariables,
  orphanKeys,
  canEdit,
  onUpdateGroupRef,
  onUpdateColorRef,
  onUpdateContrastRef,
}: {
  tokenType: TokenType;
  mappings: Mapping[];
  groups: readonly string[];
  colorVariables: readonly ColorVariable[];
  contrastVariables: readonly ContrastVariable[];
  orphanKeys: Set<string>;
  canEdit: boolean;
  onUpdateGroupRef: (tokenKey: string, tokenType: TokenType, groupRef: string | null) => void;
  onUpdateColorRef: (
    tokenKey: string,
    tokenType: TokenType,
    ref: ColorVariableKey | null,
    isOrphan?: boolean,
  ) => void;
  onUpdateContrastRef: (tokenKey: string, tokenType: TokenType, ref: ContrastVariableKey | null) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const label = tokenTypeLabel(tokenType);

  return (
    <div className="tree-section">
      <button
        type="button"
        className="tree-header"
        onClick={() => setCollapsed(!collapsed)}
      >
        <span className="material-symbols-outlined tree-chevron">
          {collapsed ? 'chevron_right' : 'expand_more'}
        </span>
        <span className="tree-label">{label}</span>
        <span className="tree-count">({mappings.length})</span>
      </button>

      {!collapsed && (
        <div className="tree-children">
          {mappings.map((m) => {
            const mKey = `${m.token.type}::${m.token.key}`;
            const isOrphan = orphanKeys.has(mKey);

            return (
              <div
                key={mKey}
                className={`mapping-row ${isOrphan ? 'mapping-orphan' : ''}`}
              >
                <select
                  className="field-select mapping-var-select"
                  value={m.groupRef ?? ''}
                  disabled={!canEdit}
                  onChange={(e) =>
                    onUpdateGroupRef(
                      m.token.key,
                      m.token.type,
                      e.target.value || null,
                    )
                  }
                  title="Group"
                >
                  <option value="">Ungrouped</option>
                  {[...groups].sort((a, b) => a.localeCompare(b)).map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
                <span className="mapping-token-name" title={m.token.key}>
                  {m.token.key}
                </span>
                {isOrphan && (
                  <span
                    className="material-symbols-outlined mapping-warning-icon"
                    title="Token not found in any included catalog"
                  >
                    warning
                  </span>
                )}
                <select
                  className="field-select mapping-var-select"
                  value={m.colorVariableRef ?? ''}
                  disabled={!canEdit}
                  onChange={(e) =>
                    onUpdateColorRef(
                      m.token.key,
                      m.token.type,
                      e.target.value || null,
                      isOrphan,
                    )
                  }
                >
                  <option value="">— color —</option>
                  {[...colorVariables].sort((a, b) => a.key.localeCompare(b.key)).map((v) => (
                    <option key={v.key} value={v.key}>
                      {v.key}
                    </option>
                  ))}
                </select>
                <select
                  className="field-select mapping-var-select"
                  value={m.contrastVariableRef ?? ''}
                  disabled={!canEdit}
                  onChange={(e) =>
                    onUpdateContrastRef(
                      m.token.key,
                      m.token.type,
                      e.target.value || null,
                    )
                  }
                >
                  <option value="">— contrast —</option>
                  {[...contrastVariables].sort((a, b) => a.key.localeCompare(b.key)).map((v) => (
                    <option key={v.key} value={v.key}>
                      {v.key}
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
          {mappings.length === 0 && (
            <div className="empty-hint">No mappings for this type.</div>
          )}
        </div>
      )}
    </div>
  );
}

function matchesSearch(key: string, searchQuery: string): boolean {
  const q = searchQuery.trim().toLowerCase();
  return !q || key.toLowerCase().includes(q);
}

function filterMappings(
  mappings: Mapping[],
  searchQuery: string,
  selectedColorKeys: string[],
  selectedContrastKeys: string[],
): Mapping[] {
  return mappings.filter((m) => {
    if (!matchesSearch(m.token.key, searchQuery)) return false;
    if (selectedColorKeys.length > 0) {
      if (!m.colorVariableRef || !selectedColorKeys.includes(m.colorVariableRef)) return false;
    }
    if (selectedContrastKeys.length > 0) {
      if (!m.contrastVariableRef || !selectedContrastKeys.includes(m.contrastVariableRef))
        return false;
    }
    return true;
  });
}

function buildByGroup(
  filteredMappingsByType: Record<TokenType, Mapping[]>,
): Map<string, Record<TokenType, Mapping[]>> {
  const byGroup = new Map<string, Record<TokenType, Mapping[]>>();

  function ensureGroup(key: string): Record<TokenType, Mapping[]> {
    let rec = byGroup.get(key);
    if (!rec) {
      rec = { theme: [], token: [], 'semantic token': [] };
      byGroup.set(key, rec);
    }
    return rec;
  }

  for (const tt of TOKEN_TYPES) {
    for (const m of filteredMappingsByType[tt]) {
      const groupKey = m.groupRef ?? UNGROUPED_KEY;
      const rec = ensureGroup(groupKey);
      rec[tt].push(m);
    }
  }

  return byGroup;
}

function sortedGroupKeys(byGroup: Map<string, Record<TokenType, Mapping[]>>): string[] {
  const named = [...byGroup.keys()].filter((k) => k !== UNGROUPED_KEY).sort();
  const hasUngrouped = byGroup.has(UNGROUPED_KEY);
  return hasUngrouped ? [...named, UNGROUPED_KEY] : named;
}

export function MappingsCard({
  mappingsByType,
  groups,
  colorVariables,
  contrastVariables,
  orphanKeys,
  canEdit,
  semanticCatalog,
  onUpdateGroupRef,
  onUpdateColorRef,
  onUpdateContrastRef,
  onAddSemanticVariant,
  onRemoveMapping,
}: MappingsCardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedColorKeys, setSelectedColorKeys] = useState<string[]>([]);
  const [selectedContrastKeys, setSelectedContrastKeys] = useState<string[]>([]);

  const filteredMappingsByType = Object.fromEntries(
    TOKEN_TYPES.map((tt) => [
      tt,
      filterMappings(
        mappingsByType[tt],
        searchQuery,
        selectedColorKeys,
        selectedContrastKeys,
      ).sort((a, b) => a.token.key.localeCompare(b.token.key)),
    ])
  ) as Record<TokenType, Mapping[]>;

  const byGroup = buildByGroup(filteredMappingsByType);
  const groupKeysInOrder = sortedGroupKeys(byGroup);

  const [openFilter, setOpenFilter] = useState<'color' | 'contrast' | null>(null);
  const colorDropdownRef = useRef<HTMLDivElement>(null);
  const contrastDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (openFilter === null) return;
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      const colorEl = colorDropdownRef.current;
      const contrastEl = contrastDropdownRef.current;
      if (
        openFilter === 'color' &&
        colorEl &&
        !colorEl.contains(target)
      ) {
        setOpenFilter(null);
      }
      if (
        openFilter === 'contrast' &&
        contrastEl &&
        !contrastEl.contains(target)
      ) {
        setOpenFilter(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openFilter]);

  function toggleColorKey(key: string) {
    setSelectedColorKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  }

  function toggleContrastKey(key: string) {
    setSelectedContrastKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  }

  return (
    <div className="tokens-card placeholder">
      <h2>Mappings</h2>
      <div className="mappings-filter-row">
        <input
          type="text"
          className="mappings-filter-search"
          placeholder="Search…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search mappings"
        />
        <div className="mappings-filter-dropdown-wrap" ref={colorDropdownRef}>
          <button
            type="button"
            className={`mappings-filter-btn ${openFilter === 'color' ? 'mappings-filter-btn-open' : ''} ${selectedColorKeys.length > 0 ? 'mappings-filter-btn-active' : ''}`}
            onClick={() => setOpenFilter((v) => (v === 'color' ? null : 'color'))}
            aria-expanded={openFilter === 'color'}
            aria-haspopup="true"
            aria-label="Filter by color variable"
          >
            <span className="mappings-filter-btn-label">
              Color{selectedColorKeys.length > 0 ? ` (${selectedColorKeys.length})` : ''}
            </span>
            <span className="material-symbols-outlined mappings-filter-chevron">
              {openFilter === 'color' ? 'expand_less' : 'expand_more'}
            </span>
          </button>
          {openFilter === 'color' && (
            <div className="mappings-filter-dropdown">
              {colorVariables.length === 0 ? (
                <div className="mappings-filter-empty">No color variables</div>
              ) : (
                [...colorVariables].sort((a, b) => a.key.localeCompare(b.key)).map((v) => (
                  <label key={v.key} className="mappings-filter-check">
                    <input
                      type="checkbox"
                      checked={selectedColorKeys.includes(v.key)}
                      onChange={() => toggleColorKey(v.key)}
                    />
                    <span>{v.key}</span>
                  </label>
                ))
              )}
            </div>
          )}
        </div>
        <div className="mappings-filter-dropdown-wrap" ref={contrastDropdownRef}>
          <button
            type="button"
            className={`mappings-filter-btn ${openFilter === 'contrast' ? 'mappings-filter-btn-open' : ''} ${selectedContrastKeys.length > 0 ? 'mappings-filter-btn-active' : ''}`}
            onClick={() => setOpenFilter((v) => (v === 'contrast' ? null : 'contrast'))}
            aria-expanded={openFilter === 'contrast'}
            aria-haspopup="true"
            aria-label="Filter by contrast variable"
          >
            <span className="mappings-filter-btn-label">
              Contrast{selectedContrastKeys.length > 0 ? ` (${selectedContrastKeys.length})` : ''}
            </span>
            <span className="material-symbols-outlined mappings-filter-chevron">
              {openFilter === 'contrast' ? 'expand_less' : 'expand_more'}
            </span>
          </button>
          {openFilter === 'contrast' && (
            <div className="mappings-filter-dropdown">
              {contrastVariables.length === 0 ? (
                <div className="mappings-filter-empty">No contrast variables</div>
              ) : (
                [...contrastVariables].sort((a, b) => a.key.localeCompare(b.key)).map((v) => (
                  <label key={v.key} className="mappings-filter-check">
                    <input
                      type="checkbox"
                      checked={selectedContrastKeys.includes(v.key)}
                      onChange={() => toggleContrastKey(v.key)}
                    />
                    <span>{v.key}</span>
                  </label>
                ))
              )}
            </div>
          )}
        </div>
      </div>
      {groupKeysInOrder.map((groupKey) => {
        const byType = byGroup.get(groupKey)!;
        const groupLabel = groupKey === UNGROUPED_KEY ? 'Ungrouped' : groupKey;
        return (
          <GroupSection
            key={groupKey}
            groupLabel={groupLabel}
            byType={byType}
            groups={groups}
            colorVariables={colorVariables}
            contrastVariables={contrastVariables}
            orphanKeys={orphanKeys}
            canEdit={canEdit}
            semanticCatalog={semanticCatalog}
            onUpdateGroupRef={onUpdateGroupRef}
            onUpdateColorRef={onUpdateColorRef}
            onUpdateContrastRef={onUpdateContrastRef}
            onAddSemanticVariant={onAddSemanticVariant}
            onRemoveMapping={onRemoveMapping}
          />
        );
      })}
    </div>
  );
}
