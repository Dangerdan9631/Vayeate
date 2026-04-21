import { createStore } from "zustand/vanilla";
import { immer } from "zustand/middleware/immer";
import { castDraft } from "immer";
import { singleton } from "tsyringe";
import { CatalogMap, CatalogsStateV2, emptyBulkAddData, emptyCreateCatalogData, emptyNewSource, initialCatalogsStateV2 } from "./catalogs-state";
import type { Catalog } from "../../../model/schema/catalog";
import type { CatalogReference } from "../../../model/schema/template-schemas";
import type { CatalogType, SourceType, TokenType } from "../../../model/schema/primitives";
import { DialogResultOkCancel } from "../../../model/dialog-result";

interface CatalogsStoreState {
    stateV2: CatalogsStateV2;
    updateCatalogRefs: (refs: CatalogReference[]) => void;
    selectCatalog: (ref: CatalogReference | null) => void;
    updateCatalog: (catalog: Catalog) => void;
    updateCatalogs: (catalogs: Catalog[]) => void;
    openCreateCatalogDialog: () => void;
    setCreateCatalogDialogData: (name?: string, type?: CatalogType) => void;
    setCreateCatalogDialogError: (errorMessage: string | null) => void;
    closeCreateCatalogDialog: (result: 'OK' | 'CANCEL') => void;
    openBulkAddDialog: () => void;
    setBulkAddDialogData: (text?: string) => void;
    setBulkAddDialogMetrics: (
        errorMessage: string | null,
        counts: Record<TokenType, number> | null,
        newCount: number,
        duplicateCount: number
    ) => void;
    closeBulkAddDialog: (result: 'OK' | 'CANCEL') => void;
    setTokensSearchText: (value: string) => void;
    setNewSourceData: (url?: string, tokenType?: TokenType, type?: SourceType) => void;
    clearNewSourceData: () => void;
    setNewTokenKey: (value: string) => void;
    setNewSemanticTokenSelectorText: (value: string) => void;
}

export function getCurrentCatalog(storeState: CatalogsStoreState): Catalog | null {
    const selectedRef = storeState.stateV2.selectedRef;
    if (!selectedRef) return null;
    const catalog = storeState.stateV2.catalogs[selectedRef.name]?.[selectedRef.version];
    if (!catalog || !catalog.isLoaded) return null;
    return catalog.catalog;
}

export function getCurrentCatalogRefs(catalogMap: CatalogMap): CatalogReference[] {
    const refs: CatalogReference[] = [];
    for (const name of Object.keys(catalogMap).sort()) {
        for (const version of Object.keys(catalogMap[name]!).sort()) {
            refs.push({ name, version });
        }
    }
    return refs;
}

export function getAllLoadedCatalogs(storeState: CatalogsStoreState): Catalog[] {
    const catalogs: Catalog[] = [];
    for (const name of Object.keys(storeState.stateV2.catalogs)) {
        for (const version of Object.keys(storeState.stateV2.catalogs[name]!)) {
            const entry = storeState.stateV2.catalogs[name]![version];
            if (entry && entry.isLoaded && entry.catalog) {
                catalogs.push(entry.catalog as Catalog);
            }
        }
    }
    return catalogs;
}

