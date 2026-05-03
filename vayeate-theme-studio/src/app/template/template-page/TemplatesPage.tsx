import { useTemplateViewModel } from './use-template-viewmodel';
import { CreateTemplateDialog } from '../create-template-dialog/CreateTemplateDialog';
import { GroupsCard } from '../groups-card/GroupsCard';
import { MappingsCard } from '../mappings-card/MappingsCard';
import { TemplateCatalogsCard } from '../template-catalogs-card/TemplateCatalogsCard';
import { TemplateDetailsCard } from '../template-details-card/TemplateDetailsCard';
import { TemplatesCard } from '../templates-card/TemplatesCard';
import { VariablesCard } from '../variables-card/VariablesCard';

export function TemplatesPage() {
  const {
    isPageLoading,
    isTemplateLoading,
    isTemplateLoaded,
    isCreateDialogOpen,
  } = useTemplateViewModel();

  return (
    <>
      {isPageLoading ? (
        <div className="placeholder">
          <h2>Templates</h2>
          <p>Loading templates...</p>
        </div>
      ) : (
        <div className="templates-page-grid">
          <div className="templates-left-col">
            <TemplatesCard />
            {isTemplateLoading && (
              <div className="template-details-card placeholder">
                <h2>Template details</h2>
                <p>Loading template...</p>
              </div>
            )}
            {isTemplateLoaded && (
              <>
                <TemplateDetailsCard />
                <TemplateCatalogsCard />
              </>
            )}
          </div>
          {isTemplateLoaded && (
            <>
              <div className="templates-center-col">
                <MappingsCard />
              </div>
              <div className="templates-right-col">
                <GroupsCard />
                <VariablesCard />
              </div>
            </>
          )}
        </div>
      )}
      {isCreateDialogOpen && <CreateTemplateDialog />}
    </>
  );
}
