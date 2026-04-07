import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { UchumiScreen } from '@/src/components/uchumi-screen';
import { MARKET_INDEX_SYMBOLS } from '@/src/constants/market-indices';
import {
  isValidMarketSymbol,
  normalizeMarketSymbol,
} from '@/src/lib/market-symbol';
import {
  fetchMarketQuotes,
  type MarketQuote,
} from '@/src/services/market-quotes';
import { useAppStore } from '@/src/store/use-app-store';
import { colors } from '@/src/theme';
import { spacing } from '@/src/theme/spacing';

function formatPrice(price: number, currency: string): string {
  const c = currency.length === 3 ? currency : 'USD';
  try {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: c,
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }).format(price);
  } catch {
    return `${price.toFixed(2)} ${currency}`;
  }
}

function QuoteRow({
  label,
  quote,
  error,
  onRemove,
  removable,
}: {
  label?: string;
  quote: MarketQuote | null;
  error?: string;
  onRemove?: () => void;
  removable?: boolean;
}) {
  const up = quote ? quote.change >= 0 : false;
  return (
    <View style={styles.quoteCard}>
      <View style={styles.quoteLeft}>
        <Text style={styles.quoteName} numberOfLines={1}>
          {label ?? quote?.shortName ?? '—'}
        </Text>
        <Text style={styles.quoteSym} numberOfLines={1}>
          {quote?.symbol ?? ''}
        </Text>
        {error ? <Text style={styles.quoteErr}>{error}</Text> : null}
      </View>
      {quote ? (
        <View style={styles.quoteRight}>
          <Text style={styles.quotePrice}>{formatPrice(quote.price, quote.currency)}</Text>
          <Text style={[styles.quoteChg, up ? styles.up : styles.down]}>
            {up ? '+' : ''}
            {quote.changePercent.toFixed(2)}%
          </Text>
        </View>
      ) : !error ? (
        <ActivityIndicator color={colors.accent} />
      ) : null}
      {removable && onRemove ? (
        <Pressable onPress={onRemove} style={({ pressed }) => [styles.trash, pressed && styles.pressed]}>
          <Ionicons name="close-circle" size={22} color={colors.textMuted} />
        </Pressable>
      ) : null}
    </View>
  );
}

