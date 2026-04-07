import * as LocalAuthentication from 'expo-local-authentication';
import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import {
  AppState,
  type AppStateStatus,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useAppStore } from '@/src/store/use-app-store';
import { colors } from '@/src/theme';
import { spacing } from '@/src/theme/spacing';

type AppLockGateProps = {
  children: ReactNode;
};

export function AppLockGate({ children }: AppLockGateProps) {
  const appLockEnabled = useAppStore((s) => s.appLockEnabled);
  const [blocked, setBlocked] = useState(false);
  const backgrounded = useRef(false);

  const authenticate = useCallback(async (): Promise<boolean> => {
    const has = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    if (!has || !enrolled) return true;
    const r = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Déverrouiller UCHUMI',
      cancelLabel: 'Annuler',
    });
    return r.success === true;
  }, []);

  useEffect(() => {
    if (!appLockEnabled) {
      setBlocked(false);
    }
  }, [appLockEnabled]);

  useEffect(() => {
    const onChange = (next: AppStateStatus) => {
      if (next === 'background' || next === 'inactive') {
        if (appLockEnabled) backgrounded.current = true;
      }
      if (next === 'active' && appLockEnabled && backgrounded.current) {
        backgrounded.current = false;
        void (async () => {
          const ok = await authenticate();
          if (!ok) setBlocked(true);
          else setBlocked(false);
        })();
      }
    };
    const sub = AppState.addEventListener('change', onChange);
    return () => sub.remove();
  }, [appLockEnabled, authenticate]);

  const onManualUnlock = () => {
    void (async () => {
      const ok = await authenticate();
      if (ok) setBlocked(false);
    })();
  };

  if (!appLockEnabled) {
    return <>{children}</>;
  }

  if (blocked) {
    return (
      <View style={styles.overlay}>
        <Text style={styles.title}>UCHUMI</Text>
        <Text style={styles.sub}>Application verrouillée</Text>
        <Pressable
          onPress={onManualUnlock}
          style={({ pressed }) => [styles.btn, pressed && styles.pressed]}>
          <Text style={styles.btnLabel}>Déverrouiller</Text>
        </Pressable>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.marshland,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    zIndex: 9999,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: 4,
  },
  sub: {
    marginTop: spacing.md,
    fontSize: 16,
    color: colors.textMuted,
  },
  btn: {
    marginTop: spacing.xl,
    backgroundColor: colors.dune,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.fuscousGray,
  },
  pressed: {
    opacity: 0.88,
  },
  btnLabel: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '800',
  },
});
