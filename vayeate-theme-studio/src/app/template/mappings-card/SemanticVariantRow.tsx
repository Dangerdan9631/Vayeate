import {
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type MouseEvent as ReactMouseEvent,
} from 'react';
import { parseSemanticSelector } from '../../../model/parse-semantic-selector';
import { SEMANTIC_WILDCARD_TYPE } from '../../../model/semantic-token-constants';
import type { ColorVariableKey, ContrastVariableKey, TokenType } from '../../../model/schema/primitives';
import type { ColorVariable, ContrastVariable, Mapping } from '../../../model/schema/template-schemas';

/**
 * Placeholder modifier prefix for empty variant rows; filter out for display and when updating.
 */
const EMPTY_VARIANT_MODIFIER_PREFIX = 'empty-';

/**
 * Props for one semantic token variant mapping row.
 */
export interface SemanticVariantRowProps {
  mapping: Mapping;
  isOrphan: boolean;
  canEdit: boolean;
  sortedGroups: readonly string[];
  sortedColorVariables: readonly ColorVariable[];
  sortedContrastVariables: readonly ContrastVariable[];
  sortedSemanticTokenModifiers: readonly string[];
  sortedSemanticTokenLanguages: readonly string[];
  onUpdateGroupRef: (tokenKey: string, tokenType: TokenType, groupRef: string | null) => void;
  onUpdateColorRef: (tokenKey: string, tokenType: TokenType, ref: ColorVariableKey | null) => void;
  onUpdateContrastRef: (tokenKey: string, tokenType: TokenType, ref: ContrastVariableKey | null) => void;
  onRemoveMapping: (tokenKey: string, tokenType: TokenType) => void;
  commitSemanticModifiers: (oldKey: string, modifiers: string[]) => void;
  commitSemanticLanguage: (oldKey: string, language: string | null) => void;
  isModifierOpen: boolean;
  onOpenModifierDropdown: () => void;
  onCloseModifierDropdown: () => void;
  isSelected: boolean;
  onToggleSelection: (tokenKey: string, tokenType: TokenType) => void;
}

function SemanticVariantRowComponent({
  mapping,
  isOrphan,
  canEdit,
  sortedGroups,
  sortedColorVariables,
  sortedContrastVariables,
  sortedSemanticTokenModifiers,
  sortedSemanticTokenLanguages,
  onUpdateGroupRef,
  onUpdateColorRef,
  onUpdateContrastRef,
  onRemoveMapping,
  commitSemanticModifiers,
  commitSemanticLanguage,
  isModifierOpen,
  onOpenModifierDropdown,
  onCloseModifierDropdown,
  isSelected,
  onToggleSelection,
}: SemanticVariantRowProps) {
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

  function onToggleModifierDropdownClick() {
    if (isModifierOpen) {
      commitModifiersAndClose();
      return;
    }
    onOpenModifierDropdown();
  }

  function onToggleLanguageDropdownClick() {
    setLanguageOpen((o) => !o);
  }

  function onRemoveClick() {
    onRemoveMapping(mapping.token.key, mapping.token.type);
  }

  function onMappingSelectionClick() {
    onToggleSelection(mapping.token.key, mapping.token.type);
  }

  function onVariantGroupSelectChange(e: ChangeEvent<HTMLSelectElement>) {
    onUpdateGroupRef(mapping.token.key, mapping.token.type, e.target.value || null);
  }

  function onVariantColorSelectChange(e: ChangeEvent<HTMLSelectElement>) {
    onUpdateColorRef(mapping.token.key, mapping.token.type, e.target.value || null);
  }

  function onVariantContrastSelectChange(e: ChangeEvent<HTMLSelectElement>) {
    onUpdateContrastRef(mapping.token.key, mapping.token.type, e.target.value || null);
  }

  const onModifierOptionClick = useCallback(
    (e: ReactMouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      const mod = e.currentTarget.getAttribute('data-modifier');
      if (mod) toggleModifier(mod);
    },
    [toggleModifier],
  );

  const onLanguageOptionClick = useCallback(
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

  return (
    <div
      className={`mapping-variant-wrapper ${isSelected ? 'mapping-row-selected ' : ''}${isStarVariant ? 'mapping-variant-wrapper-star ' : ''}${isOrphan ? 'mapping-orphan' : ''} ${isBlockingLock ? 'mapping-blocking-lock' : ''}`}
    >
      <div className="mapping-variant-label" title={mapping.token.key}>
        {canEdit && (
          <button
            type="button"
            role="checkbox"
            aria-checked={isSelected}
            aria-label={`Select mapping ${mapping.token.key}`}
            className="checkbox-icon-btn mapping-selection-btn"
            onClick={onMappingSelectionClick}
          >
            <span className="material-symbols-outlined" aria-hidden>
              {isSelected ? 'check_box' : 'check_box_outline_blank'}
            </span>
          </button>
        )}
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
            {sortedGroups.map((g) => (
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
              onClick={onToggleModifierDropdownClick}
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
              {sortedSemanticTokenModifiers.map((mod) => (
                <label key={mod} className="mappings-filter-check">
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={pendingModifiers.includes(mod)}
                    aria-label={`Include modifier ${mod}`}
                    className="checkbox-icon-btn"
                    data-modifier={mod}
                    onClick={onModifierOptionClick}
                  >
                    <span className="material-symbols-outlined" aria-hidden>
                      {pendingModifiers.includes(mod) ? 'check_box' : 'check_box_outline_blank'}
                    </span>
                  </button>
                  <span>{mod}</span>
                </label>
              ))}
              {sortedSemanticTokenModifiers.length === 0 && (
                <div className="mappings-filter-empty">None</div>
              )}
            </div>
          )}
          </div>
          <div className="mapping-variant-multiselect-wrap" ref={languageDropdownRef}>
            <button
              type="button"
              className="field-select mapping-var-select mapping-variant-multiselect-btn"
              onClick={onToggleLanguageDropdownClick}
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
                    onClick={onLanguageOptionClick}
                  >
                    <span className="material-symbols-outlined" aria-hidden>
                      {parsed.language === null ? 'check_box' : 'check_box_outline_blank'}
                    </span>
                  </button>
                  <span>—</span>
                </label>
                {sortedSemanticTokenLanguages.map((lang) => (
                  <label key={lang} className="mappings-filter-check">
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={parsed.language === lang}
                      aria-label={`Language: ${lang}`}
                      className="checkbox-icon-btn"
                      data-language={lang}
                      onClick={onLanguageOptionClick}
                    >
                      <span className="material-symbols-outlined" aria-hidden>
                        {parsed.language === lang ? 'check_box' : 'check_box_outline_blank'}
                      </span>
                    </button>
                    <span>{lang}</span>
                  </label>
                ))}
                {sortedSemanticTokenLanguages.length === 0 && (
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
          {sortedColorVariables.map((v) => (
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
          {sortedContrastVariables.map((v) => (
            <option key={v.key} value={v.key}>
              {v.key}
            </option>
          ))}
        </select>
        {canEdit && (
          <button
            type="button"
            className="mapping-variant-remove-btn mapping-col-action"
            onClick={onRemoveClick}
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

/**
 * Memoized row component for editing one semantic token variant mapping.
 */
export const SemanticVariantRow = memo(SemanticVariantRowComponent);
