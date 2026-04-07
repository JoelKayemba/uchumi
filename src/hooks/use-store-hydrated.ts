import { useEffect, useState } from 'react';

import { useAppStore } from '@/src/store/use-app-store';

/**
 * Attend la fin de l’hydratation Zustand (persist AsyncStorage) avant de router.
 */
export function useStoreHydrated(): boolean {
  const [hydrated, setHydrated] = useState(() => useAppStore.persist.hasHydrated());

  useEffect(() => {
    if (useAppStore.persist.hasHydrated()) {
      setHydrated(true);
      return;
    }
    const unsub = useAppStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });
    return unsub;
  }, []);

  return hydrated;
}
