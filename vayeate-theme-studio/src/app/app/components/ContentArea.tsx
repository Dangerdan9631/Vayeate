import { useEffect, useState } from 'react';
import type { TabId } from '../../../model/tab-id';
import { CatalogsPage } from '../../catalog/components/CatalogsPage';
import { TemplatesPage } from '../../template/components/TemplatesPage';
import { ThemesPage } from '../../theme/components/ThemesPage';

interface ContentAreaProps {
  activeTab: TabId;
}

export function ContentArea({ activeTab }: ContentAreaProps) {

  const [templatesOpened, setTemplatesOpened] = useState(false);
  const [themesOpened, setThemesOpened] = useState(false);

  // update templatesOpened and themesOpened when activeTab changes
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
