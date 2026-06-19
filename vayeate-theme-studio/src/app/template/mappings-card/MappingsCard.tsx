import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useMappingsCardViewModel } from './use-mappings-card-viewmodel';
import { MappingRow } from './MappingRow';
import { SemanticVariantRow } from './SemanticVariantRow';
import { formatSemanticSelector } from '../../../model/format-semantic-selector';
import { parseSemanticSelector } from '../../../model/parse-semantic-selector';
import { SEMANTIC_WILDCARD_TYPE } from '../../../model/semantic-token-constants';
import type { ColorVariableKey, ContrastVariableKey, TokenType } from '../../../model/schema/primitives';
import type { ColorVariable, ContrastVariable, Mapping } from '../../../model/schema/template-schemas';

const UNGROUPED_KEY = '__ungrouped__';
const VIRTUALIZE_MIN_COUNT = 10;
const VIRTUAL_OVERSCAN = 8;
const VIRTUAL_FALLBACK_MAX = 15;

function findScrollParent(el: HTMLElement | null): HTMLElement | null {
  let node = el?.parentElement ?? null;
  while (node) {
    const { overflowY } = getComputedStyle(node);
    if (overflowY === 'auto' || overflowY === 'scroll') return node;
    node = node.parentElement;
  }
  return null;
}

function scrollMarginFor(listEl: HTMLElement, scrollEl: HTMLElement): number {
  return listEl.getBoundingClientRect().top - scrollEl.getBoundingClientRect().top + scrollEl.scrollTop;
}

interface VirtualizedRowListProps<T> {
  items: readonly T[];
  getItemKey: (item: T, index: number) => string;
  estimateSize: () => number;
  renderItem: (item: T, index: number) => ReactNode;
  emptyHint?: string;
}

