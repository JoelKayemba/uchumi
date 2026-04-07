import { Redirect } from 'expo-router';

import { useStoreHydrated } from '@/src/hooks/use-store-hydrated';
import { useAppStore } from '@/src/store/use-app-store';

export default function Index() {
  const hydrated = useStoreHydrated();
  const hasCompletedOnboarding = useAppStore((s) => s.hasCompletedOnboarding);

  if (!hydrated) {
    return null;
  }

  if (!hasCompletedOnboarding) {
    return <Redirect href="/welcome" />;
  }

  return <Redirect href="/(app)/(tabs)" />;
}
