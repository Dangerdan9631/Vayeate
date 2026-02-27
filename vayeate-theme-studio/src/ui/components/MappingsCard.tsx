import { useState } from 'react';
import type {
  ColorVariable,
  ColorVariableKey,
  ContrastVariable,
  ContrastVariableKey,
  Mapping,
  TokenType,
} from '../../model/schemas';

interface MappingsCardProps {
  mappingsByType: Record<TokenType, Mapping[]>;
  colorVariables: readonly ColorVariable[];
  contrastVariables: readonly ContrastVariable[];
  orphanKeys: Set<string>;
  canEdit: boolean;
  onUpdateColorRef: (
    tokenKey: string,
    tokenType: TokenType,
    ref: ColorVariableKey | null,
    isOrphan?: boolean,
  ) => void;
  onUpdateContrastRef: (tokenKey: string, tokenType: TokenType, ref: ContrastVariableKey | null) => void;
}

const TOKEN_TYPES: TokenType[] = ['theme', 'token', 'semantic token'];

function MappingTypeSection({
  tokenType,
  mappings,
  colorVariables,
  contrastVariables,
  orphanKeys,
  canEdit,
  onUpdateColorRef,
  onUpdateContrastRef,
}: {
  tokenType: TokenType;
  mappings: Mapping[];
  colorVariables: readonly ColorVariable[];
  contrastVariables: readonly ContrastVariable[];
  orphanKeys: Set<string>;
  canEdit: boolean;
  onUpdateColorRef: (
    tokenKey: string,
    tokenType: TokenType,
    ref: ColorVariableKey | null,
    isOrphan?: boolean,
  ) => void;
  onUpdateContrastRef: (tokenKey: string, tokenType: TokenType, ref: ContrastVariableKey | null) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);

  const label =
    tokenType === 'theme'
      ? 'Theme Tokens'
      : tokenType === 'token'
        ? 'Tokens'
        : 'Semantic Tokens';

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

export function MappingsCard({
  mappingsByType,
  colorVariables,
  contrastVariables,
  orphanKeys,
  canEdit,
  onUpdateColorRef,
  onUpdateContrastRef,
}: MappingsCardProps) {
  return (
    <div className="tokens-card placeholder">
      <h2>Mappings</h2>
      {TOKEN_TYPES.map((tt) => (
        <MappingTypeSection
          key={tt}
          tokenType={tt}
          mappings={mappingsByType[tt]}
          colorVariables={colorVariables}
          contrastVariables={contrastVariables}
          orphanKeys={orphanKeys}
          canEdit={canEdit}
          onUpdateColorRef={onUpdateColorRef}
          onUpdateContrastRef={onUpdateContrastRef}
        />
      ))}
    </div>
  );
}
