import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type MouseEvent as ReactMouseEvent,
} from 'react';
import { useMappingsCardViewModel } from '../viewmodel/use-mappings-card-viewmodel';
import { formatSemanticSelector } from '../../../model/format-semantic-selector';
import { parseSemanticSelector } from '../../../model/parse-semantic-selector';
import { SEMANTIC_WILDCARD_TYPE } from '../../../model/semantic-token-constants';
import type { ColorVariableKey, ContrastVariableKey, TokenType } from '../../../model/schema/primitives';
import type { ColorVariable, ContrastVariable, Mapping } from '../../../model/schema/template-schemas';

const UNGROUPED_KEY = '__ungrouped__';

/** Placeholder modifier prefix for empty variant rows; filter out for display and when updating. */
const EMPTY_VARIANT_MODIFIER_PREFIX = 'empty-';

/** Virtual base for "*" (display-only; never persisted). */
const VIRTUAL_STAR_BASE: Mapping = {
  token: { key: SEMANTIC_WILDCARD_TYPE, type: 'semantic token' },
  colorVariableRef: null,
  contrastVariableRef: null,
  groupRef: null,
};

const DISPLAYED_TOKEN_TYPES: TokenType[] = ['theme', 'textmate token', 'semantic token'];

export interface SemanticVariantProps {
  semanticTokenModifiers: readonly string[];
  semanticTokenLanguages: readonly string[];
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
  groups,
  colorVariables,
  contrastVariables,
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
  groups: readonly string[];
  colorVariables: readonly ColorVariable[];
  contrastVariables: readonly ContrastVariable[];
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
                groups={groups}
                colorVariables={colorVariables}
                contrastVariables={contrastVariables}
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
  groups,
  colorVariables,
  contrastVariables,
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
  groups: readonly string[];
  colorVariables: readonly ColorVariable[];
  contrastVariables: readonly ContrastVariable[];
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

