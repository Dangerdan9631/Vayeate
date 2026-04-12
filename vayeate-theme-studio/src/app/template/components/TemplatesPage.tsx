import { useTemplateViewModel } from '../viewmodel/use-template-viewmodel';
import { CreateTemplateDialog } from './CreateTemplateDialog';
import { GroupsCard } from './GroupsCard';
import { MappingsCard } from './MappingsCard';
import { TemplateCatalogsCard } from './TemplateCatalogsCard';
import { TemplateDetailsCard } from './TemplateDetailsCard';
import { TemplatesCard } from './TemplatesCard';
import { VariablesCard } from './VariablesCard';

export function TemplatesPage() {
  const { isCreateDialogOpen } = useTemplateViewModel();

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
      {isCreateDialogOpen && <CreateTemplateDialog />}
    </>
  );
}
