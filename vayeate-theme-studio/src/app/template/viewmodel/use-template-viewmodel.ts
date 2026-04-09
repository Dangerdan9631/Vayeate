import { useEffect } from 'react';
import { useContextSelector } from 'use-context-selector';
import { useAppDispatch } from '../../common/context/use-app-dispatch';
import { AppContext } from '../../core/components/AppProvider';
import { TemplateActionType } from '../actions/template-action-type';

let templatePageLoadDispatched = false;

export function useTemplateViewModel(): { createDialogOpen: boolean } {
  const dispatch = useAppDispatch();

  const createDialogOpen = useContextSelector(AppContext, (c) => {
    const slice = c?.state.templates;
    if (slice === undefined) {
      throw new Error('Template state requires AppProvider.');
    }
    return slice.createDialogOpen;
  });

  useEffect(() => {
    if (templatePageLoadDispatched) return;
    templatePageLoadDispatched = true;
    dispatch({ type: TemplateActionType.TemplatePageOnLoad });
  }, [dispatch]);

  return { createDialogOpen };
}

export type { MergeMappingsResult } from '../../../model/schemas';

export {
  computeOrphanKeys,
  type SemanticCatalogInfo,
} from '../../../domain/utils/orphan-mappings';
