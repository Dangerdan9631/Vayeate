import { useEffect, useRef } from 'react';
import { useStore } from 'zustand';
import { useAppDispatch } from '../../common/context/use-app-dispatch';
import { TemplateActionType } from '../actions/template-action-type';
import { container } from 'tsyringe';
import { TemplatesStore } from '../../../domain/state/template/templates-store';

const templatesStore = container.resolve(TemplatesStore);

export function useTemplateViewModel(): { isCreateDialogOpen: boolean } {
  const dispatch = useAppDispatch();
  const pageLoadDispatchedRef = useRef(false);

  const isCreateDialogOpen = useStore(templatesStore.api, (state) => state.state.isCreateDialogOpen);

  useEffect(() => {
    if (pageLoadDispatchedRef.current) return;
    pageLoadDispatchedRef.current = true;
    dispatch({ type: TemplateActionType.TemplatePageOnLoad });
  }, [dispatch]);

  return { isCreateDialogOpen: isCreateDialogOpen };
}