  const semanticBlocks = isSemanticWithVariants ? buildSemanticBlocks(mappings) : null;
  const handleGroupRefChange =
    (m: Mapping) =>
    (value: string) =>
      onUpdateGroupRef(m.token.key, m.token.type, value || null);
  const handleColorRefChange =
    (m: Mapping) =>
    (value: string) =>
      onUpdateColorRef(m.token.key, m.token.type, value || null);
  const handleContrastRefChange =
    (m: Mapping) =>
    (value: string) =>
      onUpdateContrastRef(m.token.key, m.token.type, value || null);

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
                groups={groups}
                colorVariables={colorVariables}
                contrastVariables={contrastVariables}
                orphanKeys={orphanKeys}
                canEdit={canEdit}
                semanticVariant={semanticVariant}
                onUpdateGroupRef={onUpdateGroupRef}
                onUpdateColorRef={onUpdateColorRef}
                onUpdateContrastRef={onUpdateContrastRef}
                onRemoveMapping={onRemoveMapping ?? (() => {})}
              />
            ))
          ) : (
            mappings.map((m) => {
              const mKey = `${m.token.type}::${m.token.key}`;
              const isOrphan = orphanKeys.has(mKey);
              const isBlockingLock = !m.colorVariableRef;

              function onMappingGroupRefSelectChange(e: ChangeEvent<HTMLSelectElement>) {
                handleGroupRefChange(m)(e.target.value);
              }

              function onMappingColorRefSelectChange(e: ChangeEvent<HTMLSelectElement>) {
                handleColorRefChange(m)(e.target.value);
              }

              function onMappingContrastRefSelectChange(e: ChangeEvent<HTMLSelectElement>) {
                handleContrastRefChange(m)(e.target.value);
              }

              return (
                <div
                  key={mKey}
                  className={`mapping-row ${isOrphan ? 'mapping-orphan' : ''} ${isBlockingLock ? 'mapping-blocking-lock' : ''}`}
                >
                  <select
                    className="field-select mapping-var-select"
                    value={m.groupRef ?? ''}
                    disabled={!canEdit}
                    onChange={onMappingGroupRefSelectChange}
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
                    onChange={onMappingColorRefSelectChange}
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
                    onChange={onMappingContrastRefSelectChange}
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
            })
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
  groups,
  colorVariables,
  contrastVariables,
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
  groups: readonly string[];
  colorVariables: readonly ColorVariable[];
  contrastVariables: readonly ContrastVariable[];
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
            {[...groups].sort((a, b) => a.localeCompare(b)).map((g) => (
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
            {[...groups].sort((a, b) => a.localeCompare(b)).map((g) => (
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
              {[...colorVariables].sort((a, b) => a.key.localeCompare(b.key)).map((v) => (
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
              {[...contrastVariables].sort((a, b) => a.key.localeCompare(b.key)).map((v) => (
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
      {variants.map((m, idx) => {
        function onOpenModifierDropdown() {
          setOpenModifierKey(m.token.key);
        }
        function onCloseModifierDropdown() {
          setOpenModifierKey(null);
        }
        return (
          <SemanticVariantRow
            key={`${base.token.key}::v::${idx}`}
            mapping={m}
            groups={groups}
            onUpdateGroupRef={onUpdateGroupRef}
            colorVariables={colorVariables}
            contrastVariables={contrastVariables}
            orphanKeys={orphanKeys}
            canEdit={canEdit}
            semanticVariant={semanticVariant}
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
      })}
    </div>
  );
}

function SemanticVariantRow({
  mapping,
  groups,
  onUpdateGroupRef,
  colorVariables,
  contrastVariables,
  orphanKeys,
  canEdit,
  semanticVariant,
  commitSemanticModifiers,
  commitSemanticLanguage,
  isModifierOpen,
  onOpenModifierDropdown,
  onCloseModifierDropdown,
  onUpdateColorRef,
  onUpdateContrastRef,
  onRemoveMapping,
}: {
  mapping: Mapping;
  groups: readonly string[];
  onUpdateGroupRef: (tokenKey: string, tokenType: TokenType, groupRef: string | null) => void;
  colorVariables: readonly ColorVariable[];
  contrastVariables: readonly ContrastVariable[];
  orphanKeys: Set<string>;
  canEdit: boolean;
  semanticVariant: SemanticVariantProps;
  commitSemanticModifiers: (oldKey: string, modifiers: string[]) => void;
  commitSemanticLanguage: (oldKey: string, language: string | null) => void;
  isModifierOpen: boolean;
  onOpenModifierDropdown: () => void;
  onCloseModifierDropdown: () => void;
  onUpdateColorRef: (tokenKey: string, tokenType: TokenType, ref: ColorVariableKey | null) => void;
  onUpdateContrastRef: (tokenKey: string, tokenType: TokenType, ref: ContrastVariableKey | null) => void;
  onRemoveMapping: (tokenKey: string, tokenType: TokenType) => void;
}) {
  const mKey = `${mapping.token.type}::${mapping.token.key}`;
  const isOrphan = orphanKeys.has(mKey);
  const isBlockingLock = !mapping.colorVariableRef;
  let parsed: { type: string; modifiers: string[]; language: string | null };
  try {
    parsed = parseSemanticSelector(mapping.token.key);
  } catch {
    parsed = { type: '', modifiers: [], language: null };
  }
  const isStarVariant = parsed.type === SEMANTIC_WILDCARD_TYPE;
  const displayModifiers = parsed.modifiers.filter(
    (m) => !m.startsWith(EMPTY_VARIANT_MODIFIER_PREFIX),
  );
  const [languageOpen, setLanguageOpen] = useState(false);
  const [pendingModifiers, setPendingModifiers] = useState<string[]>(displayModifiers);
  const modifierDropdownRef = useRef<HTMLDivElement>(null);
  const languageDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isModifierOpen) setPendingModifiers(displayModifiers);
  }, [isModifierOpen]); // eslint-disable-line react-hooks/exhaustive-deps -- only sync when opening; displayModifiers may change after commit

  useEffect(() => {
    if (!isModifierOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (modifierDropdownRef.current?.contains(e.target as Node)) return;
      if (
        pendingModifiers.length !== displayModifiers.length ||
        pendingModifiers.some((p, i) => p !== displayModifiers[i])
      ) {
        commitSemanticModifiers(mapping.token.key, pendingModifiers);
      }
      onCloseModifierDropdown();
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [
    isModifierOpen,
    onCloseModifierDropdown,
    pendingModifiers,
    displayModifiers,
    mapping.token.key,
    commitSemanticModifiers,
  ]);

  useEffect(() => {
    if (!languageOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (languageDropdownRef.current?.contains(e.target as Node)) return;
      setLanguageOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [languageOpen]);

  const toggleModifier = useCallback((mod: string) => {
    setPendingModifiers((prev) =>
      prev.includes(mod) ? prev.filter((m) => m !== mod) : [...prev, mod].sort(),
    );
  }, []);

  function commitModifiersAndClose() {
    if (
      pendingModifiers.length !== displayModifiers.length ||
      pendingModifiers.some((p, i) => p !== displayModifiers[i])
    ) {
      commitSemanticModifiers(mapping.token.key, pendingModifiers);
    }
    onCloseModifierDropdown();
  }

  const setLanguage = useCallback(
    (lang: string | null) => {
      commitSemanticLanguage(mapping.token.key, lang);
    },
    [mapping.token.key, commitSemanticLanguage],
  );
  const handleToggleModifierDropdown = () => {
    if (isModifierOpen) {
      commitModifiersAndClose();
      return;
    }
    onOpenModifierDropdown();
  };
  const handleToggleLanguageDropdown = () => setLanguageOpen((o) => !o);
  const handleRemoveClick = () => onRemoveMapping(mapping.token.key, mapping.token.type);
  const handleGroupChange = (value: string) =>
    onUpdateGroupRef(mapping.token.key, mapping.token.type, value || null);
  const handleColorChange = (value: string) =>
    onUpdateColorRef(mapping.token.key, mapping.token.type, value || null);
  const handleContrastChange = (value: string) =>
    onUpdateContrastRef(mapping.token.key, mapping.token.type, value || null);

  function onVariantGroupSelectChange(e: ChangeEvent<HTMLSelectElement>) {
    handleGroupChange(e.target.value);
  }

  function onVariantColorSelectChange(e: ChangeEvent<HTMLSelectElement>) {
    handleColorChange(e.target.value);
  }

  function onVariantContrastSelectChange(e: ChangeEvent<HTMLSelectElement>) {
    handleContrastChange(e.target.value);
  }

  const handleModifierOptionClick = useCallback(
    (e: ReactMouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      const mod = e.currentTarget.getAttribute('data-modifier');
      if (mod) toggleModifier(mod);
    },
    [toggleModifier],
  );

  const handleLanguageOptionClick = useCallback(
    (e: ReactMouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      if (e.currentTarget.hasAttribute('data-language-none')) {
        setLanguage(null);
        return;
      }
      const lang = e.currentTarget.getAttribute('data-language');
      if (lang) setLanguage(lang);
    },
    [setLanguage],
  );

  const modifiersForDisplay = isModifierOpen ? pendingModifiers : displayModifiers;

  const modifierList = [...semanticVariant.semanticTokenModifiers].sort((a, b) => a.localeCompare(b));
  const languageList = [...semanticVariant.semanticTokenLanguages].sort((a, b) => a.localeCompare(b));

  return (
    <div
      className={`mapping-variant-wrapper ${isStarVariant ? 'mapping-variant-wrapper-star ' : ''}${isOrphan ? 'mapping-orphan' : ''} ${isBlockingLock ? 'mapping-blocking-lock' : ''}`}
    >
      <div className="mapping-variant-label" title={mapping.token.key}>
        {mapping.token.key}
      </div>
      <div className="mapping-variant-controls-row">
        {isStarVariant && (
          <select
            className="field-select mapping-var-select mapping-col-group"
            value={mapping.groupRef ?? ''}
            disabled={!canEdit}
            onChange={onVariantGroupSelectChange}
            title="Group"
          >
            <option value="">Ungrouped</option>
            {[...groups].sort((a, b) => a.localeCompare(b)).map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        )}
        <div
          className={`mapping-variant-indent-and-name ${isStarVariant ? 'mapping-variant-star-modifiers-col' : ''}`}
        >
          <div className="mapping-variant-multiselect-wrap" ref={modifierDropdownRef}>
            <button
              type="button"
              className="field-select mapping-var-select mapping-variant-multiselect-btn"
              onClick={handleToggleModifierDropdown}
              aria-expanded={isModifierOpen}
              aria-haspopup="listbox"
              aria-label="Modifiers"
            >
              {modifiersForDisplay.length === 0
                ? '— modifiers —'
                : modifiersForDisplay.join(', ')}
            </button>
            {isModifierOpen && (
            <div className="mapping-variant-dropdown" role="listbox">
              {modifierList.map((mod) => (
                <label key={mod} className="mappings-filter-check">
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={pendingModifiers.includes(mod)}
                    aria-label={`Include modifier ${mod}`}
                    className="checkbox-icon-btn"
                    data-modifier={mod}
                    onClick={handleModifierOptionClick}
                  >
                    <span className="material-symbols-outlined" aria-hidden>
                      {pendingModifiers.includes(mod) ? 'check_box' : 'check_box_outline_blank'}
                    </span>
                  </button>
                  <span>{mod}</span>
                </label>
              ))}
              {modifierList.length === 0 && (
                <div className="mappings-filter-empty">None</div>
              )}
            </div>
          )}
          </div>
          <div className="mapping-variant-multiselect-wrap" ref={languageDropdownRef}>
            <button
              type="button"
              className="field-select mapping-var-select mapping-variant-multiselect-btn"
              onClick={handleToggleLanguageDropdown}
              aria-expanded={languageOpen}
              aria-haspopup="listbox"
              aria-label="Language"
            >
              {parsed.language ?? '— language —'}
            </button>
            {languageOpen && (
              <div className="mapping-variant-dropdown" role="listbox">
                <label className="mappings-filter-check">
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={parsed.language === null}
                    aria-label="No specific language"
                    className="checkbox-icon-btn"
                    data-language-none
                    onClick={handleLanguageOptionClick}
                  >
                    <span className="material-symbols-outlined" aria-hidden>
                      {parsed.language === null ? 'check_box' : 'check_box_outline_blank'}
                    </span>
                  </button>
                  <span>—</span>
                </label>
                {languageList.map((lang) => (
                  <label key={lang} className="mappings-filter-check">
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={parsed.language === lang}
                      aria-label={`Language: ${lang}`}
                      className="checkbox-icon-btn"
                      data-language={lang}
                      onClick={handleLanguageOptionClick}
                    >
                      <span className="material-symbols-outlined" aria-hidden>
                        {parsed.language === lang ? 'check_box' : 'check_box_outline_blank'}
                      </span>
                    </button>
                    <span>{lang}</span>
                  </label>
                ))}
                {languageList.length === 0 && (
                  <div className="mappings-filter-empty">None</div>
                )}
              </div>
            )}
          </div>
        </div>
        <select
          className="field-select mapping-var-select mapping-col-color"
          value={mapping.colorVariableRef ?? ''}
          disabled={!canEdit}
          onChange={onVariantColorSelectChange}
        >
          <option value="">— color —</option>
          {[...colorVariables].sort((a, b) => a.key.localeCompare(b.key)).map((v) => (
            <option key={v.key} value={v.key}>
              {v.key}
            </option>
          ))}
        </select>
        <select
          className="field-select mapping-var-select mapping-col-contrast"
          value={mapping.contrastVariableRef ?? ''}
          disabled={!canEdit}
          onChange={onVariantContrastSelectChange}
        >
          <option value="">— contrast —</option>
          {[...contrastVariables].sort((a, b) => a.key.localeCompare(b.key)).map((v) => (
            <option key={v.key} value={v.key}>
              {v.key}
            </option>
          ))}
        </select>
        {canEdit && (
          <button
            type="button"
            className="mapping-variant-remove-btn mapping-col-action"
            onClick={handleRemoveClick}
            title="Remove variant"
            aria-label="Remove variant"
          >
            <span className="material-symbols-outlined">delete</span>
          </button>
        )}
      </div>
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
      rec = { theme: [], 'textmate token': [], 'semantic token': [] } as Record<TokenType, Mapping[]>;
      byGroup.set(key, rec);
    }
    return rec;
  }

  for (const tt of DISPLAYED_TOKEN_TYPES) {
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

export function MappingsCard() {
  const {
    template,
    mappingsByType,
    groups,
    colorVariables,
    contrastVariables,
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

  const filteredMappingsByType: Record<TokenType, Mapping[]> = Object.fromEntries(
    DISPLAYED_TOKEN_TYPES.map((tt) => [
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
  if (semanticVariant && !byGroup.has(UNGROUPED_KEY)) {
    byGroup.set(UNGROUPED_KEY, {
      theme: [],
      'textmate token': [],
      'semantic token': [],
    } as Record<TokenType, Mapping[]>);
  }
  const groupKeysInOrder = sortedGroupKeys(byGroup);

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
              {colorVariables.length === 0 ? (
                <div className="mappings-filter-empty">No color variables</div>
              ) : (
                [...colorVariables].sort((a, b) => a.key.localeCompare(b.key)).map((v) => (
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
              {contrastVariables.length === 0 ? (
                <div className="mappings-filter-empty">No contrast variables</div>
              ) : (
                [...contrastVariables].sort((a, b) => a.key.localeCompare(b.key)).map((v) => (
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
        const byType = byGroup.get(groupKey)!;
        const groupLabel = groupKey === UNGROUPED_KEY ? 'Ungrouped' : groupKey;
        return (
          <GroupSection
            key={groupKey}
            groupKey={groupKey}
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
            semanticVariant={semanticVariant}
            onRemoveMapping={onRemoveMapping}
          />
        );
      })}
    </div>
  );
}
