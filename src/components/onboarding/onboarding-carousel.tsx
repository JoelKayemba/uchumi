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

/** Part de l’écran pour la fenêtre visible (bande centrale sur l’image). */
const HERO_VISIBLE_MIN = 300;
const HERO_VISIBLE_MAX = 540;
const HERO_VISIBLE_RATIO = 0.58;

/**
 * Hauteur du bloc image / hauteur visible ≈ 2 → on ne voit qu’environ la moitié verticale,
 * centrée (haut & bas rognés pareil).
 */
const HERO_VERTICAL_SCALE = 2.05;

/** Largeur du visuel par rapport à l’écran (dépassement latéral rogné au centre). */
const HERO_WIDTH_RATIO = 1.32;

export function OnboardingCarousel({ slides, onSkip, onComplete }: Props) {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<OnboardingSlide>>(null);
  const [index, setIndex] = useState(0);
  const [listHeight, setListHeight] = useState(windowHeight * 0.62);

  const slideWidth = windowWidth;
  const heroVisibleHeight = Math.round(
    Math.max(
      HERO_VISIBLE_MIN,
      Math.min(windowHeight * HERO_VISIBLE_RATIO, HERO_VISIBLE_MAX)
    )
  );
  const heroImageHeight = Math.round(heroVisibleHeight * HERO_VERTICAL_SCALE);
  const heroImageWidth = Math.round(slideWidth * HERO_WIDTH_RATIO);

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
      <View style={[styles.slide, { width: slideWidth, height: listHeight }]}>
        <View style={[styles.heroClip, { height: heroVisibleHeight }]}>
          <View
            style={[
              styles.heroImageInner,
              {
                width: heroImageWidth,
                height: heroImageHeight,
              },
            ]}>
            <Image
              source={item.image}
              style={styles.heroImage}
              contentFit="cover"
              transition={200}
              accessibilityLabel={item.title}
            />
          </View>

          {/* Brouillard haut : fusion avec le fond clair / status bar */}
          <LinearGradient
            pointerEvents="none"
            colors={[
              '#FFFFFF',
              'rgba(255,255,255,0.88)',
              'rgba(255,255,255,0.35)',
              'transparent',
            ]}
            locations={[0, 0.25, 0.55, 1]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.fogTop}
          />
          {/* Brouillard bas : transition vers le texte / lavande */}
          <LinearGradient
            pointerEvents="none"
            colors={[
              'transparent',
              'rgba(255,255,255,0.45)',
              'rgba(245,243,250,0.92)',
              colors.marshland,
            ]}
            locations={[0, 0.35, 0.72, 1]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.fogBottom}
          />
        </View>

        <View style={styles.slideLower}>
          <View style={styles.textBlock}>
            <Text style={styles.slideTitle}>{item.title}</Text>
            <Text style={styles.slideBody}>{item.body}</Text>
          </View>
        </View>
      </View>
    ),
    [heroImageHeight, heroImageWidth, heroVisibleHeight, listHeight, slideWidth]
  );

  const isLast = index === slides.length - 1;

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#FFFFFF', colors.marshland]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.55 }}
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

      <View
        style={styles.listWrap}
        onLayout={(e) => setListHeight(e.nativeEvent.layout.height)}>
        <FlatList
          ref={listRef}
          data={slides}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onScrollEnd}
          style={styles.list}
          getItemLayout={(_, i) => ({
            length: slideWidth,
            offset: slideWidth * i,
            index: i,
          })}
          initialNumToRender={slides.length}
        />
      </View>

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
    backgroundColor: colors.dune,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xs,
    zIndex: 2,
  },
  headerSpacer: {
    flex: 1,
  },
  skipBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderWidth: 1,
    borderColor: colors.fuscousGray,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
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
  listWrap: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  slide: {
    alignItems: 'center',
  },
  slideLower: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-start',
    minHeight: 0,
  },
  /**
   * Fenêtre fixe : l’image (plus large + ~2× plus haute) est centrée,
   * donc on voit surtout la moitié centrale, rognée sur les quatre côtés.
   */
  heroClip: {
    width: '100%',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  heroImageInner: {
    zIndex: 1,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  fogTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '42%',
    zIndex: 3,
  },
  fogBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '58%',
    zIndex: 3,
  },
  textBlock: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  slideTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.5,
    lineHeight: 32,
    marginBottom: spacing.sm,
  },
  slideBody: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textMuted,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    gap: spacing.md,
    zIndex: 2,
    backgroundColor: 'transparent',
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
    opacity: 0.45,
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
