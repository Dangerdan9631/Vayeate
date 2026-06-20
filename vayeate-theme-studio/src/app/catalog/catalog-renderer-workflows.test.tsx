import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CatalogsPage } from './catalog-page/CatalogsPage';
import { CatalogsCard } from './catalogs-card/CatalogsCard';
import { CreateCatalogDialog } from './create-dialog/CreateCatalogDialog';
import { CatalogDetailsCard } from './catalog-details-card/CatalogDetailsCard';
import { TokensCard } from './tokens-card/TokensCard';
import { SetSelectedCatalogController } from './catalogs-card/controllers/set-selected-catalog-controller';
import { UpdateSourceUrlController } from './catalog-details-card/controllers/update-source-url-controller';
import { SyncCatalogController } from './catalog-details-card/controllers/sync-catalog-controller';
import { CloseCatalogCreateDialogController } from './create-dialog/controllers/close-catalog-create-dialog-controller';
import { DeleteCurrentCatalogVersionController } from './catalog-details-card/controllers/delete-current-catalog-version-controller';
import { RemoveTokenController } from './tokens-card/controllers/remove-token-controller';
import { UpdateTokenKeyController } from './tokens-card/controllers/update-token-key-controller';
import { CatalogsStore } from '../../domain/catalog/state/catalogs-store';
import { CatalogUiStore } from '../../domain/state/ui/catalog-ui-store';
import { TemplateUiStore } from '../../domain/state/ui/template-ui-store';
import { ThemeUiStore } from '../../domain/state/ui/theme-ui-store';
import { UndoStackStore } from '../../domain/state/undo-stack/undo-stack-store';
import { BumpCatalogVersionForEditOperation } from '../../domain/operations/catalog-operations/catalog-details/bump-catalog-version-for-edit-operation';
import { UpdateTokenKeyInCatalogOperation } from '../../domain/operations/catalog-operations/tokens/update-token-key-in-catalog-operation';
import { UpdateSourceUrlInCatalogOperation } from '../../domain/operations/catalog-operations/sources/update-source-url-in-catalog-operation';
import { RemoveTokenFromCatalogOperation } from '../../domain/operations/catalog-operations/tokens/remove-token-from-catalog-operation';
import { CreateCatalogOperation } from '../../domain/catalog/operations/create-catalog-operation';
import { CloseCatalogCreateDialogOperation } from '../../domain/operations/create-dialog/operations/close-catalog-create-dialog-operation';
import { SetSelectedCatalogOperation } from '../../domain/operations/delete/set-selected-catalog-operation';
import { ValidateCanUpdateCatalogSource } from '../../domain/catalog/validations/validate-can-update-catalog-source';
import { ValidateSyncCatalog } from '../../domain/catalog/validations/validate-sync-catalog';
import { CreateCatalogDialogStore } from '../../domain/state/ui/create-catalog-dialog-store';
import { ApplyCatalogLifecycleUndoOperation } from '../../domain/operations/undo-operations/apply-catalog-lifecycle-undo-operation';
import { ApplyCatalogUndoStateOperation } from '../../domain/operations/undo-operations/apply-catalog-undo-state-operation';
import { ApplyCatalogSourceUrlUndoOperation } from '../../domain/operations/undo-operations/apply-catalog-source-url-undo-operation';
import { RecordCatalogUndoOperation } from '../../domain/operations/undo-operations/record-catalog-undo-operation';
import { RecordUndoEntryOperation } from '../../domain/operations/undo-operations/record-undo-entry-operation';
import { undoManagerV2 } from '../../domain/core/undo-manager-v2';
import {
  createSyncBackgroundQueue,
  createTestBuildUniversalUndoProcessor,
  createTestUndoOperations,
  removeCatalogVersion,
  syncContinuation,
  waitForUndoRecorded,
} from '../../../test/undo/test-universal-undo-processor';
import { catalogSchema } from '../../model/schema/catalog';

const viewModelMocks = vi.hoisted(() => ({
  useCatalogViewModel: vi.fn(),
  useCreateCatalogDialogViewModel: vi.fn(),
  useCatalogDetailsCardViewModel: vi.fn(),
  useTokensCardViewModel: vi.fn(),
  useCatalogsCardViewModel: vi.fn(),
}));

vi.mock('./catalog-page/use-catalog-viewmodel', () => ({
  useCatalogViewModel: viewModelMocks.useCatalogViewModel,
}));

vi.mock('./create-dialog/use-create-catalog-dialog-viewmodel', () => ({
  useCreateCatalogDialogViewModel: viewModelMocks.useCreateCatalogDialogViewModel,
}));

vi.mock('./catalog-details-card/use-catalog-details-card-viewmodel', () => ({
  useCatalogDetailsCardViewModel: viewModelMocks.useCatalogDetailsCardViewModel,
}));

vi.mock('./tokens-card/use-tokens-card-viewmodel', () => ({
  useTokensCardViewModel: viewModelMocks.useTokensCardViewModel,
  CATALOG_TOKEN_LIST_SECTIONS: ['theme', 'textmate token'],
}));

