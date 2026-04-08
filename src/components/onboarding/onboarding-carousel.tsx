import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { useCallback, useRef, useState } from 'react';
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type ListRenderItem,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { OnboardingSlide } from '@/src/constants/onboarding-slides';
import { colors } from '@/src/theme';
import { spacing } from '@/src/theme/spacing';

type Props = {
  slides: OnboardingSlide[];
  onSkip: () => void;
  onComplete: () => void;
};

export function OnboardingCarousel({ slides, onSkip, onComplete }: Props) {
  const { width: windowWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<OnboardingSlide>>(null);
  const [index, setIndex] = useState(0);

  const slideWidth = windowWidth;

  const onScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const x = e.nativeEvent.contentOffset.x;
      const i = Math.round(x / slideWidth);
      setIndex(Math.min(Math.max(i, 0), slides.length - 1));
    },
    [slideWidth, slides.length]
  );

  const goNext = () => {
    if (index >= slides.length - 1) {
      onComplete();
      return;
    }
    const next = index + 1;
    listRef.current?.scrollToOffset({
      offset: next * slideWidth,
      animated: true,
    });
    setIndex(next);
  };

  const renderItem: ListRenderItem<OnboardingSlide> = useCallback(
    ({ item }) => (
      <View style={[styles.slide, { width: slideWidth }]}>
        <View style={styles.imageCard}>
          <Image
            source={item.image}
            style={styles.image}
            contentFit="contain"
            transition={200}
            accessibilityLabel={item.title}
          />
        </View>
        <Text style={styles.slideTitle}>{item.title}</Text>
        <Text style={styles.slideBody}>{item.body}</Text>
      </View>
    ),
    [slideWidth]
  );

  const isLast = index === slides.length - 1;

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.marshland, colors.lavenderCard]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View
        style={[
          styles.header,
          { paddingTop: Math.max(insets.top, spacing.sm) },
        ]}>
        <View style={styles.headerSpacer} />
        <Pressable
          onPress={onSkip}
          hitSlop={12}
          style={({ pressed }) => [styles.skipBtn, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Passer l’introduction">
          <Text style={styles.skipLabel}>Passer</Text>
        </Pressable>
      </View>

      <FlatList
        ref={listRef}
        data={slides}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
        getItemLayout={(_, i) => ({
          length: slideWidth,
          offset: slideWidth * i,
          index: i,
        })}
        initialNumToRender={slides.length}
      />

      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, spacing.md) },
        ]}>
        <View style={styles.dots}>
          {slides.map((s, i) => (
            <View
              key={s.id}
              style={[
                styles.dot,
                i === index ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>

        <Pressable
          onPress={goNext}
          style={({ pressed }) => [styles.ctaWrap, pressed && styles.pressed]}>
          <LinearGradient
            colors={[colors.subscriptionPurple, colors.subscriptionPurpleLight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cta}>
            <Text style={styles.ctaLabel}>
              {isLast ? 'Continuer' : 'Suivant'}
            </Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.marshland,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    zIndex: 2,
  },
  headerSpacer: {
    flex: 1,
  },
  skipBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.65)',
    borderWidth: 1,
    borderColor: colors.fuscousGray,
  },
  skipLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },
  slide: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    alignItems: 'center',
  },
  imageCard: {
    width: '100%',
    maxWidth: 360,
    aspectRatio: 1.05,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: colors.dune,
    borderWidth: 1,
    borderColor: colors.fuscousGray,
    marginBottom: spacing.lg,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  image: {
    width: '100%',
    height: '100%',
  },
  slideTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.4,
    marginBottom: spacing.sm,
  },
  slideBody: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 340,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    zIndex: 2,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 28,
    backgroundColor: colors.subscriptionPurple,
  },
  dotInactive: {
    width: 8,
    backgroundColor: colors.naturalGray,
    opacity: 0.5,
  },
  ctaWrap: {
    borderRadius: 18,
    overflow: 'hidden',
    alignSelf: 'stretch',
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  ctaLabel: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
});
