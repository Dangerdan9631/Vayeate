import { useEffect, useState } from 'react';
import type { TabId } from '../../../model/app-ui';
import { CatalogsPage } from '../../catalog/catalog-page/CatalogsPage';
import { TemplatesPage } from '../../template/template-page/TemplatesPage';
import { ThemesPage } from '../../theme/theme-page/ThemesPage';

interface ContentAreaProps {
  activeTab: TabId;
}

export function ContentArea({ activeTab }: ContentAreaProps) {

  const [templatesOpened, setTemplatesOpened] = useState(false);
  const [themesOpened, setThemesOpened] = useState(false);

  useEffect(() => {
    if (activeTab === 'templates') {
      setTemplatesOpened(true);
    }
    if (activeTab === 'themes') {
      setThemesOpened(true);
    }
  }, [activeTab]);

  return (
    <>
      <div
        className="content-area-panel"
        data-active={activeTab === 'catalogs'}
        aria-hidden={activeTab !== 'catalogs'}
      >
        <CatalogsPage />
      </div>
      {templatesOpened && (
        <div
          className="content-area-panel"
          data-active={activeTab === 'templates'}
          aria-hidden={activeTab !== 'templates'}
        >
          <TemplatesPage />
        </div>
      )}
      {themesOpened && (
        <div
          className="content-area-panel"
          data-active={activeTab === 'themes'}
          aria-hidden={activeTab !== 'themes'}
        >
          <ThemesPage />
        </div>
      )}
    </>
  );
}
