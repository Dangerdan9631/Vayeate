import { useEffect, useMemo, useState } from 'react';
import { useContextSelector } from 'use-context-selector';
import {
  useTemplateViewModel,
  computeOrphanKeys,
  type SemanticCatalogInfo,
} from '../viewmodel/use-template-viewmodel';
import { AppContext } from '../../core/components/AppProvider';
import { CreateTemplateDialog } from './CreateTemplateDialog';
import { GroupsCard } from './GroupsCard';
import { MappingsCard } from './MappingsCard';
import { TemplateCatalogsCard } from './TemplateCatalogsCard';
import { TemplateDetailsCard } from './TemplateDetailsCard';
import { TemplatesCard } from './TemplatesCard';
import { VariablesCard } from './VariablesCard';
import type { Catalog, Token } from '../../../model/schemas';

export function TemplatesPage() {
  useTemplateViewModel();
  const { template, createDialogOpen } = useContextSelector(AppContext, (c) => {
    const slice = c?.state.templates;
    if (slice === undefined) {
      throw new Error('Template state requires AppProvider.');
    }
    return slice;
  });

  const loadedForDisplay = useContextSelector(AppContext, (c) => {
    const slice = c?.state.catalogs;
    if (slice === undefined) {
      throw new Error('Catalog state requires AppProvider.');
    }
    return slice.loadedForDisplay;
  });

  const loadedCatalogsForTemplateRefs = useMemo(() => {
    if (!template || template.catalogRefs.length === 0) return [];
    return template.catalogRefs.map((ref) => {
      const key = `${ref.name}@${ref.version}`;
      return loadedForDisplay[key] ?? null;
    });
  }, [template, loadedForDisplay]);

  const [orphanKeys, setOrphanKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!template || loadedCatalogsForTemplateRefs.length === 0) {
      setOrphanKeys(new Set());
      return;
    }
    const loaded = loadedCatalogsForTemplateRefs;
    const allLoaded = loaded.every((c: Catalog | null) => c !== null);
    if (!allLoaded) return;

    const allTokens: Token[] = [];
    const typesSet = new Set<string>();
    const modifiersSet = new Set<string>();
    const languagesSet = new Set<string>();
    for (const catalog of loaded) {
      if (catalog) {
        allTokens.push(...catalog.tokens);
        (catalog.semanticTokenTypes ?? []).forEach((t: string) => typesSet.add(t));
        (catalog.semanticTokenModifiers ?? []).forEach((m: string) => modifiersSet.add(m));
        (catalog.semanticTokenLanguages ?? []).forEach((l: string) => languagesSet.add(l));
      }
    }
    const semanticCatalog: SemanticCatalogInfo | undefined =
      typesSet.size > 0 || modifiersSet.size > 0 || languagesSet.size > 0
        ? {
            semanticTokenTypes: [...typesSet].sort(),
            semanticTokenModifiers: [...modifiersSet].sort(),
            semanticTokenLanguages: [...languagesSet].sort(),
          }
        : undefined;
    setOrphanKeys(computeOrphanKeys(template.mappings, allTokens, semanticCatalog));
  }, [template, loadedCatalogsForTemplateRefs]);

  return (
    <>
      <div className="templates-page-grid">
        <div className="templates-left-col">
          <TemplatesCard />
          <TemplateDetailsCard />
          <TemplateCatalogsCard />
        </div>
        <div className="templates-center-col">
          <MappingsCard orphanKeys={orphanKeys} />
        </div>
        <div className="templates-right-col">
          <GroupsCard />
          <VariablesCard />
        </div>
      </div>
      {createDialogOpen && <CreateTemplateDialog />}
    </>
  );
}
