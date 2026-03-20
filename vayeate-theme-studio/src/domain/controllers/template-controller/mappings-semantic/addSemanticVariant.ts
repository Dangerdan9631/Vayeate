import type { Mapping } from '../../../../model/schemas';
import {
  formatSemanticSelector,
  SEMANTIC_WILDCARD_TYPE,
} from '../../../utils/semantic-token';
import type { SetStoreState } from '../../../state/store-state-reducer';
import {
  saveTemplate as saveTemplateOp,
  bumpTemplateVersionForEdit,
  generateSemanticVariantKey,
  mergeSemanticTokenSets,
  appendSemanticVariantToTemplate,
  type SetState,
} from '../../../operations/template-operations';
import type { GetState } from '../../../operations/undo-operations';
import { refreshRefsAndSelect } from '../shared-flows';

export async function addSemanticVariant(
  setState: SetState,
  setStoreState: SetStoreState,
  getState: GetState,
  type: string,
  modifiers: string[],
  language: string | null,
  defaultGroupRef?: string | null,
): Promise<void> {
  const template = getState().templates.template;
  if (!template) return;
  const base = bumpTemplateVersionForEdit(template);
  const baseMapping = base.mappings.find(
    (m) => m.token.type === 'semantic token' && m.token.key === type,
  );
  let key: string;
  if (modifiers.length === 0 && (language === null || (language && language.trim() === ''))) {
    key = generateSemanticVariantKey(type);
  } else {
    key = formatSemanticSelector(type, modifiers, language);
    if (!key) return;
    const existing = template.mappings.some(
      (m) => m.token.type === 'semantic token' && m.token.key === key,
    );
    if (existing) return;
  }
  const groupRef =
    type === SEMANTIC_WILDCARD_TYPE && defaultGroupRef !== undefined
      ? defaultGroupRef
      : (baseMapping?.groupRef ?? null);
  const newMapping: Mapping = {
    token: { key, type: 'semantic token' },
    colorVariableRef: null,
    contrastVariableRef: null,
    groupRef,
  };
  const sets = mergeSemanticTokenSets(base, modifiers, language);
  const next = appendSemanticVariantToTemplate(base, newMapping, sets.semanticTokenModifiers, sets.semanticTokenLanguages);
  await saveTemplateOp(next);
  await refreshRefsAndSelect(setState, setStoreState, next.name, next.version);
}
