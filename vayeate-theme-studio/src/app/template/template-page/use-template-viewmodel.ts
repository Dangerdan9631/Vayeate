import { useEffect, useRef } from 'react';
import { useStore } from 'zustand';
import { useAppDispatch } from '../../core/action-queue/use-app-dispatch';
import { TemplatePageActionType } from './actions/template-page-action-type';
import { container } from 'tsyringe';
import { TemplatesStore } from '../../../domain/state/template/templates-store';

const templatesStore = container.resolve(TemplatesStore);

export interface TemplateViewModel {
  isCreateDialogOpen: boolean;
}

export function useTemplateViewModel(): TemplateViewModel {
  const dispatch = useAppDispatch();
  const pageLoadDispatchedRef = useRef(false);

  const isCreateDialogOpen = useStore(templatesStore.api, (state) => state.state.isCreateDialogOpen);

  useEffect(() => {
    if (pageLoadDispatchedRef.current) return;
    pageLoadDispatchedRef.current = true;
    void dispatch({ type: TemplatePageActionType.PageOnLoad });
  }, [dispatch]);

  return { isCreateDialogOpen };
}
