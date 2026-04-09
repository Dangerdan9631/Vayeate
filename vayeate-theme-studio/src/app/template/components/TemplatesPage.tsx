import { useContextSelector } from 'use-context-selector';
import { useTemplateViewModel } from '../viewmodel/use-template-viewmodel';
import { AppContext } from '../../core/components/AppProvider';
import { CreateTemplateDialog } from './CreateTemplateDialog';
import { GroupsCard } from './GroupsCard';
import { MappingsCard } from './MappingsCard';
import { TemplateCatalogsCard } from './TemplateCatalogsCard';
import { TemplateDetailsCard } from './TemplateDetailsCard';
import { TemplatesCard } from './TemplatesCard';
import { VariablesCard } from './VariablesCard';

export function TemplatesPage() {
  useTemplateViewModel();
  const { createDialogOpen } = useContextSelector(AppContext, (c) => {
    const slice = c?.state.templates;
    if (slice === undefined) {
      throw new Error('Template state requires AppProvider.');
    }
    return slice;
  });

  return (
    <>
      <div className="templates-page-grid">
        <div className="templates-left-col">
          <TemplatesCard />
          <TemplateDetailsCard />
          <TemplateCatalogsCard />
        </div>
        <div className="templates-center-col">
          <MappingsCard />
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
