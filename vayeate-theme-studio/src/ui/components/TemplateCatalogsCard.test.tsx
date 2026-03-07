import { render, screen } from '@testing-library/react';
import { TemplateCatalogsCard } from './TemplateCatalogsCard';
import type { CatalogReference } from '../../model/schemas';

function renderCard(props: {
  catalogNames?: string[];
  catalogVersionsByName?: Record<string, CatalogReference[]>;
  includedCatalogMap?: Map<string, string>;
  isLatestVersion?: boolean;
  includedCatalogNamesWithUpdates?: string[];
  onToggleCatalog?: (name: string, include: boolean) => void;
  onChangeCatalogVersion?: (name: string, version: string) => void;
  onUpdateAll?: () => void;
}) {
  const defaultCatalogVersionsByName: Record<string, CatalogReference[]> = {
    'cat-a': [
      { name: 'cat-a', version: '1.0.1' },
      { name: 'cat-a', version: '1.0.0' },
    ],
  };
  const defaultIncludedCatalogMap = new Map<string, string>([['cat-a', '1.0.0']]);
  render(
    <TemplateCatalogsCard
      catalogNames={props.catalogNames ?? ['cat-a']}
      catalogVersionsByName={props.catalogVersionsByName ?? defaultCatalogVersionsByName}
      includedCatalogMap={props.includedCatalogMap ?? defaultIncludedCatalogMap}
      isLatestVersion={props.isLatestVersion ?? true}
      includedCatalogNamesWithUpdates={props.includedCatalogNamesWithUpdates ?? ['cat-a']}
      onToggleCatalog={props.onToggleCatalog ?? (() => {})}
      onChangeCatalogVersion={props.onChangeCatalogVersion ?? (() => {})}
      onUpdateAll={props.onUpdateAll ?? (() => {})}
    />,
  );
}

describe('TemplateCatalogsCard', () => {
  it('shows Update All button when isLatestVersion and includedCatalogNamesWithUpdates has items', () => {
    renderCard({ isLatestVersion: true, includedCatalogNamesWithUpdates: ['cat-a'] });
    expect(screen.getByRole('button', { name: /update all/i })).toBeInTheDocument();
  });

  it('hides Update All button when includedCatalogNamesWithUpdates is empty', () => {
    renderCard({ isLatestVersion: true, includedCatalogNamesWithUpdates: [] });
    expect(screen.queryByRole('button', { name: /update all/i })).not.toBeInTheDocument();
  });

  it('shows update icon next to catalog name when catalog has update available', () => {
    renderCard({
      isLatestVersion: true,
      includedCatalogNamesWithUpdates: ['cat-a'],
      includedCatalogMap: new Map([['cat-a', '1.0.0']]),
    });
    const icon = document.querySelector('.catalog-update-icon');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('title', 'Update available');
  });

  it('hides update icon when catalog not in includedCatalogNamesWithUpdates', () => {
    renderCard({
      isLatestVersion: true,
      includedCatalogNamesWithUpdates: [],
      includedCatalogMap: new Map([['cat-a', '1.0.0']]),
    });
    expect(document.querySelector('.catalog-update-icon')).not.toBeInTheDocument();
  });
});
