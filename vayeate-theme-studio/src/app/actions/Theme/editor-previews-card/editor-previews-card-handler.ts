import { singleton } from 'tsyringe';
import { OpenInAppPreviewController } from '../../../controllers/Theme/editor-previews-card/open-in-app-preview-controller';
import { OpenThemePreviewHostController } from '../../../controllers/Theme/editor-previews-card/open-theme-preview-host-controller';
import { ResolveEditorPreviewScopeMapController } from '../../../controllers/Theme/editor-previews-card/resolve-editor-preview-scope-map-controller';
import { Logger, LoggerFactory } from '../../../../domain/utils/Common/logger';
import {
  EditorPreviewsCardActions,
  EditorPreviewsCardActionType,
} from './editor-previews-card-action-type';

/**
 * Routes Editor Previews Card actions to their controllers.
 */
@singleton()
export class EditorPreviewsCardHandler {
  private readonly log: Logger;

  constructor(
    private readonly openInAppPreview: OpenInAppPreviewController,
    private readonly openThemePreviewHost: OpenThemePreviewHostController,
    private readonly resolveEditorPreviewScopeMap: ResolveEditorPreviewScopeMapController,
    loggerFactory: LoggerFactory,
  ) {
    this.log = loggerFactory.create(EditorPreviewsCardHandler.name);
  }

  /**
   * Dispatches the action to the matching controller.
   * @param action Input for this call.
   * @returns Promise resolved when orchestration completes.
   */
  async handle(action: EditorPreviewsCardActions): Promise<void> {
    switch (action.type) {
      case EditorPreviewsCardActionType.OpenInAppPreviewButtonOnClick:
        return this.openInAppPreview.run();
      case EditorPreviewsCardActionType.OpenPreviewHostButtonOnClick:
        return this.openThemePreviewHost.run();
      case EditorPreviewsCardActionType.PreviewScopeMapOnRequest:
        return this.resolveEditorPreviewScopeMap.run();
    }

    this.log.error(
      'Unhandled action (EditorPreviewsCardAction union not exhaustive)',
      { action },
    );
  }
}
