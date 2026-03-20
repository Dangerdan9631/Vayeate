import { formatSemanticSelector, parseSemanticSelector } from '../../../utils/semantic-token';
import type { SetStoreState } from '../../../state/store-state-reducer';
import {
  saveTemplate as saveTemplateOp,
  bumpTemplateVersionForEdit,
  mergeSemanticTokenSets,
  updateSemanticVariantKeyInTemplate,
  type SetState,
} from '../../../operations/template-operations';
import type { GetState } from '../../../operations/undo-operations';
import { refreshRefsAndSelect } from '../shared-flows';

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
  const base = bumpTemplateVersionForEdit(template);
  const sets = mergeSemanticTokenSets(base, modifiers, language);
  const next = updateSemanticVariantKeyInTemplate(
    base,
    oldKey,
    newKey,
    sets.semanticTokenModifiers,
    sets.semanticTokenLanguages,
  );
  await saveTemplateOp(next);
  await refreshRefsAndSelect(setState, setStoreState, next.name, next.version);
}
