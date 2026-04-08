import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/src/theme';

/** Hauteur de la capsule (icônes + FAB centrés verticalement). */
const FLOAT_HEIGHT = 68;
const FAB_SIZE = 54;
/** Padding intérieur de la capsule (icônes / bords). */
const BAR_INNER_PAD_H = 16;
/** Marge écran autour de la barre. */
const SCREEN_PAD_H = 14;
/** Espace horizontal autour du bouton +. */
const FAB_GAP_H = 14;

function isHiddenRoute(name: string): boolean {
  return name === 'stats' || name === 'portfolio' || name === 'markets';
}

export function UchumiTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const visible = state.routes
    .map((route, idx) => ({ route, idx }))
    .filter(({ route }) => !isHiddenRoute(route.name));

  const onTabPress = (routeIndex: number) => {
    const route = state.routes[routeIndex];
    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });
    if (!event.defaultPrevented) {
      navigation.navigate(route.name, route.params);
    }
  };

  const onFabPress = () => {
    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.push('/transaction/new');
  };

  return (
    <View
      style={[
        styles.outer,
        {
          paddingBottom: Math.max(insets.bottom, 14),
          paddingHorizontal: SCREEN_PAD_H,
        },
      ]}>
      <View style={styles.bar}>
        {visible.slice(0, 2).map(({ route, idx }) => {
          const isFocused = state.index === idx;
          const { options } = descriptors[route.key];
          const color = isFocused ? '#FFFFFF' : 'rgba(255,255,255,0.4)';
          return (
            <PlatformPressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={() => onTabPress(idx)}
              onPressIn={() => {
                if (process.env.EXPO_OS === 'ios') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
              }}
              style={styles.tabSlot}>
              {options.tabBarIcon?.({
                focused: isFocused,
                color,
                size: 26,
              }) ?? (
                <Ionicons name="ellipse" size={24} color={color} />
              )}
            </PlatformPressable>
          );
        })}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Nouveau mouvement"
          onPress={onFabPress}
          style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}>
          <Ionicons name="add" size={28} color={colors.ink} />
        </Pressable>

        {visible.slice(2).map(({ route, idx }) => {
          const isFocused = state.index === idx;
          const { options } = descriptors[route.key];
          const color = isFocused ? '#FFFFFF' : 'rgba(255,255,255,0.4)';
          return (
            <PlatformPressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              onPress={() => onTabPress(idx)}
              onPressIn={() => {
                if (process.env.EXPO_OS === 'ios') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
              }}
              style={styles.tabSlot}>
              {options.tabBarIcon?.({
                focused: isFocused,
                color,
                size: 26,
              }) ?? (
                <Ionicons name="ellipse" size={24} color={color} />
              )}
            </PlatformPressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.ink,
    borderRadius: FLOAT_HEIGHT / 2,
    height: FLOAT_HEIGHT,
    paddingHorizontal: BAR_INNER_PAD_H,
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
      },
      android: {
        elevation: 14,
      },
    }),
  },
  tabSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0,
    paddingHorizontal: 6,
  },
  fab: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    backgroundColor: colors.lime,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: FAB_GAP_H,
    alignSelf: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  fabPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.97 }],
  },
});
