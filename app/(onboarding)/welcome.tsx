import { useRouter } from 'expo-router';

import { OnboardingCarousel } from '@/src/components/onboarding/onboarding-carousel';
import { ONBOARDING_SLIDES } from '@/src/constants/onboarding-slides';

export default function WelcomeScreen() {
  const router = useRouter();

  const goModeChoice = () => {
    router.replace('/mode-choice');
  };

  return (
    <OnboardingCarousel
      slides={ONBOARDING_SLIDES}
      onSkip={goModeChoice}
      onComplete={goModeChoice}
    />
  );
}
