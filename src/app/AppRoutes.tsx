import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ComparisonScreen } from '../modules/comparison/ComparisonScreen';
import { useComparisonFlow } from '../modules/comparison/useComparisonFlow';
import { filmCatalogs, filmItemsByCatalogId, type FilmCatalog } from '../modules/content/filmSource';
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
        {filmCatalogs.map((catalog) => (
          <Route key={catalog.comparisonPath} path={catalog.comparisonPath} element={<ComparisonPage catalog={catalog} />} />
        ))}
        {filmCatalogs.map((catalog) => (
          <Route key={catalog.rankingPath} path={catalog.rankingPath} element={<RankingPage catalog={catalog} />} />
        ))}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {showDevDatabaseTransfer ? <DevDatabaseTransfer /> : null}
    </HashRouter>
  );
}
