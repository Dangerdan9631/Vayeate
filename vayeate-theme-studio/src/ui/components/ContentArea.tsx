import type { TabId } from '../tabs';
import { CatalogsPage } from '../pages/CatalogsPage';
import { TemplatesPage } from '../pages/TemplatesPage';
import { ThemesPage } from '../pages/ThemesPage';

interface ContentAreaProps {
  activeTab: TabId;
}

export function ContentArea({ activeTab }: ContentAreaProps) {
  return (
    <>
      <div
        className="content-area-panel"
        data-active={activeTab === 'catalogs'}
        aria-hidden={activeTab !== 'catalogs'}
      >
        <CatalogsPage />
      </div>
      <div
        className="content-area-panel"
        data-active={activeTab === 'templates'}
        aria-hidden={activeTab !== 'templates'}
      >
        <TemplatesPage />
      </div>
      <div
        className="content-area-panel"
        data-active={activeTab === 'themes'}
        aria-hidden={activeTab !== 'themes'}
      >
        <ThemesPage />
      </div>
    </>
  );
}
