import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ComparisonScreen } from '../modules/comparison/ComparisonScreen';
import { useComparisonFlow } from '../modules/comparison/useComparisonFlow';
import { RankingPage } from '../modules/ranking/RankingPage';
import { DevDatabaseTransfer } from './DevDatabaseTransfer';
import { isLocalDevOrigin } from './devDatabaseTransferProtocol';

export function AppRoutes() {
  const flow = useComparisonFlow();
  const showDevDatabaseTransfer = import.meta.env.DEV && isLocalDevOrigin(window.location.origin);

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<ComparisonScreen flow={flow} />} />
        <Route path="/ranking" element={<RankingPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {showDevDatabaseTransfer ? <DevDatabaseTransfer /> : null}
    </HashRouter>
  );
}
