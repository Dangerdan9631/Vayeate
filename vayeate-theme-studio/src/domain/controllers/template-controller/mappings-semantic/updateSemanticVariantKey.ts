import { formatSemanticSelector, parseSemanticSelector } from '../../../utils/semantic-token';
import type { SetStoreState } from '../../../state/store-state-reducer';
import { saveTemplate as saveTemplateOp, type SetState } from '../../../operations/template-operations';
import type { GetState } from '../../../operations/undo-operations';
import { getBaseForEdit, refreshRefsAndSelect } from '../shared-flows';

export async function updateSemanticVariantKey(
  setState: SetState,
  setStoreState: SetStoreState,
  getState: GetState,
  oldKey: string,
  modifiers: string[],
  language: string | null,
): Promise<void> {
  const template = getState().templates.template;
  if (!template) return;
  let parsed: { type: string; modifiers: string[]; language: string | null };
  try {
    parsed = parseSemanticSelector(oldKey);
  } catch {
    return;
  }
  const newKey = formatSemanticSelector(parsed.type, modifiers, language);
  if (!newKey || newKey === oldKey) return;
  if (newKey === parsed.type) return;
  const existing = template.mappings.some(
    (m) => m.token.type === 'semantic token' && m.token.key === newKey,
  );
  if (existing) return;
  const base = getBaseForEdit(template);
  const newMappings = base.mappings.map((m) =>
    m.token.type === 'semantic token' && m.token.key === oldKey
      ? { ...m, token: { key: newKey, type: 'semantic token' as const } }
      : m,
  );
  const newModifiers = [...new Set([...(base.semanticTokenModifiers ?? []), ...modifiers])].sort();
  const newLanguages =
    language && language.trim() !== ''
      ? [...new Set([...(base.semanticTokenLanguages ?? []), language.trim()])].sort()
      : (base.semanticTokenLanguages ?? []);
  await saveTemplateOp({
    ...base,
    mappings: newMappings,
    semanticTokenModifiers: newModifiers,
    semanticTokenLanguages: newLanguages,
  });
  await refreshRefsAndSelect(setState, setStoreState, base.name, base.version);
}


