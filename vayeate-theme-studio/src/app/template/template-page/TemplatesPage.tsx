import { useTemplateViewModel } from './use-template-viewmodel';
import { CreateTemplateDialog } from '../create-template-dialog/CreateTemplateDialog';
import { GroupsCard } from '../groups-card/GroupsCard';
import { MappingsCard } from '../mappings-card/MappingsCard';
import { TemplateCatalogsCard } from '../template-catalogs-card/TemplateCatalogsCard';
import { TemplateDetailsCard } from '../template-details-card/TemplateDetailsCard';
import { TemplatesCard } from '../templates-card/TemplatesCard';
import { VariablesCard } from '../variables-card/VariablesCard';
import { ResizableColumns } from '../../common/resizable-columns/ResizableColumns';

/**
 * Renders the Templates editor page and its feature cards.
 * @returns Templates page layout or loading placeholders.
 */
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
        <ResizableColumns
          className="templates-page-grid"
          defaultColumns="minmax(0, 1fr) minmax(0, 2fr) minmax(0, 2fr)"
          storageKey="vayeate.templates-page-columns"
        >
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
            <div className="templates-center-col">
              <MappingsCard />
            </div>
          )}
          {isTemplateLoaded && (
            <div className="templates-right-col">
              <GroupsCard />
              <VariablesCard />
            </div>
          )}
        </ResizableColumns>
      )}
      {isCreateDialogOpen && <CreateTemplateDialog />}
    </>
  );
}
