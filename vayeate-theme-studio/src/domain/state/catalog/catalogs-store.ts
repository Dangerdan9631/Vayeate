import { createStore } from "zustand/vanilla";
import { immer } from "zustand/middleware/immer";
import { singleton } from "tsyringe";
import { CatalogBulkAddParseSnapshot, CatalogStoreMap, initialCatalogsState, type CatalogsState } from "./catalogs-state";
import { Catalog } from "../../../model/catalog";
import { CatalogType } from "../../../model/catalog";
import { CatalogReference, SourceType, TokenType } from "../../../model/schema";

export interface CatalogEntryInput {
    name: string;
    version: string;
    isLoaded: boolean;
    catalog?: Catalog;
}
interface CatalogsStoreState {
    state: CatalogsState;
    setSelectedRef: (selectedRef: CatalogReference | null) => void;
    setCatalog: (catalog: Catalog | null) => void;
    setLoadedForDisplay: (name: string, version: string, catalog: Catalog | null) => void;
    setIsCreating: (value: boolean) => void;
    setCreateDialogOpen: (value: boolean) => void;
    setCreateFormName: (value: string) => void;
    setCreateFormType: (value: CatalogType) => void;
    setBulkAddDialogOpen: (value: boolean) => void;
    setBulkAddText: (value: string) => void;
    setBulkAddParse: (value: CatalogBulkAddParseSnapshot | null) => void;
    setTokensSearchText: (value: string) => void;
    setNewSourceUrl: (value: string) => void;
    setNewSourceTokenType: (value: TokenType) => void;
    setNewSourceType: (value: SourceType) => void;
    setNewTokenKey: (value: string) => void;
    setNewSemanticTokenSelectorText: (value: string) => void;
    setCatalogMapEntry: (name: string, version: string, isLoaded: boolean, catalog?: Catalog | null) => void;
    setCatalogMapEntries: (entries: CatalogEntryInput[]) => void;
}   
@singleton()
export class CatalogsStore {
    private store = createStore<CatalogsStoreState>()(
        immer((set): CatalogsStoreState => ({
            state: initialCatalogsState,
            setSelectedRef: (selectedRef: CatalogReference | null) => set((storeState) => {
                storeState.state.selectedRef = selectedRef;
            }),
            setCatalog: (catalog: Catalog | null) => set((storeState: CatalogsStoreState) => {
                storeState.state.catalog = catalog;
            }),
            setLoadedForDisplay: (name: string, version: string, catalog: Catalog | null) => set((storeState: CatalogsStoreState) => {
                if (catalog === null) {
                    delete storeState.state.loadedForDisplay[`${name}@${version}`];
                } else {
                    storeState.state.loadedForDisplay[`${name}@${version}`] = catalog;
                }
            }),
            setIsCreating: (value: boolean) => set((storeState) => {
                storeState.state.isCreating = value;
            }),
            setCreateDialogOpen: (value: boolean) => set((storeState) => {
                storeState.state.createDialogOpen = value;
            }),
            setCreateFormName: (value: string) => set((storeState) => {
                storeState.state.createFormName = value;
            }),
            setCreateFormType: (value: CatalogType) => set((storeState) => {
                storeState.state.createFormType = value;
            }),
            setBulkAddDialogOpen: (value: boolean) => set((storeState) => {
                storeState.state.bulkAddDialogOpen = value;
            }),
            setBulkAddText: (value: string) => set((storeState) => {
                storeState.state.bulkAddText = value;
            }),
            setBulkAddParse: (value: CatalogBulkAddParseSnapshot | null) => set((storeState) => {
                storeState.state.bulkAddParse = value;
            }),
            setTokensSearchText: (value: string) => set((storeState) => {
                storeState.state.tokensSearchText = value;
            }),
            setNewSourceUrl: (value: string) => set((storeState) => {
                storeState.state.newSourceUrl = value;
            }),
            setNewSourceTokenType: (value: TokenType) => set((storeState) => {
                storeState.state.newSourceTokenType = value;
            }),
            setNewSourceType: (value: SourceType) => set((storeState) => {
                storeState.state.newSourceType = value;
            }),
            setNewTokenKey: (value: string) => set((storeState) => {
                storeState.state.newTokenKey = value;
            }),
            setNewSemanticTokenSelectorText: (value: string) => set((storeState) => {
                storeState.state.newSemanticTokenSelectorText = value;
            }),
            setCatalogMapEntry: (name: string, version: string, isLoaded: boolean, catalog?: Catalog | null) => set((storeState: CatalogsStoreState) => {
                if (catalog === null) {
                    delete storeState.state.catalogMap[name][version];
                } else {
                    storeState.state.catalogMap[name][version] = { isLoaded, catalog };
                }
            }),
            setCatalogMapEntries: (entries: CatalogEntryInput[]) => set((storeState: CatalogsStoreState) => {
                storeState.state.catalogMap = entries.reduce((acc, entry) => {
                    acc[entry.name] = { [entry.version]: { isLoaded: entry.isLoaded, catalog: entry.catalog } };
                    return acc;
                }, {} as CatalogStoreMap);
            }),
        }))
    );

    get api() {
        return this.store;
    }

    getStore(): CatalogsStoreState {
        return this.store.getState();
    }
}