vi.mock('./catalogs-card/use-catalogs-card-viewmodel', () => ({
  useCatalogsCardViewModel: viewModelMocks.useCatalogsCardViewModel,
}));

vi.mock('./bulk-add-dialog/BulkAddDialog', () => ({
  BulkAddDialog: () => <div>BulkAddDialog</div>,
}));

describe('catalog renderer workflows', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    viewModelMocks.useCreateCatalogDialogViewModel.mockReturnValue({
      name: '',
      type: 'manual',
      hasError: false,
      errorMessage: null,
      canSubmit: false,
      onNameChange: vi.fn(),
      onTypeChange: vi.fn(),
      onOkClick: vi.fn(),
      onCancelClick: vi.fn(),
    });
    viewModelMocks.useCatalogDetailsCardViewModel.mockReturnValue({
      catalog: null,
    });
    viewModelMocks.useTokensCardViewModel.mockReturnValue({
      catalog: null,
    });
    viewModelMocks.useCatalogsCardViewModel.mockReturnValue({
      selectedName: '',
      selectedVersion: '',
      catalogNames: [],
      catalogVersionNames: [],
      onCatalogsListCommit: vi.fn(),
      onCatalogVersionsListCommit: vi.fn(),
      onCreateCatalogClick: vi.fn(),
    });
  });

  it('renders catalog page loading and loaded states', () => {
    viewModelMocks.useCatalogViewModel.mockReturnValueOnce({
      isPageLoading: true,
      isCatalogLoading: false,
      isCatalogLoaded: false,
      createDialogOpen: false,
      bulkAddDialogOpen: false,
    });

    const view = render(<CatalogsPage />);
    expect(view.getByText('Loading catalogs...')).toBeInTheDocument();

    viewModelMocks.useCatalogViewModel.mockReturnValueOnce({
      isPageLoading: false,
      isCatalogLoading: true,
      isCatalogLoaded: false,
      createDialogOpen: false,
      bulkAddDialogOpen: false,
    });
    view.rerender(<CatalogsPage />);
    expect(view.getByRole('heading', { name: 'Catalogs' })).toBeInTheDocument();
    expect(view.getByText('Loading catalog...')).toBeInTheDocument();

    viewModelMocks.useCatalogViewModel.mockReturnValueOnce({
      isPageLoading: false,
      isCatalogLoading: false,
      isCatalogLoaded: true,
      createDialogOpen: true,
      bulkAddDialogOpen: true,
    });
    viewModelMocks.useCatalogDetailsCardViewModel.mockReturnValueOnce({
      catalog: {
        name: 'catalog-a',
        version: '1.0.0',
        type: 'manual',
        locked: false,
        sources: [],
        tokens: [],
      },
      themeTokenCount: 0,
      textmateTokenCount: 0,
      semanticTokenCount: 0,
      canAddNewSource: false,
      canSync: false,
      canLock: false,
      canRevert: false,
      newSourceUrl: '',
      newSourceTokenType: 'theme',
      newSourceType: 'default',
      sourceRows: [],
      newSourceTokenTypeOptions: [],
      newSourceTypeOptions: [],
      onDeleteVersionClick: vi.fn(),
      onLockClick: vi.fn(),
      onSyncClick: vi.fn(),
      onRevertClick: vi.fn(),
      onEditingSourceUrlChange: vi.fn(),
      onSourceUrlFocus: vi.fn(),
      onSourceUrlCommit: vi.fn(),
      onSourceTokenTypeChange: vi.fn(),
      onSourceTypeChange: vi.fn(),
      onSourceRemoveClick: vi.fn(),
      onNewSourceUrlChange: vi.fn(),
      onNewSourceTokenTypeChange: vi.fn(),
      onNewSourceTypeChange: vi.fn(),
      onNewSourceAddClick: vi.fn(),
    });
    viewModelMocks.useTokensCardViewModel.mockReturnValueOnce({
      catalog: {
        name: 'catalog-a',
        version: '1.0.0',
        type: 'manual',
        locked: false,
        sources: [],
        tokens: [],
      },
      tokensSearchText: '',
      newTokenKey: '',
      newSemanticTokenSelectorText: '',
      filteredTokensByType: {
        theme: [],
        'textmate token': [],
        'semantic token': [],
      },
      canEdit: false,
      canAddNewTokenKey: false,
      canAddSemanticTokenSelector: false,
      shouldShowSemanticTokenSection: false,
      semanticRegistryItemCount: 0,
      onBulkAddClick: vi.fn(),
      onSearchChange: vi.fn(),
      onNewTokenAddClick: vi.fn(),
      onTokenRemoveClick: vi.fn(),
      onTokenKeyCommit: vi.fn(),
      onNewTokenKeyChange: vi.fn(),
      onNewSemanticTokenSelectorTextChange: vi.fn(),
      onNewSemanticTokenSelectorAddClick: vi.fn(),
      onSemanticRegistryTextCommit: vi.fn(),
      onSemanticRegistryRemoveClick: vi.fn(),
    });
    view.rerender(<CatalogsPage />);
    expect(view.getByRole('heading', { name: 'Catalog Details' })).toBeInTheDocument();
    expect(view.getByRole('heading', { name: 'Tokens' })).toBeInTheDocument();
    expect(view.getByText('BulkAddDialog')).toBeInTheDocument();
    expect(view.getByRole('heading', { name: 'Create New Catalog' })).toBeInTheDocument();
  });

  it('handles catalog creation dialog interactions', async () => {
    const user = userEvent.setup();
    const onNameChange = vi.fn();
    const onTypeChange = vi.fn();
    const onOkClick = vi.fn();
    const onCancelClick = vi.fn();

    viewModelMocks.useCreateCatalogDialogViewModel.mockReturnValue({
      name: 'starter',
      type: 'manual',
      hasError: true,
      errorMessage: 'Name is required',
      canSubmit: false,
      onNameChange,
      onTypeChange,
      onOkClick,
      onCancelClick,
    });

    const view = render(<CreateCatalogDialog />);

    await user.type(view.getByPlaceholderText('my-catalog'), 'x');
    expect(onNameChange).toHaveBeenLastCalledWith('starterx');

    await user.selectOptions(view.getByRole('combobox'), 'remote');
    expect(onTypeChange).toHaveBeenCalledWith('remote');

    expect(view.getByText('Name is required')).toBeInTheDocument();
    expect(view.getByRole('button', { name: 'OK' })).toBeDisabled();

    await user.click(view.getByRole('button', { name: 'Cancel' }));
    expect(onCancelClick).toHaveBeenCalledTimes(1);

    await user.click(view.container.querySelector('.dialog-overlay')!);
    expect(onCancelClick).toHaveBeenCalledTimes(2);
    expect(onOkClick).not.toHaveBeenCalled();
  });

  it('supports catalog selection and create actions from the catalogs card', async () => {
    const user = userEvent.setup();
    const onCatalogsListCommit = vi.fn();
    const onCatalogVersionsListCommit = vi.fn();
    const onCreateCatalogClick = vi.fn();

    viewModelMocks.useCatalogsCardViewModel.mockReturnValue({
      selectedName: 'catalog-a',
      selectedVersion: '1.0.1',
      catalogNames: ['catalog-a', 'catalog-b'],
      catalogVersionNames: ['1.0.0', '1.0.1'],
      onCatalogsListCommit,
      onCatalogVersionsListCommit,
      onCreateCatalogClick,
    });

    const view = render(<CatalogsCard />);
    const selects = view.getAllByRole('combobox');

    await user.selectOptions(selects[0], 'catalog-b');
    expect(onCatalogsListCommit).toHaveBeenCalledWith('catalog-b');

    await user.selectOptions(selects[1], '1.0.0');
    expect(onCatalogVersionsListCommit).toHaveBeenCalledWith('1.0.0');

    await user.click(view.getByRole('button', { name: "'Create new catalog'" }));
    expect(onCreateCatalogClick).toHaveBeenCalledTimes(1);
  });

  it('selects a catalog-scoped undo stack when catalog references change', async () => {
    const setSelectedCatalog = { execute: vi.fn() };
    const templateUiStore = {
      getStore: () => ({ state: { selectedRef: { name: 'template-a', version: '1.0.0' } } }),
    };
    const themeUiStore = {
      getStore: () => ({ state: { selectedRef: { name: 'theme-a', version: '1.0.0' } } }),
    };
    const setCurrentUndoStackId = { executeAndLoadForContext: vi.fn() };
    const controller = new SetSelectedCatalogController(
      setSelectedCatalog as never,
      templateUiStore as never,
      themeUiStore as never,
      setCurrentUndoStackId as never,
    );

    await controller.run('catalog-a', '1.0.0');
    await controller.run('catalog-b', '1.0.0');

    expect(setCurrentUndoStackId.executeAndLoadForContext).toHaveBeenNthCalledWith(1, expect.objectContaining({
      contextKey: 'tab=catalogs|template=template-a@1.0.0|catalog=catalog-a@1.0.0|theme=theme-a@1.0.0',
    }));
    expect(setCurrentUndoStackId.executeAndLoadForContext).toHaveBeenNthCalledWith(2, expect.objectContaining({
      contextKey: 'tab=catalogs|template=template-a@1.0.0|catalog=catalog-b@1.0.0|theme=theme-a@1.0.0',
    }));
  });

  it('renders remote catalog details and dispatches source editing actions', async () => {
    const user = userEvent.setup();
    const callbacks = {
      onDeleteVersionClick: vi.fn(),
      onLockClick: vi.fn(),
      onSyncClick: vi.fn(),
      onRevertClick: vi.fn(),
      onEditingSourceUrlChange: vi.fn(),
      onSourceUrlFocus: vi.fn(),
      onSourceUrlCommit: vi.fn(),
      onSourceTokenTypeChange: vi.fn(),
      onSourceTypeChange: vi.fn(),
      onSourceRemoveClick: vi.fn(),
      onNewSourceUrlChange: vi.fn(),
      onNewSourceTokenTypeChange: vi.fn(),
      onNewSourceTypeChange: vi.fn(),
      onNewSourceAddClick: vi.fn(),
    };

    viewModelMocks.useCatalogDetailsCardViewModel.mockReturnValue({
      catalog: {
        name: 'remote-catalog',
        version: '1.0.0',
        type: 'remote',
        locked: false,
        sources: [{ url: 'https://example.test/source', tokenType: 'theme', type: 'default' }],
        tokens: [
          { key: 'editor.foreground', type: 'theme' },
          { key: 'keyword.control', type: 'textmate token' },
          { key: 'variable', type: 'semantic token' },
        ],
      },
      themeTokenCount: 1,
      textmateTokenCount: 1,
      semanticTokenCount: 1,
      canAddNewSource: true,
      canSync: true,
      canLock: false,
      canRevert: false,
      newSourceUrl: '',
      newSourceTokenType: 'theme',
      newSourceType: 'default',
      sourceRows: [
        {
          sourceIndex: 0,
          url: 'https://example.test/source',
          tokenType: 'theme',
          sourceType: 'default',
          isDisabled: false,
          tokenTypeOptions: [{ value: 'theme', label: 'Theme Tokens' }],
          sourceTypeOptions: [{ value: 'default', label: 'default' }],
        },
      ],
      newSourceTokenTypeOptions: [
        { value: 'theme', label: 'Theme Tokens' },
        { value: 'textmate token', label: 'Textmate Tokens' },
      ],
      newSourceTypeOptions: [{ value: 'default', label: 'default' }],
      ...callbacks,
    });

    const view = render(<CatalogDetailsCard />);

    expect(view.getByText('remote-catalog')).toBeInTheDocument();

    const sourceInputs = view.getAllByPlaceholderText('https://...');
    await user.click(sourceInputs[0]);
    expect(callbacks.onSourceUrlFocus).toHaveBeenCalledWith('0');
    await user.type(sourceInputs[0], 'a');
    expect(callbacks.onEditingSourceUrlChange).toHaveBeenCalled();
    const setInputValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
    setInputValue?.call(sourceInputs[0], 'https://example.test/next');
    sourceInputs[0].blur();
    expect(callbacks.onSourceUrlCommit).toHaveBeenCalledWith('https://example.test/source', '0');

    const selects = view.getAllByRole('combobox');
    await user.selectOptions(selects[0], 'theme');
    expect(callbacks.onSourceTokenTypeChange).toHaveBeenCalledWith('theme', '0');
    await user.selectOptions(selects[1], 'default');
    expect(callbacks.onSourceTypeChange).toHaveBeenCalledWith('default', '0');

    await user.type(sourceInputs[1], 'https://new.example.test');
    expect(callbacks.onNewSourceUrlChange).toHaveBeenCalled();
    await user.click(view.getByRole('button', { name: 'Add source' }));
    expect(callbacks.onNewSourceAddClick).toHaveBeenCalledTimes(1);

    await user.click(view.getByRole('button', { name: 'Remove source' }));
    expect(callbacks.onSourceRemoveClick).toHaveBeenCalledWith('0');
    await user.click(view.getByRole('button', { name: 'Delete version' }));
    await user.click(view.getByRole('button', { name: 'Sync' }));
    expect(callbacks.onDeleteVersionClick).toHaveBeenCalledTimes(1);
    expect(callbacks.onSyncClick).toHaveBeenCalledTimes(1);
  });

  it('supports token search, bulk add, token edits, and semantic registry edits', async () => {
    const user = userEvent.setup();
    const callbacks = {
      onBulkAddClick: vi.fn(),
      onSearchChange: vi.fn(),
      onNewTokenAddClick: vi.fn(),
      onTokenRemoveClick: vi.fn(),
      onTokenKeyCommit: vi.fn(),
      onNewTokenKeyChange: vi.fn(),
      onNewSemanticTokenSelectorTextChange: vi.fn(),
      onNewSemanticTokenSelectorAddClick: vi.fn(),
      onSemanticRegistryTextCommit: vi.fn(),
      onSemanticRegistryRemoveClick: vi.fn(),
    };

    viewModelMocks.useTokensCardViewModel.mockReturnValue({
      catalog: {
        name: 'manual-catalog',
        version: '1.0.1',
        type: 'manual',
        locked: false,
        sources: [],
        tokens: [],
        semanticTokenTypes: ['variable'],
        semanticTokenModifiers: ['readonly'],
        semanticTokenLanguages: ['typescript'],
      },
      tokensSearchText: 'editor',
      newTokenKey: 'new.token',
      newSemanticTokenSelectorText: 'variable.readonly:typescript',
      filteredTokensByType: {
        theme: [{ key: 'editor.foreground', type: 'theme' }],
        'textmate token': [{ key: 'keyword.control', type: 'textmate token' }],
        'semantic token': [],
      },
      canEdit: true,
      canAddNewTokenKey: true,
      canAddSemanticTokenSelector: true,
      shouldShowSemanticTokenSection: true,
      semanticRegistryItemCount: 3,
      ...callbacks,
    });

    const view = render(<TokensCard />);

    await user.click(view.getByRole('button', { name: 'Bulk Add' }));
    expect(callbacks.onBulkAddClick).toHaveBeenCalledTimes(1);

    await user.type(view.getByRole('textbox', { name: 'Search tokens' }), 'x');
    expect(callbacks.onSearchChange).toHaveBeenCalled();

    const addButtons = view.getAllByTitle('Add');
    await user.click(addButtons[0]);
    expect(callbacks.onNewTokenAddClick).toHaveBeenCalledWith('theme');

    const tokenInput = view.getByDisplayValue('editor.foreground');
    await user.clear(tokenInput);
    await user.type(tokenInput, 'editor.background');
    tokenInput.focus();
    tokenInput.blur();
    expect(callbacks.onTokenKeyCommit).toHaveBeenCalledWith('theme', 'editor.foreground', 'editor.background');

    await user.click(view.getAllByTitle('Remove')[0]);
    expect(callbacks.onTokenRemoveClick).toHaveBeenCalledWith('theme', 'editor.foreground');

    const newTokenInput = view.getAllByPlaceholderText('new key…')[0];
    await user.type(newTokenInput, 'x');
    expect(callbacks.onNewTokenKeyChange).toHaveBeenCalled();

    const semanticInput = view.getByLabelText('Semantic selector');
    await user.type(semanticInput, '!');
    expect(callbacks.onNewSemanticTokenSelectorTextChange).toHaveBeenCalled();
    await user.click(addButtons[2]);
    expect(callbacks.onNewSemanticTokenSelectorAddClick).toHaveBeenCalledTimes(1);

    const typeInput = view.getByLabelText('tokenType 1');
    await user.clear(typeInput);
    await user.type(typeInput, 'property');
    typeInput.focus();
    typeInput.blur();
    expect(callbacks.onSemanticRegistryTextCommit).toHaveBeenCalledWith('types', 0, 'property');
    await user.click(view.getAllByTitle('Remove')[2]);
    expect(callbacks.onSemanticRegistryRemoveClick).toHaveBeenCalled();
  });

  it('records, undoes, and redoes a completed catalog token key edit', async () => {
    await undoManagerV2.clearPersisted();
    const catalogsStore = new CatalogsStore();
    const catalogUiStore = new CatalogUiStore();
    const templateUiStore = new TemplateUiStore();
    const themeUiStore = new ThemeUiStore();
    const undoStackStore = new UndoStackStore();
    const saveCatalog = { execute: vi.fn() };
    const refreshCatalogRefsAndSelect = { execute: vi.fn() };
    const applyCatalogUndoState = new ApplyCatalogUndoStateOperation(
      catalogsStore,
      catalogUiStore,
      saveCatalog as never,
      refreshCatalogRefsAndSelect as never,
    );
    const testUndo = createTestUndoOperations(
      undoStackStore,
      createTestBuildUniversalUndoProcessor({
        applyCatalogUndoState,
        applyTemplateUndoState: {
          execute: vi.fn(),
        } as never,
        applyThemeUndoState: {
          execute: vi.fn(),
        } as never,
      }),
    );
    const controller = new UpdateTokenKeyController(
      catalogsStore,
      catalogUiStore,
      templateUiStore,
      themeUiStore,
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

    await controller.run('editor.foreground', 'editor.background', 'theme');
    expect(catalogsStore.getStore().state.catalogs['catalog-a']?.['1.0.0']?.catalog?.tokens[0].key).toBe('editor.background');
    expect(undoStackStore.getStore().state.undoMenu.canUndo).toBe(true);

    await testUndo.undo.execute();
    expect(catalogsStore.getStore().state.catalogs['catalog-a']?.['1.0.0']?.catalog?.tokens[0].key).toBe('editor.foreground');

    await testUndo.redo.execute();
    expect(catalogsStore.getStore().state.catalogs['catalog-a']?.['1.0.0']?.catalog?.tokens[0].key).toBe('editor.background');
  });

  it('does not record catalog undo entries for rejected token key edits', async () => {
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

    await controller.run('missing.token', 'editor.background', 'theme');
    await controller.run('editor.foreground', '   ', 'theme');

    expect(saveCatalog.execute).not.toHaveBeenCalled();
    expect(undoStackStore.getStore().state.undoMenu.canUndo).toBe(false);
  });

  describe('catalog undo round-trips', () => {
    function createCatalogUndoHarness(catalogsStore: CatalogsStore, catalogUiStore: CatalogUiStore) {
      const undoStackStore = new UndoStackStore();
      const saveCatalog = { execute: vi.fn() };
      const refreshCatalogRefsAndSelect = { execute: vi.fn() };
      const applyCatalogUndoState = new ApplyCatalogUndoStateOperation(
        catalogsStore,
        catalogUiStore,
        saveCatalog as never,
        refreshCatalogRefsAndSelect as never,
      );
      const deleteCatalog = {
        execute: vi.fn((name: string, version: string) => syncContinuation(() => {
          removeCatalogVersion(catalogsStore, name, version);
        })),
      };
      const applyCatalogLifecycleUndo = new ApplyCatalogLifecycleUndoOperation(
        deleteCatalog as never,
        applyCatalogUndoState,
        { execute: vi.fn((ref) => catalogUiStore.getStore().selectCatalog(ref)) } as never,
        { execute: vi.fn(() => syncContinuation()) } as never,
        refreshCatalogRefsAndSelect as never,
      );
      const buildUniversalUndoProcessor = createTestBuildUniversalUndoProcessor({
        applyCatalogUndoState,
        applyCatalogLifecycleUndo,
        applyCatalogSourceUrlUndo: new ApplyCatalogSourceUrlUndoOperation(
          catalogsStore,
          catalogUiStore,
          applyCatalogUndoState,
        ),
        applyTemplateUndoState: { execute: vi.fn() } as never,
        applyThemeUndoState: { execute: vi.fn() } as never,
      });
      const testUndo = createTestUndoOperations(undoStackStore, buildUniversalUndoProcessor);
      const recordCatalogUndo = new RecordCatalogUndoOperation(
        new RecordUndoEntryOperation(undoStackStore),
        buildUniversalUndoProcessor,
      );
      return {
        undoStackStore,
        saveCatalog,
        testUndo,
        recordCatalogUndo,
      };
    }

    function saveCatalogToStore(catalogsStore: CatalogsStore) {
      return {
        execute: vi.fn((catalog: ReturnType<typeof catalogSchema.parse>) => {
          catalogsStore.getStore().upsertCatalogs([catalog]);
        }),
      };
    }

    it('records, undoes, and redoes a catalog source URL edit', async () => {
      await undoManagerV2.clearPersisted();
      const catalogsStore = new CatalogsStore();
      const catalogUiStore = new CatalogUiStore();
      const { testUndo, recordCatalogUndo, undoStackStore } = createCatalogUndoHarness(catalogsStore, catalogUiStore);
      const saveCatalog = saveCatalogToStore(catalogsStore);
      const refreshCatalogRefsAndSelect = { execute: vi.fn() };
      const controller = new UpdateSourceUrlController(
        catalogsStore,
        catalogUiStore,
        new TemplateUiStore(),
        new ThemeUiStore(),
        saveCatalog as never,
        new BumpCatalogVersionForEditOperation(),
        new UpdateSourceUrlInCatalogOperation(),
        refreshCatalogRefsAndSelect as never,
        new ValidateCanUpdateCatalogSource(),
        recordCatalogUndo,
        testUndo.setCurrentUndoStackId,
      );
      const catalog = catalogSchema.parse({
        name: 'remote-catalog',
        version: '1.0.0',
        type: 'remote',
        locked: false,
        sources: [{ url: 'https://example.test/old', tokenType: 'theme', type: 'default' }],
        tokens: [],
      });
      catalogsStore.getStore().upsertCatalogs([catalog]);
      catalogUiStore.getStore().selectCatalog({ name: 'remote-catalog', version: '1.0.0' });

      controller.run(0, 'https://example.test/new');
      expect(catalogsStore.getStore().state.catalogs['remote-catalog']?.['1.0.0']?.catalog?.sources[0].url)
        .toBe('https://example.test/new');

      await waitForUndoRecorded(undoStackStore);
      await testUndo.undo.execute();
      expect(catalogsStore.getStore().state.catalogs['remote-catalog']?.['1.0.0']?.catalog?.sources[0].url)
        .toBe('https://example.test/old');

      await testUndo.redo.execute();
      expect(catalogsStore.getStore().state.catalogs['remote-catalog']?.['1.0.0']?.catalog?.sources[0].url)
        .toBe('https://example.test/new');
    });

    it('records, undoes, and redoes a catalog token removal', async () => {
      await undoManagerV2.clearPersisted();
      const catalogsStore = new CatalogsStore();
      const catalogUiStore = new CatalogUiStore();
      const { testUndo, recordCatalogUndo, undoStackStore } = createCatalogUndoHarness(catalogsStore, catalogUiStore);
      const saveCatalog = saveCatalogToStore(catalogsStore);
      const refreshCatalogRefsAndSelect = { execute: vi.fn() };
      const controller = new RemoveTokenController(
        catalogsStore,
        catalogUiStore,
        new TemplateUiStore(),
        new ThemeUiStore(),
        saveCatalog as never,
        new BumpCatalogVersionForEditOperation(),
        new RemoveTokenFromCatalogOperation(),
        refreshCatalogRefsAndSelect as never,
        recordCatalogUndo,
        testUndo.setCurrentUndoStackId,
      );
      const catalog = catalogSchema.parse({
        name: 'catalog-a',
        version: '1.0.0',
        type: 'manual',
        locked: false,
        sources: [],
        tokens: [
          { key: 'editor.foreground', type: 'theme' },
          { key: 'editor.background', type: 'theme' },
        ],
      });
      catalogsStore.getStore().upsertCatalogs([catalog]);
      catalogUiStore.getStore().selectCatalog({ name: 'catalog-a', version: '1.0.0' });

      controller.run('editor.foreground', 'theme');
      expect(catalogsStore.getStore().state.catalogs['catalog-a']?.['1.0.0']?.catalog?.tokens).toHaveLength(1);

      await waitForUndoRecorded(undoStackStore);
      await testUndo.undo.execute();
      expect(catalogsStore.getStore().state.catalogs['catalog-a']?.['1.0.0']?.catalog?.tokens).toHaveLength(2);

      await testUndo.redo.execute();
      expect(catalogsStore.getStore().state.catalogs['catalog-a']?.['1.0.0']?.catalog?.tokens).toHaveLength(1);
    });

    it('records, undoes, and redoes a catalog sync', async () => {
      await undoManagerV2.clearPersisted();
      const catalogsStore = new CatalogsStore();
      const catalogUiStore = new CatalogUiStore();
      const { testUndo, recordCatalogUndo, undoStackStore } = createCatalogUndoHarness(catalogsStore, catalogUiStore);
      const saveCatalog = saveCatalogToStore(catalogsStore);
      const refreshCatalogRefsAndSelect = { execute: vi.fn() };
      const syncCatalog = {
        execute: vi.fn(async (catalog) => ({
          ...catalog,
          locked: true,
          tokens: [{ key: 'synced.token', type: 'theme' as const }],
        })),
      };
      const controller = new SyncCatalogController(
        catalogsStore,
        catalogUiStore,
        new TemplateUiStore(),
        new ThemeUiStore(),
        new ValidateSyncCatalog(),
        saveCatalog as never,
        syncCatalog as never,
        refreshCatalogRefsAndSelect as never,
        recordCatalogUndo,
        testUndo.setCurrentUndoStackId,
      );
      const catalog = catalogSchema.parse({
        name: 'remote-catalog',
        version: '1.0.0',
        type: 'remote',
        locked: false,
        sources: [{ url: 'https://example.test/source', tokenType: 'theme', type: 'default' }],
        tokens: [],
      });
      catalogsStore.getStore().upsertCatalogs([catalog]);
      catalogUiStore.getStore().selectCatalog({ name: 'remote-catalog', version: '1.0.0' });

      await controller.run();
      expect(catalogsStore.getStore().state.catalogs['remote-catalog']?.['1.0.0']?.catalog?.tokens[0].key)
        .toBe('synced.token');

      await waitForUndoRecorded(undoStackStore);
      await testUndo.undo.execute();
      expect(catalogsStore.getStore().state.catalogs['remote-catalog']?.['1.0.0']?.catalog?.tokens).toHaveLength(0);

      await testUndo.redo.execute();
      expect(catalogsStore.getStore().state.catalogs['remote-catalog']?.['1.0.0']?.catalog?.tokens[0].key)
        .toBe('synced.token');
    });

    it('records, undoes, and redoes catalog creation', async () => {
      await undoManagerV2.clearPersisted();
      const catalogsStore = new CatalogsStore();
      const catalogUiStore = new CatalogUiStore();
      const createCatalogDialogStore = new CreateCatalogDialogStore();
      const { testUndo, recordCatalogUndo, undoStackStore } = createCatalogUndoHarness(catalogsStore, catalogUiStore);
      const backgroundQueue = createSyncBackgroundQueue();
      const createCatalog = new CreateCatalogOperation(
        catalogsStore,
        { saveCatalog: vi.fn() } as never,
        backgroundQueue as never,
      );
      const controller = new CloseCatalogCreateDialogController(
        createCatalogDialogStore,
        catalogUiStore,
        catalogsStore,
        new TemplateUiStore(),
        new ThemeUiStore(),
        new CloseCatalogCreateDialogOperation(createCatalogDialogStore),
        createCatalog,
        new SetSelectedCatalogOperation(
          catalogsStore,
          catalogUiStore,
          { loadCatalog: vi.fn() } as never,
          backgroundQueue as never,
        ),
        recordCatalogUndo,
        testUndo.setCurrentUndoStackId,
      );
      createCatalogDialogStore.getStore().openCreateCatalogDialog();
      createCatalogDialogStore.getStore().setCreateCatalogDialogData('new-catalog', 'manual');

      controller.run('OK');
      expect(catalogsStore.getStore().state.catalogs['new-catalog']?.['1.0.0']?.catalog?.name).toBe('new-catalog');

      await waitForUndoRecorded(undoStackStore);
      await testUndo.undo.execute();
      await vi.waitFor(() => {
        expect(catalogsStore.getStore().state.catalogs['new-catalog']).toBeUndefined();
      });

      await testUndo.redo.execute();
      expect(catalogsStore.getStore().state.catalogs['new-catalog']?.['1.0.0']?.catalog?.name).toBe('new-catalog');
    });

    it('records, undoes, and redoes catalog version deletion', async () => {
      await undoManagerV2.clearPersisted();
      const catalogsStore = new CatalogsStore();
      const catalogUiStore = new CatalogUiStore();
      const { testUndo, recordCatalogUndo, undoStackStore } = createCatalogUndoHarness(catalogsStore, catalogUiStore);
      const deleteCatalog = {
        execute: vi.fn((name: string, version: string) => syncContinuation(() => {
          removeCatalogVersion(catalogsStore, name, version);
        })),
      };
      const controller = new DeleteCurrentCatalogVersionController(
        catalogUiStore,
        catalogsStore,
        new TemplateUiStore(),
        new ThemeUiStore(),
        deleteCatalog as never,
        { execute: vi.fn(() => syncContinuation()) } as never,
        { execute: vi.fn((ref) => catalogUiStore.getStore().selectCatalog(ref)) } as never,
        recordCatalogUndo,
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

      await controller.run();
      await vi.waitFor(() => {
        expect(catalogsStore.getStore().state.catalogs['catalog-a']?.['1.0.0']).toBeUndefined();
      });

      await waitForUndoRecorded(undoStackStore);
      await testUndo.undo.execute();
      expect(catalogsStore.getStore().state.catalogs['catalog-a']?.['1.0.0']?.catalog?.tokens[0].key)
        .toBe('editor.foreground');

      await testUndo.redo.execute();
      expect(catalogsStore.getStore().state.catalogs['catalog-a']?.['1.0.0']).toBeUndefined();
    });
  });

  describe('catalog undo failure paths', () => {
    it('does not record undo entries for no-op token key edits', async () => {
      await undoManagerV2.clearPersisted();
      const catalogsStore = new CatalogsStore();
      const catalogUiStore = new CatalogUiStore();
      const undoStackStore = new UndoStackStore();
      const testUndo = createTestUndoOperations(
        undoStackStore,
        createTestBuildUniversalUndoProcessor({
          applyCatalogUndoState: new ApplyCatalogUndoStateOperation(
            catalogsStore,
            catalogUiStore,
            { execute: vi.fn() } as never,
            { execute: vi.fn() } as never,
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
        { execute: vi.fn() } as never,
        new BumpCatalogVersionForEditOperation(),
        new UpdateTokenKeyInCatalogOperation(),
        { execute: vi.fn() } as never,
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

      await controller.run('editor.foreground', 'editor.foreground', 'theme');
      expect(undoStackStore.getStore().state.undoMenu?.canUndo ?? false).toBe(false);
    });

    it('does not record undo entries for rejected source URL edits', async () => {
      await undoManagerV2.clearPersisted();
      const catalogsStore = new CatalogsStore();
      const catalogUiStore = new CatalogUiStore();
      const undoStackStore = new UndoStackStore();
      const saveCatalog = { execute: vi.fn() };
      const testUndo = createTestUndoOperations(
        undoStackStore,
        createTestBuildUniversalUndoProcessor({
          applyCatalogUndoState: new ApplyCatalogUndoStateOperation(
            catalogsStore,
            catalogUiStore,
            saveCatalog as never,
            { execute: vi.fn() } as never,
          ),
          applyTemplateUndoState: { execute: vi.fn() } as never,
          applyThemeUndoState: { execute: vi.fn() } as never,
        }),
      );
      const controller = new UpdateSourceUrlController(
        catalogsStore,
        catalogUiStore,
        new TemplateUiStore(),
        new ThemeUiStore(),
        saveCatalog as never,
        new BumpCatalogVersionForEditOperation(),
        new UpdateSourceUrlInCatalogOperation(),
        { execute: vi.fn() } as never,
        new ValidateCanUpdateCatalogSource(),
        new RecordCatalogUndoOperation(
          new RecordUndoEntryOperation(undoStackStore),
          testUndo.buildUniversalUndoProcessor,
        ),
        testUndo.setCurrentUndoStackId,
      );
      const catalog = catalogSchema.parse({
        name: 'remote-catalog',
        version: '1.0.0',
        type: 'remote',
        locked: false,
        sources: [],
        tokens: [],
      });
      catalogsStore.getStore().upsertCatalogs([catalog]);
      catalogUiStore.getStore().selectCatalog({ name: 'remote-catalog', version: '1.0.0' });

      controller.run(0, 'https://example.test/new');
      expect(saveCatalog.execute).not.toHaveBeenCalled();
      expect(undoStackStore.getStore().state.undoMenu?.canUndo ?? false).toBe(false);
    });

    it('does not record undo entries when catalog save fails', async () => {
      await undoManagerV2.clearPersisted();
      const catalogsStore = new CatalogsStore();
      const catalogUiStore = new CatalogUiStore();
      const undoStackStore = new UndoStackStore();
      const saveCatalog = { execute: vi.fn(() => { throw new Error('save failed'); }) };
      const testUndo = createTestUndoOperations(
        undoStackStore,
        createTestBuildUniversalUndoProcessor({
          applyCatalogUndoState: new ApplyCatalogUndoStateOperation(
            catalogsStore,
            catalogUiStore,
            saveCatalog as never,
            { execute: vi.fn() } as never,
          ),
          applyTemplateUndoState: { execute: vi.fn() } as never,
          applyThemeUndoState: { execute: vi.fn() } as never,
        }),
      );
      const controller = new RemoveTokenController(
        catalogsStore,
        catalogUiStore,
        new TemplateUiStore(),
        new ThemeUiStore(),
        saveCatalog as never,
        new BumpCatalogVersionForEditOperation(),
        new RemoveTokenFromCatalogOperation(),
        { execute: vi.fn() } as never,
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

      expect(() => controller.run('editor.foreground', 'theme')).toThrow('save failed');
      expect(undoStackStore.getStore().state.undoMenu?.canUndo ?? false).toBe(false);
    });
  });
});
