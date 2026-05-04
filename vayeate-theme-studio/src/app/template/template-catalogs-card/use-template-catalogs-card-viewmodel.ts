import { useCallback, useMemo } from 'react';
import { useStore } from 'zustand';
import { useAppDispatch } from '../../core/action-queue/use-app-dispatch';
import { compareVersions } from '../../../domain/utils/compare-versions';
import type { CatalogName } from '../../../model/schema/primitives';
import type { CatalogReference } from '../../../model/schema/template-schemas';
import { TemplateCatalogsCardActionType } from './actions/template-catalogs-card-action-type';
import { container } from 'tsyringe';
import { CatalogsStore } from '../../../domain/catalog/state/catalogs-store';
import { getCurrentTemplate, getCurrentTemplateRefs, TemplatesStore } from '../../../domain/state/data/templates-store';
import { TemplateUiStore } from '../../../domain/state/ui/template-ui-store';
import type { Template } from '../../../model/schema/template-schemas';

const catalogsStore = container.resolve(CatalogsStore);
const templatesStore = container.resolve(TemplatesStore);
const templateUiStore = container.resolve(TemplateUiStore);

export interface TemplateCatalogRowViewModel {
  name: string;
  isIncluded: boolean;
  selectedVersion: string;
  versions: CatalogReference[];
  hasUpdate: boolean;
}

export interface TemplateCatalogsCardViewModel {
  template: Template | null;
  catalogRows: TemplateCatalogRowViewModel[];
  shouldShowUpdateAllCatalogsButton: boolean;
  onUpdateAllCatalogsClick: () => void;
  onToggleCatalogClick: (catalogName: string) => void;
  onCatalogVersionChange: (catalogName: string, newVersion: string) => void;
}

export function useTemplateCatalogsCardViewModel(): TemplateCatalogsCardViewModel {
  const dispatch = useAppDispatch();
  const selectedRef = useStore(templateUiStore.api, (state) => state.state.selectedRef);
  const templateMap = useStore(templatesStore.api, (state) => state.state.templates);
  const template = useMemo(() => getCurrentTemplate(templateMap, selectedRef), [templateMap, selectedRef]);
  const templateRefs = useMemo(() => getCurrentTemplateRefs(templateMap), [templateMap]);
  const selectedName = useMemo(() => selectedRef?.name ?? null, [selectedRef]);

  const isLatestVersion = useMemo(() => {
    if (!selectedRef || !selectedName) return false;
    const best = templateRefs
      .filter((r) => r.name === selectedName)
      .reduce(
        (acc, r) => (!acc || compareVersions(r.version, acc.version) > 0 ? r : acc),
        null as (typeof templateRefs)[number] | null,
      );
    return best !== null && best.version === selectedRef.version;
  }, [templateRefs, selectedRef, selectedName]);

  const catalogs = useStore(catalogsStore.api, (state) => state.state.catalogs);
  const catalogRefs = useMemo(() => {
    const refs: CatalogReference[] = [];
    for (const name of Object.keys(catalogs).sort()) {
      const versions = catalogs[name];
      if (!versions) continue;
      for (const version of Object.keys(versions).sort()) {
        refs.push({ name, version });
      }
    }
    return refs;
  }, [catalogs]);
  const catalogNamesList = useMemo(() => {
    const names = new Set(catalogRefs.map((r: CatalogReference) => r.name));
    return [...names].sort();
  }, [catalogRefs]);

  const catalogVersionsByName = useMemo(() => {
    const map: Record<string, CatalogReference[]> = {};
    for (const ref of catalogRefs) {
      if (!map[ref.name]) map[ref.name] = [];
      map[ref.name].push(ref);
    }
    for (const name of Object.keys(map)) {
      map[name].sort((a, b) => compareVersions(b.version, a.version));
    }
    return map;
  }, [catalogRefs]);

  const includedCatalogMap = useMemo(() => {
    if (!template) return new Map<string, string>();
    const m = new Map<string, string>();
    for (const cr of template.catalogRefs) {
      m.set(cr.name, cr.version);
    }
    return m;
  }, [template]);

  const includedCatalogNamesWithUpdates = useMemo(() => {
    if (!template) return [];
    const names: string[] = [];
    for (const ref of template.catalogRefs) {
      const versions = catalogVersionsByName[ref.name];
      if (versions?.length > 0 && versions[0].version !== ref.version) {
        names.push(ref.name);
      }
    }
    return names;
  }, [template, catalogVersionsByName]);
  const shouldShowUpdateAllCatalogsButton = useMemo(
    () => isLatestVersion && includedCatalogNamesWithUpdates.length > 0,
    [includedCatalogNamesWithUpdates, isLatestVersion],
  );
  const catalogRows = useMemo(() => {
    return catalogNamesList.map((name) => {
      const isIncluded = includedCatalogMap.has(name);
      return {
        name,
        isIncluded,
        selectedVersion: includedCatalogMap.get(name) ?? '',
        versions: catalogVersionsByName[name] ?? [],
        hasUpdate: isIncluded && isLatestVersion && includedCatalogNamesWithUpdates.includes(name),
      };
    });
  }, [catalogNamesList, catalogVersionsByName, includedCatalogMap, includedCatalogNamesWithUpdates, isLatestVersion]);

  const updateAllCatalogsToLatest = useCallback(() => {
    if (!template || !isLatestVersion) return;
    void dispatch({ type: TemplateCatalogsCardActionType.UpdateAllButtonOnClick });
  }, [template, isLatestVersion, dispatch]);

  const toggleCatalog = useCallback(
    (catalogName: string) => {
      if (!template) return;
      void dispatch({
        type: TemplateCatalogsCardActionType.CatalogCheckboxOnToggle,
        catalogName: catalogName as CatalogName,
      });
    },
    [template, dispatch],
  );

  const changeCatalogVersion = useCallback(
    (catalogName: string, newVersion: string) => {
      if (!template) return;
      void dispatch({
        type: TemplateCatalogsCardActionType.CatalogVersionListOnCommit,
        catalogName: catalogName as CatalogName,
        value: newVersion,
      });
    },
    [template, dispatch],
  );

  return {
    template,
    catalogRows,
    shouldShowUpdateAllCatalogsButton,
    onUpdateAllCatalogsClick: updateAllCatalogsToLatest,
    onToggleCatalogClick: toggleCatalog,
    onCatalogVersionChange: changeCatalogVersion,
  };
}
