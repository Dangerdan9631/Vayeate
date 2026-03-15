import type { Mapping } from '../../model/schemas';
import {
  formatSemanticSelector,
  SEMANTIC_WILDCARD_TYPE,
} from '../../core/semantic-token';
import { saveTemplate as saveTemplateOp, type SetState } from '../../operations/template-operations';
import type { GetState } from '../../operations/undo-operations';
import { getBaseForEdit, refreshRefsAndSelect } from './_helpers';

export async function addSemanticVariant(
  setState: SetState,
  getState: GetState,
  type: string,
  modifiers: string[],
  language: string | null,
  defaultGroupRef?: string | null,
): Promise<void> {
  const template = getState().templates.template;
  if (!template) return;
  const base = getBaseForEdit(template);
  const baseMapping = base.mappings.find(
    (m) => m.token.type === 'semantic token' && m.token.key === type,
  );
  let key: string;
  if (modifiers.length === 0 && (language === null || (language && language.trim() === ''))) {
    key = `${type}.empty-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
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
  const newModifiers = [...new Set([...(base.semanticTokenModifiers ?? []), ...modifiers])].sort();
  const newLanguages =
    language && language.trim() !== ''
      ? [...new Set([...(base.semanticTokenLanguages ?? []), language.trim()])].sort()
      : (base.semanticTokenLanguages ?? []);
  await saveTemplateOp({
    ...base,
    mappings: [...base.mappings, newMapping],
    semanticTokenModifiers: newModifiers,
    semanticTokenLanguages: newLanguages,
  });
  await refreshRefsAndSelect(setState, base.name, base.version);
}