function VirtualizedRowList<T>({
  items,
  getItemKey,
  estimateSize,
  renderItem,
  emptyHint,
}: VirtualizedRowListProps<T>) {
  const listRef = useRef<HTMLDivElement>(null);
  const [scrollElement, setScrollElement] = useState<HTMLElement | null>(null);
  const [scrollMargin, setScrollMargin] = useState(0);
  const shouldVirtualize = items.length >= VIRTUALIZE_MIN_COUNT;

  const updateScrollMetrics = useCallback(() => {
    const listEl = listRef.current;
    if (!listEl) return;
    const scrollEl = findScrollParent(listEl);
    setScrollElement(scrollEl);
    setScrollMargin(scrollEl ? scrollMarginFor(listEl, scrollEl) : 0);
  }, []);

  useLayoutEffect(() => {
    if (!shouldVirtualize) return;
    updateScrollMetrics();
    const listEl = listRef.current;
    if (!listEl) return;
    const ro = new ResizeObserver(updateScrollMetrics);
    ro.observe(listEl);
    const scrollEl = findScrollParent(listEl);
    if (scrollEl) ro.observe(scrollEl);
    window.addEventListener('resize', updateScrollMetrics);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', updateScrollMetrics);
    };
  }, [shouldVirtualize, items.length, updateScrollMetrics]);

  const virtualizer = useVirtualizer({
    count: shouldVirtualize ? items.length : 0,
    getScrollElement: () => scrollElement,
    estimateSize,
    overscan: VIRTUAL_OVERSCAN,
    scrollMargin,
  });

  if (items.length === 0) {
    return emptyHint ? <p className="empty-hint">{emptyHint}</p> : null;
  }

  if (!shouldVirtualize) {
    return (
      <>
        {items.map((item, index) => (
          <div key={getItemKey(item, index)}>{renderItem(item, index)}</div>
        ))}
      </>
    );
  }

  const virtualItems = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();
  const fallbackIndices =
    items.length > 0 && virtualItems.length === 0
      ? items.map((_, i) => i).slice(0, Math.min(items.length, VIRTUAL_FALLBACK_MAX))
      : null;

  return (
    <div ref={listRef} className="virtual-row-list">
      {fallbackIndices ? (
        fallbackIndices.map((index) => (
          <div key={getItemKey(items[index], index)}>{renderItem(items[index], index)}</div>
        ))
      ) : (
        <div style={{ height: totalSize, position: 'relative', width: '100%' }}>
          {virtualItems.map((virtualItem) => {
            const item = items[virtualItem.index];
            return (
              <div
                key={getItemKey(item, virtualItem.index)}
                data-index={virtualItem.index}
                ref={(el) => { if (el) virtualizer.measureElement(el); }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                {renderItem(item, virtualItem.index)}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/** Virtual base for "*" (display-only; never persisted). */
const VIRTUAL_STAR_BASE: Mapping = {
  token: { key: SEMANTIC_WILDCARD_TYPE, type: 'semantic token' },
  colorVariableRef: null,
  contrastVariableRef: null,
  groupRef: null,
};

const DISPLAYED_TOKEN_TYPES: TokenType[] = ['theme', 'textmate token', 'semantic token'];

/**
 * Callback props for semantic variant editing inside MappingsCard.
 */
export interface SemanticVariantProps {
  onAddSemanticVariant: (type: string, defaultGroupRef?: string | null) => void;
  onCommitSemanticTokenModifiers: (oldKey: string, modifiers: string[]) => void;
  onCommitSemanticTokenLanguage: (oldKey: string, language: string | null) => void;
}

function tokenTypeLabel(tokenType: TokenType): string {
  return tokenType === 'theme'
    ? 'Theme Tokens'
    : tokenType === 'textmate token'
      ? 'Textmate Tokens'
      : 'Semantic Tokens';
}

function noopRemoveMapping(): void {}

/**
 * Groups one semantic base mapping with its variant rows for display.
 */
export interface SemanticBlock {
  base: Mapping;
  variants: Mapping[];
}

function buildSemanticBlocks(mappings: Mapping[]): SemanticBlock[] {
  const bases: Mapping[] = [];
  const variantsByType = new Map<string, Mapping[]>();
  for (const m of mappings) {
    if (m.token.type !== 'semantic token') continue;
    if (m.token.key === SEMANTIC_WILDCARD_TYPE) continue;
    let parsed: { type: string; modifiers: string[]; language: string | null };
    try {
      parsed = parseSemanticSelector(m.token.key);
    } catch {
      bases.push(m);
      continue;
    }
    const isBase =
      parsed.modifiers.length === 0 && (parsed.language === null || parsed.language === '');
    if (isBase) {
      bases.push(m);
    } else {
      const list = variantsByType.get(parsed.type) ?? [];
      list.push(m);
      variantsByType.set(parsed.type, list);
    }
  }
  bases.sort((a, b) => a.token.key.localeCompare(b.token.key));
  const blocks: SemanticBlock[] = [];
  for (const base of bases) {
    const type = base.token.key;
    const variants = (variantsByType.get(type) ?? []).slice().sort((a, b) => a.token.key.localeCompare(b.token.key));
    blocks.push({ base, variants });
  }
  const starVariants = (variantsByType.get(SEMANTIC_WILDCARD_TYPE) ?? [])
    .slice()
    .sort((a, b) => a.token.key.localeCompare(b.token.key));
  blocks.push({ base: VIRTUAL_STAR_BASE, variants: starVariants });
  return blocks;
}

function GroupSection({
  groupKey,
  groupLabel,
  byType,
  sortedGroups,
  sortedColorVariables,
  sortedContrastVariables,
  sortedSemanticTokenModifiers,
  sortedSemanticTokenLanguages,
  orphanKeys,
  canEdit,
  onUpdateGroupRef,
  onUpdateColorRef,
  onUpdateContrastRef,
  semanticVariant,
  onRemoveMapping,
}: {
  groupKey: string;
  groupLabel: string;
  byType: Record<TokenType, Mapping[]>;
  sortedGroups: readonly string[];
  sortedColorVariables: readonly ColorVariable[];
  sortedContrastVariables: readonly ContrastVariable[];
  sortedSemanticTokenModifiers: readonly string[];
  sortedSemanticTokenLanguages: readonly string[];
  orphanKeys: Set<string>;
  canEdit: boolean;
  onUpdateGroupRef: (tokenKey: string, tokenType: TokenType, groupRef: string | null) => void;
  onUpdateColorRef: (tokenKey: string, tokenType: TokenType, ref: ColorVariableKey | null) => void;
  onUpdateContrastRef: (tokenKey: string, tokenType: TokenType, ref: ContrastVariableKey | null) => void;
  semanticVariant?: SemanticVariantProps;
  onRemoveMapping?: (tokenKey: string, tokenType: TokenType) => void;
}) {
  const sectionGroupRef = groupKey === UNGROUPED_KEY ? null : groupKey;
  const [collapsed, setCollapsed] = useState(false);
  const totalInGroup = DISPLAYED_TOKEN_TYPES.reduce((sum, tt) => sum + byType[tt].length, 0);
  const toggleCollapsed = () => setCollapsed((v) => !v);

  return (
    <div className="tree-section">
      <button
        type="button"
        className="tree-header"
        onClick={toggleCollapsed}
      >
        <span className="material-symbols-outlined tree-chevron">
          {collapsed ? 'chevron_right' : 'expand_more'}
        </span>
        <span className="tree-label">{groupLabel}</span>
        <span className="tree-count">({totalInGroup})</span>
      </button>
      {!collapsed && (
        <div className="tree-children">
          {DISPLAYED_TOKEN_TYPES.map((tt) => {
            const hasMappings = byType[tt].length > 0;
            const showSemanticWithVirtual =
              tt === 'semantic token' && semanticVariant !== undefined;
            if (!hasMappings && !showSemanticWithVirtual) return null;
            return (
              <MappingTypeSection
                key={tt}
                tokenType={tt}
                mappings={byType[tt]}
                sectionGroupRef={sectionGroupRef}
                sortedGroups={sortedGroups}
                sortedColorVariables={sortedColorVariables}
                sortedContrastVariables={sortedContrastVariables}
                sortedSemanticTokenModifiers={sortedSemanticTokenModifiers}
                sortedSemanticTokenLanguages={sortedSemanticTokenLanguages}
                orphanKeys={orphanKeys}
                canEdit={canEdit}
                onUpdateGroupRef={onUpdateGroupRef}
                onUpdateColorRef={onUpdateColorRef}
                onUpdateContrastRef={onUpdateContrastRef}
                semanticVariant={semanticVariant}
                onRemoveMapping={onRemoveMapping}
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
  sectionGroupRef,
  sortedGroups,
  sortedColorVariables,
  sortedContrastVariables,
  sortedSemanticTokenModifiers,
  sortedSemanticTokenLanguages,
  orphanKeys,
  canEdit,
  onUpdateGroupRef,
  onUpdateColorRef,
  onUpdateContrastRef,
  semanticVariant,
  onRemoveMapping,
}: {
  tokenType: TokenType;
  mappings: Mapping[];
  sectionGroupRef: string | null;
  sortedGroups: readonly string[];
  sortedColorVariables: readonly ColorVariable[];
  sortedContrastVariables: readonly ContrastVariable[];
  sortedSemanticTokenModifiers: readonly string[];
  sortedSemanticTokenLanguages: readonly string[];
  orphanKeys: Set<string>;
  canEdit: boolean;
  onUpdateGroupRef: (tokenKey: string, tokenType: TokenType, groupRef: string | null) => void;
  onUpdateColorRef: (tokenKey: string, tokenType: TokenType, ref: ColorVariableKey | null) => void;
  onUpdateContrastRef: (tokenKey: string, tokenType: TokenType, ref: ContrastVariableKey | null) => void;
  semanticVariant?: SemanticVariantProps;
  onRemoveMapping?: (tokenKey: string, tokenType: TokenType) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const label = tokenTypeLabel(tokenType);
  const isSemanticWithVariants =
    tokenType === 'semantic token' && semanticVariant !== undefined;
  const toggleCollapsed = () => setCollapsed((v) => !v);

  const semanticBlocks = useMemo(
    () => (isSemanticWithVariants ? buildSemanticBlocks(mappings) : null),
    [isSemanticWithVariants, mappings],
  );

  return (
    <div className="tree-section">
      <button
        type="button"
        className="tree-header"
        onClick={toggleCollapsed}
      >
        <span className="material-symbols-outlined tree-chevron">
          {collapsed ? 'chevron_right' : 'expand_more'}
        </span>
        <span className="tree-label">{label}</span>
        <span className="tree-count">({mappings.length})</span>
      </button>

      {!collapsed && (
        <div className="tree-children">
          {isSemanticWithVariants && semanticBlocks && semanticVariant ? (
            semanticBlocks.map(({ base, variants }) => (
              <SemanticBlockRows
                key={base.token.key}
                base={base}
                variants={variants}
                sectionGroupRef={sectionGroupRef}
                sortedGroups={sortedGroups}
                sortedColorVariables={sortedColorVariables}
                sortedContrastVariables={sortedContrastVariables}
                sortedSemanticTokenModifiers={sortedSemanticTokenModifiers}
                sortedSemanticTokenLanguages={sortedSemanticTokenLanguages}
                orphanKeys={orphanKeys}
                canEdit={canEdit}
                semanticVariant={semanticVariant}
                onUpdateGroupRef={onUpdateGroupRef}
                onUpdateColorRef={onUpdateColorRef}
                onUpdateContrastRef={onUpdateContrastRef}
                onRemoveMapping={onRemoveMapping ?? noopRemoveMapping}
              />
            ))
          ) : (
            <VirtualizedRowList
              items={mappings}
              getItemKey={(m) => `${m.token.type}::${m.token.key}`}
              estimateSize={() => 36}
              renderItem={(m) => {
                const mKey = `${m.token.type}::${m.token.key}`;
                return (
                  <MappingRow
                    mapping={m}
                    isOrphan={orphanKeys.has(mKey)}
                    canEdit={canEdit}
                    sortedGroups={sortedGroups}
                    sortedColorVariables={sortedColorVariables}
                    sortedContrastVariables={sortedContrastVariables}
                    onUpdateGroupRef={onUpdateGroupRef}
                    onUpdateColorRef={onUpdateColorRef}
                    onUpdateContrastRef={onUpdateContrastRef}
                  />
                );
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}

function SemanticBlockRows({
  base,
  variants,
  sectionGroupRef,
  sortedGroups,
  sortedColorVariables,
  sortedContrastVariables,
  sortedSemanticTokenModifiers,
  sortedSemanticTokenLanguages,
  orphanKeys,
  canEdit,
  semanticVariant,
  onUpdateGroupRef,
  onUpdateColorRef,
  onUpdateContrastRef,
  onRemoveMapping,
}: {
  base: Mapping;
  variants: Mapping[];
  sectionGroupRef: string | null;
  sortedGroups: readonly string[];
  sortedColorVariables: readonly ColorVariable[];
  sortedContrastVariables: readonly ContrastVariable[];
  sortedSemanticTokenModifiers: readonly string[];
  sortedSemanticTokenLanguages: readonly string[];
  orphanKeys: Set<string>;
  canEdit: boolean;
  semanticVariant: SemanticVariantProps;
  onUpdateGroupRef: (tokenKey: string, tokenType: TokenType, groupRef: string | null) => void;
  onUpdateColorRef: (tokenKey: string, tokenType: TokenType, ref: ColorVariableKey | null) => void;
  onUpdateContrastRef: (tokenKey: string, tokenType: TokenType, ref: ContrastVariableKey | null) => void;
  onRemoveMapping: (tokenKey: string, tokenType: TokenType) => void;
}) {
  const baseKey = `${base.token.type}::${base.token.key}`;
  const isVirtualStarBase = base.token.key === SEMANTIC_WILDCARD_TYPE;
  const isBaseOrphan = !isVirtualStarBase && orphanKeys.has(baseKey);
  const isBaseBlockingLock = !isVirtualStarBase && !base.colorVariableRef;
  const type = base.token.key;

  const [openModifierKey, setOpenModifierKey] = useState<string | null>(null);
  const commitModifiersWithOpenState = useCallback(
    (oldKey: string, modifiers: string[]) => {
      try {
        const parsed = parseSemanticSelector(oldKey);
        const newKey = formatSemanticSelector(parsed.type, modifiers, parsed.language);
        semanticVariant.onCommitSemanticTokenModifiers(oldKey, modifiers);
        if (openModifierKey === oldKey) setOpenModifierKey(newKey);
      } catch {
        semanticVariant.onCommitSemanticTokenModifiers(oldKey, modifiers);
      }
    },
    [semanticVariant, openModifierKey],
  );
  const commitLanguageWithOpenState = useCallback(
    (oldKey: string, language: string | null) => {
      try {
        const parsed = parseSemanticSelector(oldKey);
        const newKey = formatSemanticSelector(parsed.type, parsed.modifiers, language);
        semanticVariant.onCommitSemanticTokenLanguage(oldKey, language);
        if (openModifierKey === oldKey) setOpenModifierKey(newKey);
      } catch {
        semanticVariant.onCommitSemanticTokenLanguage(oldKey, language);
      }
    },
    [semanticVariant, openModifierKey],
  );
  const handleBaseGroupChange = (value: string) =>
    onUpdateGroupRef(base.token.key, base.token.type, value || null);
  const handleBaseColorChange = (value: string) =>
    onUpdateColorRef(base.token.key, base.token.type, value || null);
  const handleBaseContrastChange = (value: string) =>
    onUpdateContrastRef(base.token.key, base.token.type, value || null);

  function onBaseGroupSelectChange(e: ChangeEvent<HTMLSelectElement>) {
    handleBaseGroupChange(e.target.value);
  }

  function onBaseColorSelectChange(e: ChangeEvent<HTMLSelectElement>) {
    handleBaseColorChange(e.target.value);
  }

  function onBaseContrastSelectChange(e: ChangeEvent<HTMLSelectElement>) {
    handleBaseContrastChange(e.target.value);
  }

  const handleAddVariant = () =>
    semanticVariant.onAddSemanticVariant(
      type,
      type === SEMANTIC_WILDCARD_TYPE ? sectionGroupRef : undefined,
    );

  return (
    <div className="mapping-semantic-block">
      <div
        className={`mapping-row mapping-row-base ${isVirtualStarBase ? 'mapping-row-virtual-star ' : ''}${isBaseOrphan ? 'mapping-orphan' : ''} ${isBaseBlockingLock ? 'mapping-blocking-lock' : ''}`}
      >
        {isVirtualStarBase ? (
          <select
            className="field-select mapping-var-select mapping-col-group mapping-col-group-virtual"
            value={sectionGroupRef ?? ''}
            disabled
            title="Group (virtual * base)"
            aria-label="Group for wildcard variants"
          >
            <option value="">Ungrouped</option>
            {sortedGroups.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        ) : (
          <select
            className="field-select mapping-var-select mapping-col-group"
            value={base.groupRef ?? ''}
            disabled={!canEdit}
            onChange={onBaseGroupSelectChange}
            title="Group"
          >
            <option value="">Ungrouped</option>
            {sortedGroups.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        )}
        <div className="mapping-col-name">
          <span
            className={`mapping-token-name${isVirtualStarBase ? ' mapping-token-name-virtual' : ''}`}
            title={base.token.key}
          >
            {base.token.key}
          </span>
          {isBaseOrphan && (
            <span
              className="material-symbols-outlined mapping-warning-icon"
              title="Token not found in any included catalog"
            >
              warning
            </span>
          )}
        </div>
        {isVirtualStarBase ? (
          <>
            <div className="mapping-col-color" aria-hidden="true" />
            <div className="mapping-col-contrast" aria-hidden="true" />
          </>
        ) : (
          <>
            <select
              className="field-select mapping-var-select mapping-col-color"
              value={base.colorVariableRef ?? ''}
              disabled={!canEdit}
              onChange={onBaseColorSelectChange}
            >
              <option value="">— color —</option>
              {sortedColorVariables.map((v) => (
                <option key={v.key} value={v.key}>
                  {v.key}
                </option>
              ))}
            </select>
            <select
              className="field-select mapping-var-select mapping-col-contrast"
              value={base.contrastVariableRef ?? ''}
              disabled={!canEdit}
              onChange={onBaseContrastSelectChange}
            >
              <option value="">— contrast —</option>
              {sortedContrastVariables.map((v) => (
                <option key={v.key} value={v.key}>
                  {v.key}
                </option>
              ))}
            </select>
          </>
        )}
        {canEdit && semanticVariant && (
          <div className="mapping-row-add-variant-wrap mapping-col-action">
            <button
              type="button"
              className="mapping-row-add-variant-btn"
              onClick={handleAddVariant}
              title="Add variant"
              aria-label="Add semantic token variant"
            >
              <span className="material-symbols-outlined">add</span>
            </button>
          </div>
        )}
      </div>
      <VirtualizedRowList
        items={variants}
        getItemKey={(_m, idx) => `${base.token.key}::v::${idx}`}
        estimateSize={() => 40}
        renderItem={(m) => {
          function onOpenModifierDropdown() {
            setOpenModifierKey(m.token.key);
          }
          function onCloseModifierDropdown() {
            setOpenModifierKey(null);
          }
          return (
            <SemanticVariantRow
              mapping={m}
              isOrphan={orphanKeys.has(`${m.token.type}::${m.token.key}`)}
              canEdit={canEdit}
              sortedGroups={sortedGroups}
              sortedColorVariables={sortedColorVariables}
              sortedContrastVariables={sortedContrastVariables}
              sortedSemanticTokenModifiers={sortedSemanticTokenModifiers}
              sortedSemanticTokenLanguages={sortedSemanticTokenLanguages}
              onUpdateGroupRef={onUpdateGroupRef}
              commitSemanticModifiers={commitModifiersWithOpenState}
              commitSemanticLanguage={commitLanguageWithOpenState}
              isModifierOpen={openModifierKey === m.token.key}
              onOpenModifierDropdown={onOpenModifierDropdown}
              onCloseModifierDropdown={onCloseModifierDropdown}
              onUpdateColorRef={onUpdateColorRef}
              onUpdateContrastRef={onUpdateContrastRef}
              onRemoveMapping={onRemoveMapping}
            />
          );
        }}
      />
    </div>
  );
}

/**
 * Renders token mapping rows, filters, and semantic variant editors.
 * @returns Mappings card UI wired to its viewmodel.
 */
export function MappingsCard() {
  const {
    template,
    mappingsByGroup,
    groupKeysInOrder,
    sortedGroups,
    sortedColorVariables,
    sortedContrastVariables,
    sortedSemanticTokenModifiers,
    sortedSemanticTokenLanguages,
    orphanKeys,
    canEdit,
    mappingSearchText: searchQuery,
    mappingColorVariableFilter: selectedColorKeys,
    mappingContrastVariableFilter: selectedContrastKeys,
    onUpdateGroupRef,
    onUpdateColorRef,
    onUpdateContrastRef,
    semanticVariant,
    onRemoveMapping,
    setMappingSearchText,
    setMappingColorVariableFilter,
    setMappingContrastVariableFilter,
  } = useMappingsCardViewModel();

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

  const toggleColorKey = useCallback(
    (key: string) => {
      const next = selectedColorKeys.includes(key as ColorVariableKey)
        ? selectedColorKeys.filter((k: ColorVariableKey) => k !== key)
        : [...selectedColorKeys, key as ColorVariableKey];
      setMappingColorVariableFilter(next);
    },
    [selectedColorKeys, setMappingColorVariableFilter],
  );

  const toggleContrastKey = useCallback(
    (key: string) => {
      const next = selectedContrastKeys.includes(key as ContrastVariableKey)
        ? selectedContrastKeys.filter((k: ContrastVariableKey) => k !== key)
        : [...selectedContrastKeys, key as ContrastVariableKey];
      setMappingContrastVariableFilter(next);
    },
    [selectedContrastKeys, setMappingContrastVariableFilter],
  );

  const handleColorFilterOptionClick = useCallback((e: ReactMouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const key = e.currentTarget.dataset.filterKey;
    if (key) toggleColorKey(key);
  }, [toggleColorKey]);

  const handleContrastFilterOptionClick = useCallback((e: ReactMouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const key = e.currentTarget.dataset.filterKey;
    if (key) toggleContrastKey(key);
  }, [toggleContrastKey]);

  if (!template) return null;

  const handleSearchTextChange = (value: string) => {
    setMappingSearchText(value);
  };

  function onMappingSearchInputChange(e: ChangeEvent<HTMLInputElement>) {
    handleSearchTextChange(e.target.value);
  }

  const handleToggleColorFilterDropdown = () => setOpenFilter((v) => (v === 'color' ? null : 'color'));
  const handleToggleContrastFilterDropdown = () =>
    setOpenFilter((v) => (v === 'contrast' ? null : 'contrast'));

  return (
    <div className="tokens-card placeholder">
      <h2>Mappings</h2>
      <div className="mappings-filter-row">
        <input
          type="text"
          className="mappings-filter-search"
          placeholder="Search…"
          value={searchQuery}
          onChange={onMappingSearchInputChange}
          aria-label="Search mappings"
        />
        <div className="mappings-filter-dropdown-wrap" ref={colorDropdownRef}>
          <button
            type="button"
            className={`mappings-filter-btn ${openFilter === 'color' ? 'mappings-filter-btn-open' : ''} ${selectedColorKeys.length > 0 ? 'mappings-filter-btn-active' : ''}`}
            onClick={handleToggleColorFilterDropdown}
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
              {sortedColorVariables.length === 0 ? (
                <div className="mappings-filter-empty">No color variables</div>
              ) : (
                sortedColorVariables.map((v) => (
                  <label key={v.key} className="mappings-filter-check">
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={selectedColorKeys.includes(v.key)}
                      aria-label={`Filter by color variable ${v.key}`}
                      className="checkbox-icon-btn"
                      data-filter-key={v.key}
                      onClick={handleColorFilterOptionClick}
                    >
                      <span className="material-symbols-outlined" aria-hidden>
                        {selectedColorKeys.includes(v.key) ? 'check_box' : 'check_box_outline_blank'}
                      </span>
                    </button>
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
            onClick={handleToggleContrastFilterDropdown}
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
              {sortedContrastVariables.length === 0 ? (
                <div className="mappings-filter-empty">No contrast variables</div>
              ) : (
                sortedContrastVariables.map((v) => (
                  <label key={v.key} className="mappings-filter-check">
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={selectedContrastKeys.includes(v.key)}
                      aria-label={`Filter by contrast variable ${v.key}`}
                      className="checkbox-icon-btn"
                      data-filter-key={v.key}
                      onClick={handleContrastFilterOptionClick}
                    >
                      <span className="material-symbols-outlined" aria-hidden>
                        {selectedContrastKeys.includes(v.key) ? 'check_box' : 'check_box_outline_blank'}
                      </span>
                    </button>
                    <span>{v.key}</span>
                  </label>
                ))
              )}
            </div>
          )}
        </div>
      </div>
      {groupKeysInOrder.map((groupKey) => {
        const byType = mappingsByGroup.get(groupKey)!;
        const groupLabel = groupKey === UNGROUPED_KEY ? 'Ungrouped' : groupKey;
        return (
          <GroupSection
            key={groupKey}
            groupKey={groupKey}
            groupLabel={groupLabel}
            byType={byType}
            sortedGroups={sortedGroups}
            sortedColorVariables={sortedColorVariables}
            sortedContrastVariables={sortedContrastVariables}
            sortedSemanticTokenModifiers={sortedSemanticTokenModifiers}
            sortedSemanticTokenLanguages={sortedSemanticTokenLanguages}
            orphanKeys={orphanKeys}
            canEdit={canEdit}
            onUpdateGroupRef={onUpdateGroupRef}
            onUpdateColorRef={onUpdateColorRef}
            onUpdateContrastRef={onUpdateContrastRef}
            semanticVariant={semanticVariant}
            onRemoveMapping={onRemoveMapping}
          />
        );
      })}
    </div>
  );
}
