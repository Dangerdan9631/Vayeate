import { useEffect, useRef } from 'react';
import { useContextSelector } from 'use-context-selector';
import { useAppDispatch } from '../../common/context/use-app-dispatch';
import { AppContext } from '../../core/app-context';
import { TemplateActionType } from '../actions/template-action-type';

export function useTemplateViewModel(): { createDialogOpen: boolean } {
  const dispatch = useAppDispatch();
  const pageLoadDispatchedRef = useRef(false);

  const createDialogOpen = useContextSelector(AppContext, (c) => {
    const slice = c?.state.templates;
    if (slice === undefined) {
      throw new Error('Template state requires AppProvider.');
    }
    return slice.createDialogOpen;
  });

  useEffect(() => {
    if (pageLoadDispatchedRef.current) return;
    pageLoadDispatchedRef.current = true;
    dispatch({ type: TemplateActionType.TemplatePageOnLoad });
  }, [dispatch]);

  return { createDialogOpen };
}
