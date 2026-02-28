import { useEffect, useRef, useState } from 'react';
import type {
  ColorVariable,
  ColorVariableKey,
  ContrastVariable,
  ContrastVariableKey,
  Mapping,
  TokenType,
} from '../../model/schemas';

const UNGROUPED_KEY = '__ungrouped__';

interface MappingsCardProps {
  mappingsByType: Record<TokenType, Mapping[]>;
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
}

const TOKEN_TYPES: TokenType[] = ['theme', 'token', 'semantic token'];

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
  onUpdateGroupRef,
  onUpdateColorRef,
  onUpdateContrastRef,
}: {
  groupLabel: string;
  byType: Record<TokenType, Mapping[]>;
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
          {TOKEN_TYPES.map(
            (tt) =>
              byType[tt].length > 0 && (
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
              ),
          )}
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
                  {groups.map((g) => (
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
                  {colorVariables.map((v) => (
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
                  {contrastVariables.map((v) => (
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
  onUpdateGroupRef,
  onUpdateColorRef,
  onUpdateContrastRef,
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
                colorVariables.map((v) => (
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
                contrastVariables.map((v) => (
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
            onUpdateGroupRef={onUpdateGroupRef}
            onUpdateColorRef={onUpdateColorRef}
            onUpdateContrastRef={onUpdateContrastRef}
          />
        );
      })}
    </div>
  );
}
