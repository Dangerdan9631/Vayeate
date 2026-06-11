import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { ContrastComparisonMethod } from '../../../model/schema/primitives';
import type { ColorVariable, ContrastVariable } from '../../../model/schema/template-schemas';
import type { ColorAssignment, ContrastAssignment, ContrastAssignmentValue } from '../../../model/schema/theme-schemas';
import { useThemeVariablesCardViewModel } from './use-theme-variables-card-viewmodel';
import { TriStateCheckbox, type TriState } from '../../common/tristate-checkbox/TriStateCheckbox';
import { ColorAssignmentRow } from './ColorAssignmentRow';
import { ContrastAssignmentRow } from './ContrastAssignmentRow';

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

function sortedGroupKeys(byGroup: Map<string, unknown[]>): string[] {
  const named = [...byGroup.keys()].filter((k) => k !== UNGROUPED_KEY).sort();
  const hasUngrouped = byGroup.has(UNGROUPED_KEY);
  return hasUngrouped ? [...named, UNGROUPED_KEY] : named;
}

function buildColorAssignmentsByGroup(
  assignments: readonly ColorAssignment[],
  colorVariables: readonly ColorVariable[],
): Map<string, ColorAssignment[]> {
  const varMap = new Map(colorVariables.map((v) => [v.key, v]));
  const byGroup = new Map<string, ColorAssignment[]>();
  for (const a of assignments) {
    const groupRef = varMap.get(a.colorRef)?.groupRef ?? null;
    const groupKey = groupRef ?? UNGROUPED_KEY;
    let list = byGroup.get(groupKey);
    if (!list) {
      list = [];
      byGroup.set(groupKey, list);
    }
    list.push(a);
  }
  return byGroup;
}

function buildContrastAssignmentsByGroup(
  assignments: readonly ContrastAssignment[],
  contrastVariables: readonly ContrastVariable[],
): Map<string, ContrastAssignment[]> {
  const varMap = new Map(contrastVariables.map((v) => [v.key, v]));
  const byGroup = new Map<string, ContrastAssignment[]>();
  for (const a of assignments) {
    const groupRef = varMap.get(a.contrastVariableRef)?.groupRef ?? null;
    const groupKey = groupRef ?? UNGROUPED_KEY;
    let list = byGroup.get(groupKey);
    if (!list) {
      list = [];
      byGroup.set(groupKey, list);
    }
    list.push(a);
  }
  return byGroup;
}

