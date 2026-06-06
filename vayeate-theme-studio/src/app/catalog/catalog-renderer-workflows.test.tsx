import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CatalogsPage } from './catalog-page/CatalogsPage';
import { CatalogsCard } from './catalogs-card/CatalogsCard';
import { CreateCatalogDialog } from './create-dialog/CreateCatalogDialog';
import { CatalogDetailsCard } from './catalog-details-card/CatalogDetailsCard';
import { TokensCard } from './tokens-card/TokensCard';

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
});
