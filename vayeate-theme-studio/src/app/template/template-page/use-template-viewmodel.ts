import { useEffect, useRef } from 'react';
import { useStore } from 'zustand';
import { useAppDispatch } from '../../core/action-queue/use-app-dispatch';
import { TemplatePageActionType } from './actions/template-page-action-type';
import { container } from 'tsyringe';
import { CreateTemplateDialogStore } from '../../../domain/state/ui/create-template-dialog-store';

const createTemplateDialogStore = container.resolve(CreateTemplateDialogStore);

export interface TemplateViewModel {
  isCreateDialogOpen: boolean;
}

export function useTemplateViewModel(): TemplateViewModel {
  const dispatch = useAppDispatch();
  const pageLoadDispatchedRef = useRef(false);

  const isCreateDialogOpen = useStore(createTemplateDialogStore.api, (state) => !!state.state?.isOpen);

  useEffect(() => {
    if (pageLoadDispatchedRef.current) return;
    pageLoadDispatchedRef.current = true;
    void dispatch({ type: TemplatePageActionType.PageOnLoad });
  }, [dispatch]);

  return { isCreateDialogOpen };
}
