import { describe, expect, it, vi } from 'vitest';
import { UpdateTokenKeyController } from '../../../app/catalog/tokens-card/controllers/update-token-key-controller';
import { RemoveVariableController } from '../../../app/template/variables-card/controllers/remove-variable-controller';
import { IncrementThemeVersionController } from '../../../app/theme/theme-details-card/controllers/increment-theme-version-controller';
import { CatalogsStore } from '../../catalog/state/catalogs-store';
import { BumpCatalogVersionForEditOperation } from '../catalog-operations/catalog-details/bump-catalog-version-for-edit-operation';
import { UpdateTokenKeyInCatalogOperation } from '../catalog-operations/tokens/update-token-key-in-catalog-operation';
import { BumpTemplateVersionForEditOperation } from '../template-operations/template-details/bump-template-version-for-edit-operation';
import { RemoveColorVariableOperation } from '../template-operations/variables-color/remove-color-variable-operation';
import { RemoveContrastVariableOperation } from '../template-operations/variables-contrast/remove-contrast-variable-operation';
import { ValidateCanRemoveVariable } from '../../validations/template-validations/validate-can-remove-variable';
import { CatalogUiStore } from '../../state/ui/catalog-ui-store';
import { TemplateUiStore } from '../../state/ui/template-ui-store';
import { ThemeUiStore } from '../../state/ui/theme-ui-store';
import { TemplatesStore } from '../../state/data/templates-store';
import { UndoStackStore } from '../../state/undo-stack/undo-stack-store';
import { undoManagerV2 } from '../../core/undo-manager-v2';
import { catalogSchema } from '../../../model/schema/catalog';
import { templateSchema } from '../../../model/schema/template-schemas';
import { themeSchema } from '../../../model/schema/theme-schemas';
import { RecordCatalogUndoOperation } from './record-catalog-undo-operation';
import { RecordTemplateUndoOperation } from './record-template-undo-operation';
import { RecordThemeUndoOperation } from './record-theme-undo-operation';
import { RecordUndoEntryOperation } from './record-undo-entry-operation';
import {
  createTestBuildUniversalUndoProcessor,
  createTestUndoOperations,
} from '../../../../test/undo/test-universal-undo-processor';
import { ApplyCatalogUndoStateOperation } from './apply-catalog-undo-state-operation';
import { ApplyTemplateUndoStateOperation } from './apply-template-undo-state-operation';
import { CATALOG_TOKEN_KEY_UPDATED } from '../../../model/undo-action-types';