@singleton()
export class CatalogsStore {
    private store = createStore<CatalogsStoreState>()(
        immer((set): CatalogsStoreState => ({
            stateV2: initialCatalogsStateV2,
            updateCatalogRefs: (refs: CatalogReference[]) => set((storeState) => {
                refs.forEach((ref) => {
                    if (!storeState.stateV2.catalogs[ref.name]) {
                        storeState.stateV2.catalogs[ref.name] = {};
                    }
                    if (!storeState.stateV2.catalogs[ref.name][ref.version]) {
                        storeState.stateV2.catalogs[ref.name][ref.version] = {
                            isLoaded: false,
                            catalog: null,
                        };
                    }
                });
            }),
            selectCatalog: (ref: CatalogReference | null) => set((storeState) => {
                storeState.stateV2.selectedRef = ref;
            }),
            updateCatalog: (catalog: Catalog) => set((storeState) => {
                const catalogRef = {
                    name: catalog.name,
                    version: catalog.version,
                };
                if (!storeState.stateV2.catalogs[catalogRef.name]) {
                    storeState.stateV2.catalogs[catalogRef.name] = {};
                }
                storeState.stateV2.catalogs[catalogRef.name][catalogRef.version] = {
                    isLoaded: true,
                    catalog: castDraft(catalog),
                };
            }),
            updateCatalogs: (catalogs: Catalog[]) => set((storeState) => {
                catalogs.forEach((catalog) => {
                    const catalogRef = {
                        name: catalog.name,
                        version: catalog.version,
                    };
                    if (!storeState.stateV2.catalogs[catalogRef.name]) {
                        storeState.stateV2.catalogs[catalogRef.name] = {};
                    }
                    storeState.stateV2.catalogs[catalogRef.name][catalogRef.version] = {
                        isLoaded: true,
                        catalog: castDraft(catalog),
                    };
                });
            }),
            openCreateCatalogDialog: () => set((storeState) => {
                storeState.stateV2.createCatalogDialog = {
                    ... emptyCreateCatalogData,
                    isOpen: true,
                };
            }),
            setCreateCatalogDialogData: (name?: string, type?: CatalogType) => set((storeState) => {
                const createCatalogDialog = storeState.stateV2.createCatalogDialog;
                if (!createCatalogDialog) return;

                if (name !== undefined) createCatalogDialog.name = name;
                if (type !== undefined) createCatalogDialog.type = type;
            }),
            setCreateCatalogDialogError: (errorMessage: string | null) => set((storeState) => {
                const createCatalogDialog = storeState.stateV2.createCatalogDialog;
                if (!createCatalogDialog) return;
                createCatalogDialog.errorMessage = errorMessage;
            }),
            closeCreateCatalogDialog: (result: DialogResultOkCancel) => set((storeState) => {
                if (result === 'OK') {
                    const createCatalogDialog = storeState.stateV2.createCatalogDialog;
                    if (!createCatalogDialog) return;
                    createCatalogDialog.isOpen = false;
                } else {
                    storeState.stateV2.createCatalogDialog = null;
                }
            }),
            openBulkAddDialog: () => set((storeState) => {
                storeState.stateV2.bulkAddDialog = {
                    ... emptyBulkAddData,
                    isOpen: true,
                };
            }),
            setBulkAddDialogData: (text?: string) => set((storeState) => {
                const bulkAddDialog = storeState.stateV2.bulkAddDialog;
                if (!bulkAddDialog) return;
                if (text !== undefined) bulkAddDialog.text = text;
            }),
            setBulkAddDialogMetrics: (
                errorMessage: string | null,
                counts: Record<TokenType, number> | null,
                newCount: number,
                duplicateCount: number
            ) => set((storeState) => {
                const bulkAddDialog = storeState.stateV2.bulkAddDialog;
                if (!bulkAddDialog) return;
                bulkAddDialog.errorMessage = errorMessage;
                bulkAddDialog.counts = counts;
                bulkAddDialog.newCount = newCount;
                bulkAddDialog.duplicateCount = duplicateCount;
            }),
            closeBulkAddDialog: (result: DialogResultOkCancel) => set((storeState) => {
                if (result === 'OK') {
                    const bulkAddDialog = storeState.stateV2.bulkAddDialog;
                    if (!bulkAddDialog) return;

                    bulkAddDialog.isOpen = false;
                } else {
                    storeState.stateV2.bulkAddDialog = null;
                }
            }),
            setTokensSearchText: (value: string) => set((storeState) => {
                storeState.stateV2.tokensSearchText = value;
            }),
            setNewSourceData: (url?: string, tokenType?: TokenType, type?: SourceType) => set((storeState) => {
                const newSource = storeState.stateV2.newSource;
                if (!newSource) return;
                if (url !== undefined) newSource.url = url;
                if (tokenType !== undefined) newSource.tokenType = tokenType;
                if (type !== undefined) newSource.type = type;
            }),
            clearNewSourceData: () => set((storeState) => {
                storeState.stateV2.newSource = emptyNewSource;
            }),
            setNewTokenKey: (value: string) => set((storeState) => {
                storeState.stateV2.newTokenKey = value;
            }),
            setNewSemanticTokenSelectorText: (value: string) => set((storeState) => {
                storeState.stateV2.newSemanticTokenSelectorText = value;
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
