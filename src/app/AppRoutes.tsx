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

type CatalogRoutesProps = {
  catalog: FilmCatalog;
};

function CatalogRoutes({ catalog }: CatalogRoutesProps) {
  const items = filmItemsByCatalogId[catalog.id];
  const flow = useComparisonFlow(items);

  return (
    <>
      <Route path={catalog.comparisonPath} element={<ComparisonScreen flow={flow} catalog={catalog} />} />
      <Route path={catalog.rankingPath} element={<RankingPage catalog={catalog} />} />
    </>
  );
}

export function AppRoutes() {
  const showDevDatabaseTransfer = import.meta.env.DEV && isLocalDevOrigin(window.location.origin);

  return (
    <HashRouter>
      <Routes>
        <CatalogRoutes catalog={defaultFilmCatalog} />
        <CatalogRoutes catalog={actionFilmCatalog} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {showDevDatabaseTransfer ? <DevDatabaseTransfer /> : null}
    </HashRouter>
  );
}
