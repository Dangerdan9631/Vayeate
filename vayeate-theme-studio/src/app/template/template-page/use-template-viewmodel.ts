import { useEffect, useMemo } from 'react';
import { useStore } from 'zustand';
import { useAppDispatch } from '../../core/action-queue/use-app-dispatch';
import { TemplatePageActionType } from './actions/template-page-action-type';
import { container } from 'tsyringe';
import { CreateTemplateDialogStore } from '../../../domain/state/ui/create-template-dialog-store';
import { TemplateUiStore } from '../../../domain/state/ui/template-ui-store';
import type { LoadState } from '../../../domain/state/ui/template-ui-state';

const createTemplateDialogStore = container.resolve(CreateTemplateDialogStore);
const templateUiStore = container.resolve(TemplateUiStore);

/**
 * Read model and lifecycle hooks for the Templates page shell.
 */
export interface TemplateViewModel {
  pageLoadState: LoadState;
  templateLoadState: LoadState;
  isPageLoading: boolean;
  isTemplateLoading: boolean;
  isTemplateLoaded: boolean;
  isCreateDialogOpen: boolean;
}

/**
 * Subscribes to template page load state and dispatches page on-load.
 * @returns Template page selectors and derived loading flags.
 */
export function useTemplateViewModel(): TemplateViewModel {
  const dispatch = useAppDispatch();

  const pageLoadState = useStore(templateUiStore.api, (state) => state.state.pageLoadState);
  const templateLoadState = useStore(templateUiStore.api, (state) => state.state.templateLoadState);
  const isCreateDialogOpen = useStore(createTemplateDialogStore.api, (state) => !!state.state?.isOpen);
  const isPageLoading = useMemo(() => pageLoadState === 'unloaded' || pageLoadState === 'loading', [pageLoadState]);
  const isTemplateLoading = useMemo(() => templateLoadState === 'loading', [templateLoadState]);
  const isTemplateLoaded = useMemo(() => templateLoadState === 'loaded', [templateLoadState]);

  useEffect(() => {
    if (pageLoadState !== 'unloaded') return;
    void dispatch({ type: TemplatePageActionType.PageOnLoad });
  }, [dispatch, pageLoadState]);

  return {
    pageLoadState,
    templateLoadState,
    isPageLoading,
    isTemplateLoading,
    isTemplateLoaded,
    isCreateDialogOpen,
  };
}
