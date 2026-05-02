import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ComparisonScreen } from '../modules/comparison/ComparisonScreen';
import { useComparisonFlow } from '../modules/comparison/useComparisonFlow';
import {
  actionFilmCatalog,
  defaultFilmCatalog,
  filmItemsByCatalogId,
  type FilmCatalog,
} from '../modules/content/filmSource';
import { RankingPage } from '../modules/ranking/RankingPage';
import { DevDatabaseTransfer } from './DevDatabaseTransfer';
import { isLocalDevOrigin } from './devDatabaseTransferProtocol';

type CatalogPageProps = {
  catalog: FilmCatalog;
};

function ComparisonPage({ catalog }: CatalogPageProps) {
  const items = filmItemsByCatalogId[catalog.id];
  const flow = useComparisonFlow(items);

  return <ComparisonScreen flow={flow} catalog={catalog} />;
}

export function AppRoutes() {
  const showDevDatabaseTransfer = import.meta.env.DEV && isLocalDevOrigin(window.location.origin);

  return (
    <HashRouter>
      <Routes>
        <Route path={defaultFilmCatalog.comparisonPath} element={<ComparisonPage catalog={defaultFilmCatalog} />} />
        <Route path={defaultFilmCatalog.rankingPath} element={<RankingPage catalog={defaultFilmCatalog} />} />
        <Route path={actionFilmCatalog.comparisonPath} element={<ComparisonPage catalog={actionFilmCatalog} />} />
        <Route path={actionFilmCatalog.rankingPath} element={<RankingPage catalog={actionFilmCatalog} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {showDevDatabaseTransfer ? <DevDatabaseTransfer /> : null}
    </HashRouter>
  );
}