function ColorAssignmentsSection({
  assignments,
  colorVariables,
  orphanKeys,
  checkedColorRefs,
  onToggleColorChecked,
  sectionState,
  onSetAllColorChecked,
  onSetColorGroupChecked,
  onUpdateDark,
  onUpdateLight,
  onUpdateUseDark,
  onDarkEyedropperClick,
  onLightEyedropperClick,
}: {
  assignments: readonly ColorAssignment[];
  colorVariables: readonly ColorVariable[];
  orphanKeys: Set<string>;
  checkedColorRefs: ReadonlySet<string>;
  onToggleColorChecked: (ref: string) => void;
  sectionState: TriState;
  onSetAllColorChecked: (checked: boolean) => void;
  onSetColorGroupChecked: (groupKey: string, checked: boolean) => void;
  onUpdateDark: (colorRef: string, value: string | null) => void;
  onUpdateLight: (colorRef: string, value: string | null) => void;
  onUpdateUseDark: (colorRef: string, useDark: boolean) => void;
  onDarkEyedropperClick: (colorRef: string) => void;
  onLightEyedropperClick: (colorRef: string) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const byGroup = useMemo(
    () => buildColorAssignmentsByGroup(assignments, colorVariables),
    [assignments, colorVariables],
  );
  const groupKeysInOrder = useMemo(() => sortedGroupKeys(byGroup), [byGroup]);

  function onColorAssignmentsSectionHeaderToggleClick() {
    setCollapsed((c) => !c);
  }

  return (
    <div className="tree-section">
      <div className="tree-header tree-header-with-checkbox">
        <TriStateCheckbox
          state={sectionState}
          onChange={onSetAllColorChecked}
          ariaLabel="Select all color variables"
          className="tree-section-checkbox"
        />
        <button
          type="button"
          className="tree-header-toggle"
          onClick={onColorAssignmentsSectionHeaderToggleClick}
          aria-expanded={!collapsed}
        >
          <span className="material-symbols-outlined tree-chevron">
            {collapsed ? 'chevron_right' : 'expand_more'}
          </span>
          <span className="tree-label">Color Variables</span>
          <span className="tree-count">({assignments.length})</span>
        </button>
      </div>

      {!collapsed && (
        <div className="tree-children">
          {groupKeysInOrder.map((groupKey) => {
            const groupAssignments = byGroup.get(groupKey) ?? [];
            const groupLabel = groupKey === UNGROUPED_KEY ? 'Ungrouped' : groupKey;
            const refsInGroup = groupAssignments.map((a) => a.colorRef);
            const groupState: TriState =
              refsInGroup.length === 0
                ? 'none'
                : refsInGroup.every((r) => checkedColorRefs.has(r))
                  ? 'all'
                  : refsInGroup.every((r) => !checkedColorRefs.has(r))
                    ? 'none'
                    : 'some';
            return (
              <ColorAssignmentsGroupSubsection
                key={groupKey}
                groupKey={groupKey}
                groupLabel={groupLabel}
                groupState={groupState}
                assignments={groupAssignments}
                orphanKeys={orphanKeys}
                checkedColorRefs={checkedColorRefs}
                onToggleColorChecked={onToggleColorChecked}
                onSetColorGroupChecked={onSetColorGroupChecked}
                onUpdateDark={onUpdateDark}
                onUpdateLight={onUpdateLight}
                onUpdateUseDark={onUpdateUseDark}
                onDarkEyedropperClick={onDarkEyedropperClick}
                onLightEyedropperClick={onLightEyedropperClick}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function ColorAssignmentsGroupSubsection({
  groupKey,
  groupLabel,
  groupState,
  assignments,
  orphanKeys,
  checkedColorRefs,
  onToggleColorChecked,
  onSetColorGroupChecked,
  onUpdateDark,
  onUpdateLight,
  onUpdateUseDark,
  onDarkEyedropperClick,
  onLightEyedropperClick,
}: {
  groupKey: string;
  groupLabel: string;
  groupState: TriState;
  assignments: readonly ColorAssignment[];
  orphanKeys: Set<string>;
  checkedColorRefs: ReadonlySet<string>;
  onToggleColorChecked: (ref: string) => void;
  onSetColorGroupChecked: (groupKey: string, checked: boolean) => void;
  onUpdateDark: (colorRef: string, value: string | null) => void;
  onUpdateLight: (colorRef: string, value: string | null) => void;
  onUpdateUseDark: (colorRef: string, useDark: boolean) => void;
  onDarkEyedropperClick: (colorRef: string) => void;
  onLightEyedropperClick: (colorRef: string) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);

  function onColorGroupTriStateChange(checked: boolean) {
    onSetColorGroupChecked(groupKey, checked);
  }

  function onColorGroupHeaderToggleClick() {
    setCollapsed((c) => !c);
  }

  return (
    <div className="tree-section">
      <div className="tree-header tree-header-with-checkbox">
        <TriStateCheckbox
          state={groupState}
          onChange={onColorGroupTriStateChange}
          ariaLabel={`Select all in group: ${groupLabel}`}
          className="tree-section-checkbox"
        />
        <button
          type="button"
          className="tree-header-toggle"
          onClick={onColorGroupHeaderToggleClick}
          aria-expanded={!collapsed}
        >
          <span className="material-symbols-outlined tree-chevron">
            {collapsed ? 'chevron_right' : 'expand_more'}
          </span>
          <span className="tree-label">{groupLabel}</span>
          <span className="tree-count">({assignments.length})</span>
        </button>
      </div>
      {!collapsed && (
        <div className="tree-children">
          <VirtualizedRowList
            items={assignments}
            getItemKey={(a) => a.colorRef}
            estimateSize={() => 40}
            emptyHint="No color variables"
            renderItem={(a) => (
              <ColorAssignmentRow
                assignment={a}
                isOrphan={orphanKeys.has(a.colorRef)}
                checked={checkedColorRefs.has(a.colorRef)}
                onToggleChecked={onToggleColorChecked}
                onUpdateDark={onUpdateDark}
                onUpdateLight={onUpdateLight}
                onUpdateUseDark={onUpdateUseDark}
                onDarkEyedropperClick={onDarkEyedropperClick}
                onLightEyedropperClick={onLightEyedropperClick}
              />
            )}
          />
        </div>
      )}
    </div>
  );
}

function ContrastAssignmentsSection({
  assignments,
  contrastVariables,
  orphanKeys,
  checkedContrastRefs,
  onToggleContrastChecked,
  sectionState,
  onSetAllContrastChecked,
  onSetContrastGroupChecked,
  onUpdateDark,
  onUpdateLight,
  onUpdateUseDark,
}: {
  assignments: readonly ContrastAssignment[];
  contrastVariables: readonly ContrastVariable[];
  orphanKeys: Set<string>;
  checkedContrastRefs: ReadonlySet<string>;
  onToggleContrastChecked: (ref: string) => void;
  sectionState: TriState;
  onSetAllContrastChecked: (checked: boolean) => void;
  onSetContrastGroupChecked: (groupKey: string, checked: boolean) => void;
  onUpdateDark: (contrastRef: string, field: keyof ContrastAssignmentValue, value: number | ContrastComparisonMethod | null) => void;
  onUpdateLight: (contrastRef: string, field: keyof ContrastAssignmentValue, value: number | ContrastComparisonMethod | null) => void;
  onUpdateUseDark: (contrastRef: string, useDark: boolean) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const varMap = useMemo(
    () => new Map(contrastVariables.map((v) => [v.key, v])),
    [contrastVariables],
  );
  const byGroup = useMemo(
    () => buildContrastAssignmentsByGroup(assignments, contrastVariables),
    [assignments, contrastVariables],
  );
  const groupKeysInOrder = useMemo(() => sortedGroupKeys(byGroup), [byGroup]);

  function onContrastAssignmentsSectionHeaderToggleClick() {
    setCollapsed((c) => !c);
  }

  return (
    <div className="tree-section">
      <div className="tree-header tree-header-with-checkbox">
        <TriStateCheckbox
          state={sectionState}
          onChange={onSetAllContrastChecked}
          ariaLabel="Select all contrast variables"
          className="tree-section-checkbox"
        />
        <button
          type="button"
          className="tree-header-toggle"
          onClick={onContrastAssignmentsSectionHeaderToggleClick}
          aria-expanded={!collapsed}
        >
          <span className="material-symbols-outlined tree-chevron">
            {collapsed ? 'chevron_right' : 'expand_more'}
          </span>
          <span className="tree-label">Contrast Variables</span>
          <span className="tree-count">({assignments.length})</span>
        </button>
      </div>

      {!collapsed && (
        <div className="tree-children">
          {groupKeysInOrder.map((groupKey) => {
            const groupAssignments = byGroup.get(groupKey) ?? [];
            const groupLabel = groupKey === UNGROUPED_KEY ? 'Ungrouped' : groupKey;
            const refsInGroup = groupAssignments.map((a) => a.contrastVariableRef);
            const groupState: TriState =
              refsInGroup.length === 0
                ? 'none'
                : refsInGroup.every((r) => checkedContrastRefs.has(r))
                  ? 'all'
                  : refsInGroup.every((r) => !checkedContrastRefs.has(r))
                    ? 'none'
                    : 'some';
            return (
              <ContrastAssignmentsGroupSubsection
                key={groupKey}
                groupKey={groupKey}
                groupLabel={groupLabel}
                groupState={groupState}
                assignments={groupAssignments}
                varMap={varMap}
                orphanKeys={orphanKeys}
                checkedContrastRefs={checkedContrastRefs}
                onToggleContrastChecked={onToggleContrastChecked}
                onSetContrastGroupChecked={onSetContrastGroupChecked}
                onUpdateDark={onUpdateDark}
                onUpdateLight={onUpdateLight}
                onUpdateUseDark={onUpdateUseDark}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function ContrastAssignmentsGroupSubsection({
  groupKey,
  groupLabel,
  groupState,
  assignments,
  varMap,
  orphanKeys,
  checkedContrastRefs,
  onToggleContrastChecked,
  onSetContrastGroupChecked,
  onUpdateDark,
  onUpdateLight,
  onUpdateUseDark,
}: {
  groupKey: string;
  groupLabel: string;
  groupState: TriState;
  assignments: readonly ContrastAssignment[];
  varMap: Map<string, ContrastVariable>;
  orphanKeys: Set<string>;
  checkedContrastRefs: ReadonlySet<string>;
  onToggleContrastChecked: (ref: string) => void;
  onSetContrastGroupChecked: (groupKey: string, checked: boolean) => void;
  onUpdateDark: (contrastRef: string, field: keyof ContrastAssignmentValue, value: number | ContrastComparisonMethod | null) => void;
  onUpdateLight: (contrastRef: string, field: keyof ContrastAssignmentValue, value: number | ContrastComparisonMethod | null) => void;
  onUpdateUseDark: (contrastRef: string, useDark: boolean) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);

  function onContrastGroupTriStateChange(checked: boolean) {
    onSetContrastGroupChecked(groupKey, checked);
  }

  function onContrastGroupHeaderToggleClick() {
    setCollapsed((c) => !c);
  }

  return (
    <div className="tree-section">
      <div className="tree-header tree-header-with-checkbox">
        <TriStateCheckbox
          state={groupState}
          onChange={onContrastGroupTriStateChange}
          ariaLabel={`Select all in group: ${groupLabel}`}
          className="tree-section-checkbox"
        />
        <button
          type="button"
          className="tree-header-toggle"
          onClick={onContrastGroupHeaderToggleClick}
          aria-expanded={!collapsed}
        >
          <span className="material-symbols-outlined tree-chevron">
            {collapsed ? 'chevron_right' : 'expand_more'}
          </span>
          <span className="tree-label">{groupLabel}</span>
          <span className="tree-count">({assignments.length})</span>
        </button>
      </div>
      {!collapsed && (
        <div className="tree-children">
          <VirtualizedRowList
            items={assignments}
            getItemKey={(a) => a.contrastVariableRef}
            estimateSize={() => 88}
            emptyHint="No contrast variables"
            renderItem={(a) => (
              <ContrastAssignmentRow
                assignment={a}
                variable={varMap.get(a.contrastVariableRef) ?? null}
                isOrphan={orphanKeys.has(a.contrastVariableRef)}
                checked={checkedContrastRefs.has(a.contrastVariableRef)}
                onToggleChecked={onToggleContrastChecked}
                onUpdateDark={onUpdateDark}
                onUpdateLight={onUpdateLight}
                onUpdateUseDark={onUpdateUseDark}
              />
            )}
          />
        </div>
      )}
    </div>
  );
}

/**
 * Renders the Theme Variables Card UI for the theme editor.
 */
export function ThemeVariablesCard() {
  const {
    themeTemplateRef,
    colorAssignments,
    contrastAssignments,
    colorVariables,
    contrastVariables,
    orphanColorKeys,
    orphanContrastKeys,
    checkedColorRefs,
    checkedContrastRefs,
    onToggleColorChecked,
    onToggleContrastChecked,
    onSetAllColorChecked,
    onSetAllContrastChecked,
    onSetAllVariablesChecked,
    onSetColorGroupChecked,
    onSetContrastGroupChecked,
    colorSectionState,
    contrastSectionState,
    cardState,
    onUpdateColorDark,
    onUpdateColorLight,
    onUpdateColorUseDark,
    onUpdateContrastDark,
    onUpdateContrastLight,
    onUpdateContrastUseDark,
    onColorDarkEyedropperClick,
    onColorLightEyedropperClick,
    searchValue: searchQuery,
    onSearchChange: setSearchQuery,
  } = useThemeVariablesCardViewModel();

  if (!themeTemplateRef) return null;

  function onThemeVariablesSearchInputChange(e: ChangeEvent<HTMLInputElement>) {
    setSearchQuery(e.target.value);
  }

  return (
    <div className="tokens-card placeholder">
      <div className="theme-variables-card-header">
        <TriStateCheckbox
          state={cardState}
          onChange={onSetAllVariablesChecked}
          ariaLabel="Select all variables for palette adjustments"
          className="theme-variables-card-checkbox"
        />
        <h2>Variables</h2>
      </div>
      <input
        type="text"
        className="card-search-input"
        placeholder="Search…"
        value={searchQuery}
        onChange={onThemeVariablesSearchInputChange}
        aria-label="Search variables"
      />
      <ColorAssignmentsSection
        assignments={colorAssignments}
        colorVariables={colorVariables}
        orphanKeys={orphanColorKeys}
        checkedColorRefs={checkedColorRefs}
        onToggleColorChecked={onToggleColorChecked}
        sectionState={colorSectionState}
        onSetAllColorChecked={onSetAllColorChecked}
        onSetColorGroupChecked={onSetColorGroupChecked}
        onUpdateDark={onUpdateColorDark}
        onUpdateLight={onUpdateColorLight}
        onUpdateUseDark={onUpdateColorUseDark}
        onDarkEyedropperClick={onColorDarkEyedropperClick}
        onLightEyedropperClick={onColorLightEyedropperClick}
      />
      <ContrastAssignmentsSection
        assignments={contrastAssignments}
        contrastVariables={contrastVariables}
        orphanKeys={orphanContrastKeys}
        checkedContrastRefs={checkedContrastRefs}
        onToggleContrastChecked={onToggleContrastChecked}
        sectionState={contrastSectionState}
        onSetAllContrastChecked={onSetAllContrastChecked}
        onSetContrastGroupChecked={onSetContrastGroupChecked}
        onUpdateDark={onUpdateContrastDark}
        onUpdateLight={onUpdateContrastLight}
        onUpdateUseDark={onUpdateContrastUseDark}
      />
    </div>
  );
}
