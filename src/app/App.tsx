import { useEffect, useState } from 'react';
import { allFilmItems } from '../modules/content/filmSource';
import { initializeRankingStates } from '../modules/persistence/rankingRepository';
import { AppLoading } from './AppLoading';
import { AppRoutes } from './AppRoutes';
import { useProductionDatabaseImport } from './useProductionDatabaseImport';

export function App() {
  const [ready, setReady] = useState(false);

  useProductionDatabaseImport();

  // Prepare IndexedDB from every frozen catalog before screens read user state.
  useEffect(() => {
    let mounted = true;

    void initializeRankingStates(allFilmItems).then(() => {
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

  return <AppRoutes />;
}