describe('undo failure paths', () => {
  it('does not record catalog undo for empty keys or same-value token renames', async () => {
    await undoManagerV2.clearPersisted();
    const catalogsStore = new CatalogsStore();
    const catalogUiStore = new CatalogUiStore();
    const undoStackStore = new UndoStackStore();
    const saveCatalog = { execute: vi.fn() };
    const refreshCatalogRefsAndSelect = { execute: vi.fn() };
    const testUndo = createTestUndoOperations(
      undoStackStore,
      createTestBuildUniversalUndoProcessor({
        applyCatalogUndoState: new ApplyCatalogUndoStateOperation(
          catalogsStore,
          catalogUiStore,
          saveCatalog as never,
          refreshCatalogRefsAndSelect as never,
        ),
        applyTemplateUndoState: { execute: vi.fn() } as never,
        applyThemeUndoState: { execute: vi.fn() } as never,
      }),
    );
    const controller = new UpdateTokenKeyController(
      catalogsStore,
      catalogUiStore,
      new TemplateUiStore(),
      new ThemeUiStore(),
      saveCatalog as never,
      new BumpCatalogVersionForEditOperation(),
      new UpdateTokenKeyInCatalogOperation(),
      refreshCatalogRefsAndSelect as never,
      new RecordCatalogUndoOperation(
        new RecordUndoEntryOperation(undoStackStore),
        testUndo.buildUniversalUndoProcessor,
      ),
      testUndo.setCurrentUndoStackId,
    );
    const catalog = catalogSchema.parse({
      name: 'catalog-a',
      version: '1.0.0',
      type: 'manual',
      locked: false,
      sources: [],
      tokens: [{ key: 'editor.foreground', type: 'theme' }],
    });
    catalogsStore.getStore().upsertCatalogs([catalog]);
    catalogUiStore.getStore().selectCatalog({ name: 'catalog-a', version: '1.0.0' });

    await controller.run('editor.foreground', '   ', 'theme');
    await controller.run('editor.foreground', 'editor.foreground', 'theme');

    expect(saveCatalog.execute).not.toHaveBeenCalled();
    expect(undoStackStore.getStore().state.undoMenu?.canUndo ?? false).toBe(false);
  });

  it('does not record template undo when variable removal is rejected by validation', async () => {
    await undoManagerV2.clearPersisted();
    const templatesStore = new TemplatesStore();
    const templateUiStore = new TemplateUiStore();
    const undoStackStore = new UndoStackStore();
    const saveTemplate = { execute: vi.fn() };
    const refreshTemplateRefsAndSelect = { execute: vi.fn() };
    const testUndo = createTestUndoOperations(
      undoStackStore,
      createTestBuildUniversalUndoProcessor({
        applyCatalogUndoState: { execute: vi.fn() } as never,
        applyTemplateUndoState: new ApplyTemplateUndoStateOperation(
          templatesStore,
          templateUiStore,
          saveTemplate as never,
          refreshTemplateRefsAndSelect as never,
        ),
        applyThemeUndoState: { execute: vi.fn() } as never,
      }),
    );
    const controller = new RemoveVariableController(
      templatesStore,
      templateUiStore,
      new CatalogUiStore(),
      new ThemeUiStore(),
      new ValidateCanRemoveVariable(),
      new BumpTemplateVersionForEditOperation(),
      new RemoveColorVariableOperation(),
      new RemoveContrastVariableOperation(),
      { execute: vi.fn() } as never,
      saveTemplate as never,
      refreshTemplateRefsAndSelect as never,
      new RecordTemplateUndoOperation(
        new RecordUndoEntryOperation(undoStackStore),
        testUndo.buildUniversalUndoProcessor,
      ),
      testUndo.setCurrentUndoStackId,
    );
    const template = templateSchema.parse({
      name: 'template-a',
      version: '1.0.0',
      locked: false,
      catalogRefs: [],
      mappings: [{ token: { key: 'editor.foreground', type: 'theme' }, colorVariableRef: 'editorFg', contrastVariableRef: null, groupRef: null }],
      colorVariables: [{ key: 'editorFg', groupRef: null }],
      contrastVariables: [],
      groups: [],
    });
    templatesStore.getStore().updateTemplate(template);
    templateUiStore.getStore().selectTemplate({ name: 'template-a', version: '1.0.0' });

    controller.run('editorFg');

    expect(saveTemplate.execute).not.toHaveBeenCalled();
    expect(undoStackStore.getStore().state.undoMenu?.canUndo ?? false).toBe(false);
  });

  it('does not record theme undo when version increment save fails', async () => {
    await undoManagerV2.clearPersisted();
    const themeUiStore = new ThemeUiStore();
    const undoStackStore = new UndoStackStore();
    const testUndo = createTestUndoOperations(
      undoStackStore,
      createTestBuildUniversalUndoProcessor({
        applyCatalogUndoState: { execute: vi.fn() } as never,
        applyTemplateUndoState: { execute: vi.fn() } as never,
        applyThemeUndoState: { execute: vi.fn() } as never,
      }),
    );
    const saveTheme = {
      execute: vi.fn(() => {
        throw new Error('save failed');
      }),
    };
    const controller = new IncrementThemeVersionController(
      { execute: vi.fn() } as never,
      { execute: vi.fn() } as never,
      saveTheme as never,
      { execute: vi.fn() } as never,
      { execute: vi.fn() } as never,
      { execute: vi.fn() } as never,
      { execute: vi.fn() } as never,
      { execute: vi.fn() } as never,
      themeUiStore,
      new RecordThemeUndoOperation(
        new RecordUndoEntryOperation(undoStackStore),
        testUndo.buildUniversalUndoProcessor,
      ),
      testUndo.setCurrentUndoStackId,
    );
    themeUiStore.getStore().setSelectedRef({ name: 'theme-a', version: '1.0.0' });
    themeUiStore.getStore().setTheme(themeSchema.parse({
      name: 'theme-a',
      version: '1.0.0',
      templateRef: { name: 'template-a', version: '1.0.0' },
      colorAssignments: [],
      contrastAssignments: [],
    }));

    await controller.run();

    expect(saveTheme.execute).toHaveBeenCalledTimes(1);
    expect(undoStackStore.getStore().state.undoMenu?.canUndo ?? false).toBe(false);
  });

  it('skips record facades when no undo context is active', async () => {
    const undoStackStore = new UndoStackStore();
    const processor = { execute: vi.fn(() => ({ applyProcessor: vi.fn(), revertProcessor: vi.fn() })) };
    const catalog = catalogSchema.parse({
      name: 'catalog-a',
      version: '1.0.0',
      type: 'manual',
      locked: false,
      sources: [],
      tokens: [{ key: 'editorFg', type: 'theme' }],
    });
    const catalogBefore = catalogSchema.parse({
      name: 'catalog-a',
      version: '1.0.0',
      type: 'manual',
      locked: false,
      sources: [],
      tokens: [],
    });
    const template = templateSchema.parse({
      name: 'template-a',
      version: '1.0.0',
      locked: false,
      catalogRefs: [],
      mappings: [],
      colorVariables: [{ key: 'editorFg', groupRef: null }],
      contrastVariables: [],
      groups: [],
    });
    const templateBefore = templateSchema.parse({
      ...template,
      colorVariables: [],
    });
    const theme = themeSchema.parse({
      name: 'theme-a',
      version: '1.0.0',
      templateRef: { name: 'template-a', version: '1.0.0' },
      colorAssignments: [
        { colorRef: 'editorFg', dark: { value: '#222222' }, light: { value: '#eeeeee' }, useDarkForLight: false },
      ],
      contrastAssignments: [],
    });
    const themeBefore = themeSchema.parse({
      ...theme,
      colorAssignments: [
        { colorRef: 'editorFg', dark: { value: '#111111' }, light: { value: '#eeeeee' }, useDarkForLight: false },
      ],
    });
    const recordUndoEntry = new RecordUndoEntryOperation(undoStackStore);

    await expect(new RecordCatalogUndoOperation(recordUndoEntry, processor as never).execute({
      description: 'Rename token',
      actionType: CATALOG_TOKEN_KEY_UPDATED,
      target: 'catalog-a@1.0.0:theme:editorFg',
      before: catalogBefore,
      after: catalog,
    })).resolves.toMatchObject({ status: 'not-recorded' });

    await expect(new RecordTemplateUndoOperation(recordUndoEntry, processor as never).execute({
      description: 'Add variable',
      actionType: 'TEMPLATE_COLOR_VARIABLE_ADDED',
      target: 'template-a@1.0.0:color-variable:editorFg',
      before: templateBefore,
      after: template,
    })).resolves.toMatchObject({ status: 'not-recorded' });

    await expect(new RecordThemeUndoOperation(recordUndoEntry, processor as never).execute({
      description: 'Change dark color',
      actionType: 'THEME_COLOR_VARIABLE_DARK_SET',
      target: 'theme-a@1.0.0:editorFg:dark',
      before: themeBefore,
      after: theme,
    })).resolves.toMatchObject({ status: 'not-recorded' });
  });
});
