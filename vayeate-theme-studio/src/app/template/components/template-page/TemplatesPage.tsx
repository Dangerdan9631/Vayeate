import { useTemplateViewModel } from './use-template-viewmodel';
import { CreateTemplateDialog } from '../create-template-dialog/CreateTemplateDialog';
import { GroupsCard } from '../groups-card/GroupsCard';
import { MappingsCard } from '../mappings-card/MappingsCard';
import { TemplateCatalogsCard } from '../template-catalogs-card/TemplateCatalogsCard';
import { TemplateDetailsCard } from '../template-details-card/TemplateDetailsCard';
import { TemplatesCard } from '../templates-card/TemplatesCard';
import { VariablesCard } from '../variables-card/VariablesCard';

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