export default function MarketsScreen() {
  const insets = useSafeAreaInsets();
  const watchlist = useAppStore((s) => s.marketWatchlist);
  const addSymbol = useAppStore((s) => s.addMarketWatchSymbol);
  const removeSymbol = useAppStore((s) => s.removeMarketWatchSymbol);

  const [indexQuotes, setIndexQuotes] = useState<
    { symbol: string; label: string; quote: MarketQuote | null; error?: string }[]
  >([]);
  const [watchQuotes, setWatchQuotes] = useState<
    { symbol: string; quote: MarketQuote | null; error?: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [draftSymbol, setDraftSymbol] = useState('');

  const load = useCallback(async () => {
    const indexSyms = MARKET_INDEX_SYMBOLS.map((x) => x.symbol);
    const idxRes = await fetchMarketQuotes(indexSyms);
    setIndexQuotes(
      MARKET_INDEX_SYMBOLS.map((row) => {
        const found = idxRes.find((r) => r.symbol === row.symbol);
        return {
          symbol: row.symbol,
          label: row.label,
          quote: found?.quote ?? null,
          error: found?.error,
        };
      })
    );

    const wl = useAppStore.getState().marketWatchlist;
    const wRes = await fetchMarketQuotes(wl);
    setWatchQuotes(
      wl.map((sym) => {
        const found = wRes.find((r) => r.symbol === sym);
        return {
          symbol: sym,
          quote: found?.quote ?? null,
          error: found?.error,
        };
      })
    );
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        await load();
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [load, watchlist]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  }, [load]);

  const submitAdd = () => {
    const raw = draftSymbol.trim();
    if (!raw) return;
    const n = normalizeMarketSymbol(raw);
    if (!isValidMarketSymbol(n)) {
      Alert.alert(
        'Symbole invalide',
        'Utilisez des lettres, chiffres et symboles autorisés (ex. AAPL, ^FCHI, EURUSD=X, BRK.B).'
      );
      return;
    }
    const ok = addSymbol(n);
    if (!ok) {
      Alert.alert(
        'Impossible d’ajouter',
        'Ce symbole est déjà dans la liste ou la limite de 20 titres est atteinte.'
      );
      return;
    }
    setDraftSymbol('');
    setModalOpen(false);
  };

  return (
    <UchumiScreen style={styles.wrap}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + 88 },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
          />
        }
        showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={['#2d3540', '#1a1e24']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}>
          <View style={styles.heroIcon}>
            <Ionicons name="pulse" size={28} color={colors.textPrimary} />
          </View>
          <Text style={styles.title}>Marchés</Text>
          <Text style={styles.sub}>
            Indices et liste de suivi (Yahoo Finance). Données indicatives, souvent différées — pas
            un conseil en investissement.
          </Text>
        </LinearGradient>

        {loading && indexQuotes.length === 0 ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={styles.loaderText}>Chargement des cotations…</Text>
          </View>
        ) : null}

        <Text style={styles.section}>Indices & matières</Text>
        <View style={styles.block}>
          {indexQuotes.map((row) => (
            <QuoteRow
              key={row.symbol}
              label={row.label}
              quote={row.quote}
              error={row.error}
            />
          ))}
        </View>

        <View style={styles.watchHeader}>
          <Text style={styles.section}>Ma liste</Text>
          <Pressable
            onPress={() => setModalOpen(true)}
            style={({ pressed }) => [styles.addBtn, pressed && styles.pressed]}>
            <Ionicons name="add" size={22} color={colors.textPrimary} />
          </Pressable>
        </View>
        <Text style={styles.hint}>
          Symboles Yahoo : AAPL, MSFT, EURUSD=X, ^FCHI… (max. 20 titres)
        </Text>

        <View style={styles.block}>
          {watchlist.length === 0 ? (
            <Text style={styles.empty}>Aucun symbole — touchez + pour en ajouter.</Text>
          ) : (
            watchQuotes.map((row) => (
              <QuoteRow
                key={row.symbol}
                quote={row.quote}
                error={row.error}
                removable
                onRemove={() => removeSymbol(row.symbol)}
              />
            ))
          )}
        </View>
      </ScrollView>

      <Modal
        visible={modalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setModalOpen(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setModalOpen(false)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Ajouter un symbole</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Ex. NVDA, EURUSD=X"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="characters"
              value={draftSymbol}
              onChangeText={setDraftSymbol}
              onSubmitEditing={submitAdd}
            />
            <View style={styles.modalActions}>
              <Pressable onPress={() => setModalOpen(false)}>
                <Text style={styles.modalCancel}>Annuler</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  if (!draftSymbol.trim()) {
                    Alert.alert('Symbole', 'Saisissez un symbole (ex. AAPL).');
                    return;
                  }
                  submitAdd();
                }}
                style={({ pressed }) => [styles.modalOk, pressed && styles.pressed]}>
                <Text style={styles.modalOkText}>Ajouter</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </UchumiScreen>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    paddingTop: spacing.md,
  },
  scroll: {
    gap: spacing.md,
  },
  hero: {
    borderRadius: 22,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: spacing.xs,
  },
  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.4,
  },
  sub: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 19,
    color: 'rgba(244,241,238,0.65)',
  },
  loader: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  loaderText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  section: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  block: {
    gap: spacing.sm,
  },
  quoteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dune,
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    gap: spacing.sm,
  },
  quoteLeft: {
    flex: 1,
    minWidth: 0,
  },
  quoteName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  quoteSym: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },
  quoteErr: {
    fontSize: 11,
    color: colors.danger,
    marginTop: 4,
  },
  quoteRight: {
    alignItems: 'flex-end',
  },
  quotePrice: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  quoteChg: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },
  up: {
    color: colors.success,
  },
  down: {
    color: colors.danger,
  },
  trash: {
    padding: 4,
  },
  pressed: {
    opacity: 0.85,
  },
  watchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.dune,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.fuscousGray,
  },
  hint: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 17,
    marginTop: -spacing.xs,
  },
  empty: {
    color: colors.textMuted,
    fontSize: 14,
    fontStyle: 'italic',
    paddingVertical: spacing.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    backgroundColor: colors.dune,
    borderRadius: 20,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.fuscousGray,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  modalInput: {
    backgroundColor: colors.marshland,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.fuscousGray,
    color: colors.textPrimary,
    fontSize: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    marginBottom: spacing.lg,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: spacing.lg,
  },
  modalCancel: {
    color: colors.textMuted,
    fontSize: 16,
    fontWeight: '600',
  },
  modalOk: {
    backgroundColor: colors.fuscousGray,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
  },
  modalOkText: {
    color: colors.textPrimary,
    fontWeight: '800',
    fontSize: 16,
  },
});
