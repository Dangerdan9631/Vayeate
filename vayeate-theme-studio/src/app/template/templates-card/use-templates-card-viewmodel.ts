import { useCallback, useMemo } from 'react';
import { useStore } from 'zustand';
import { useAppDispatch } from '../../core/action-queue/use-app-dispatch';
import { compareVersions } from '../../../domain/utils/compare-versions';
import type { TemplateReference } from '../../../model/schema/theme-schemas';
import { TemplatesCardActionType } from './actions/templates-card-action-type';
import { container } from 'tsyringe';
import { getCurrentTemplateRefs, TemplatesStore } from '../../../domain/state/template/templates-store';

const templatesStore = container.resolve(TemplatesStore);

export interface TemplatesCardViewModel {
  templateNames: string[];
  selectedName: string | null;
  versionsForSelectedName: TemplateReference[];
  selectedRef: TemplateReference | null;
  isCreating: boolean;
  onSelectName: (name: string) => void;
  onSelectVersion: (version: string) => void;
  onCreateClick: () => void;
}

export function useTemplatesCardViewModel(): TemplatesCardViewModel {
  const dispatch = useAppDispatch();
  const selectedRef = useStore(templatesStore.api, (state) => state.state.selectedRef);
  const isCreating = useStore(templatesStore.api, (state) => state.state.isCreating);
  const templateMap = useStore(templatesStore.api, (state) => state.state.templates);
  const templateRefs = useMemo(() => getCurrentTemplateRefs(templateMap), [templateMap]);

  const templateNames = useMemo(() => {
    const names = new Set(templateRefs.map((r) => r.name));
    return [...names].sort();
  }, [templateRefs]);

  const selectedName = useMemo(() => selectedRef?.name ?? null, [selectedRef]);

  const versionsForSelectedName = useMemo(() => {
    if (!selectedName) return [];
    return templateRefs
      .filter((r) => r.name === selectedName)
      .sort((a, b) => compareVersions(b.version, a.version));
  }, [templateRefs, selectedName]);

  const highestVersionForName = useCallback(
    (name: string): TemplateReference | null => {
      const refs = templateRefs.filter((r) => r.name === name);
      if (refs.length === 0) return null;
      return refs.reduce((best, r) => (compareVersions(r.version, best.version) > 0 ? r : best));
    },
    [templateRefs],
  );

  const selectTemplate = useCallback(
    (name: string, version: string) => {
      void dispatch({ type: TemplatesCardActionType.TemplatesListOnCommit, name, version });
    },
    [dispatch],
  );

  const selectName = useCallback(
    (name: string) => {
      if (!name) return;
      const best = highestVersionForName(name);
      if (best) {
        void dispatch({ type: TemplatesCardActionType.TemplatesListOnCommit, name: best.name, version: best.version });
      }
    },
    [dispatch, highestVersionForName],
  );

  const openCreateDialog = useCallback(() => {
    void dispatch({ type: TemplatesCardActionType.TemplatesCreateButtonOnClick });
  }, [dispatch]);

  const onSelectVersion = useCallback(
    (version: string) => {
      if (selectedName) selectTemplate(selectedName, version);
    },
    [selectTemplate, selectedName],
  );

  return {
    templateNames,
    selectedName,
    versionsForSelectedName,
    selectedRef,
    onSelectName: selectName,
    onSelectVersion,
    onCreateClick: openCreateDialog,
    isCreating,
  };
}
