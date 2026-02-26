import type { TabId } from '../tabs';
import { CatalogsPage } from '../pages/CatalogsPage';
import { TemplatesPage } from '../pages/TemplatesPage';
import { ThemesPage } from '../pages/ThemesPage';

interface ContentAreaProps {
  activeTab: TabId;
}

export function ContentArea({ activeTab }: ContentAreaProps) {
  switch (activeTab) {
    case 'catalogs':
      return <CatalogsPage />;
    case 'templates':
      return <TemplatesPage />;
    case 'themes':
      return <ThemesPage />;
    default:
      return <CatalogsPage />;
  }
}
