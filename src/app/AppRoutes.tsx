import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ComparisonScreen } from '../modules/comparison/ComparisonScreen';
import { useComparisonFlow } from '../modules/comparison/useComparisonFlow';
import { filmCatalogs, filmItemsByCatalogId } from '../modules/content/filmSource';
import { RankingPage } from '../modules/ranking/RankingPage';
import { DevDatabaseTransfer } from './DevDatabaseTransfer';
import { isLocalDevOrigin } from './devDatabaseTransferProtocol';

export function AppRoutes() {
  const flows = {
    default: useComparisonFlow(filmItemsByCatalogId.default),
    action: useComparisonFlow(filmItemsByCatalogId.action),
    comedy: useComparisonFlow(filmItemsByCatalogId.comedy),
  };
  const showDevDatabaseTransfer = import.meta.env.DEV && isLocalDevOrigin(window.location.origin);

  return (
    <HashRouter>
      <Routes>
        {filmCatalogs.map((catalog) => (
          <Route
            key={catalog.comparisonPath}
            path={catalog.comparisonPath}
            element={<ComparisonScreen flow={flows[catalog.id]} catalog={catalog} />}
          />
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
