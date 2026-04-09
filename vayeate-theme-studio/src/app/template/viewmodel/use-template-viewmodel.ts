import { useEffect } from 'react';
import { useAppDispatch } from '../../common/context/use-app-dispatch';
import { TemplateActionType } from '../actions/template-action-type';

let templatePageLoadDispatched = false;

export function useTemplateViewModel(): void {
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (templatePageLoadDispatched) return;
    templatePageLoadDispatched = true;
    dispatch({ type: TemplateActionType.TemplatePageOnLoad });
  }, [dispatch]);
}

export type { MergeMappingsResult } from '../../../model/schemas';

export {
  computeOrphanKeys,
  type SemanticCatalogInfo,
} from '../../../domain/utils/orphan-mappings';
