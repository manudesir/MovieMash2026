import { useEffect, useState } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { filmItems } from '../modules/content/filmSource';
import { ComparisonScreen } from '../modules/comparison/ComparisonScreen';
import { initializeRankingStates } from '../modules/persistence/rankingRepository';
import { RankingPage } from '../modules/ranking/RankingPage';
import { AppLoading } from './AppLoading';

export function App() {
  const [ready, setReady] = useState(false);

  // Prepare IndexedDB from the frozen catalog before screens read user state.
  useEffect(() => {
    let mounted = true;

    void initializeRankingStates(filmItems).then(() => {
      if (mounted) {
        setReady(true);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  if (!ready) {
    return <AppLoading />;
  }

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<ComparisonScreen />} />
        <Route path="/ranking" element={<RankingPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
