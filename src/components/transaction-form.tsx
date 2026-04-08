import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/src/components/screen-header';
import {
  currencyOptionToIso,
  getSortedCurrencyOptions,
  type CurrencyOptionId,
} from '@/src/constants/currencies';
import { useAppStore } from '@/src/store/use-app-store';
import type { TransactionKind } from '@/src/types/transaction';
import { finShell } from '@/src/theme/fin-shell';
import { spacing } from '@/src/theme/spacing';

const KINDS: { kind: TransactionKind; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { kind: 'income', label: 'Entrée', icon: 'trending-up' },
  { kind: 'expense', label: 'Dépense', icon: 'trending-down' },
  { kind: 'savings', label: 'Épargne', icon: 'albums' },
];

const KIND_BORDER: Record<TransactionKind, string> = {
  income: finShell.green,
  expense: finShell.orange,
  savings: finShell.purple,
};

const KIND_BG: Record<TransactionKind, string> = {
  income: 'rgba(0,200,83,0.12)',
  expense: 'rgba(255,109,0,0.1)',
  savings: 'rgba(138,112,245,0.14)',
};

/**
 * Ne garde que chiffres et séparateurs (ignore espaces invisibles, symboles €, etc.).
 * Compatible tous moteurs JS (pas de \\p{} Unicode).
 */
function sanitizeAmountChars(text: string): string {
  let out = '';
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if ((c >= '0' && c <= '9') || c === ',' || c === '.') {
      out += c;
    }
  }
  return out;
}

/**
 * Interprète un montant (formats FR/US, virgule ou point décimal).
 */
export function parseAmount(text: string): number | null {
  const raw = text.trim();
  if (raw === '') return null;

  let s = sanitizeAmountChars(raw);
  if (s === '') return null;

  const lastComma = s.lastIndexOf(',');
  const lastDot = s.lastIndexOf('.');

  if (lastComma !== -1 && lastDot !== -1) {
    if (lastComma > lastDot) {
      s = s.replace(/\./g, '').replace(',', '.');
    } else {
      s = s.replace(/,/g, '');
    }
  } else if (lastComma !== -1) {
    const parts = s.split(',');
    if (parts.length === 2 && parts[1].length > 0) {
      s = parts[0].replace(/\./g, '') + '.' + parts[1];
    } else {
      s = s.replace(/,/g, '');
    }
  } else if (lastDot !== -1) {
    const parts = s.split('.');
    if (parts.length === 2 && parts[1].length > 0) {
      s = parts[0].replace(/,/g, '') + '.' + parts[1];
    } else {
      s = s.replace(/\./g, '');
    }
  }

  const n = Number(s);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

export function parseTagsLine(line: string): string[] {
  return line
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 12);
}

export type TransactionFormValues = {
  kind: TransactionKind;
  amount: number;
  isoCurrency: string;
  label: string;
  categoryId: string | null;
  tags: string[];
  note: string;
  attachmentUri: string | null;
};

type TransactionFormProps = {
  submitLabel: string;
  initialKind?: TransactionKind;
  initialAmount?: number;
  initialLabel?: string;
  initialCategoryId?: string | null;
  initialIsoCurrency?: string;
  initialTags?: string[];
  initialNote?: string;
  initialAttachmentUri?: string | null;
  onSubmit: (values: TransactionFormValues) => void | Promise<void>;
  /** Titre + bouton retour (navigation sans header natif). */
  headerTitle?: string;
};

const currencyChips = getSortedCurrencyOptions();

export function TransactionForm({
  submitLabel,
  initialKind = 'expense',
  initialAmount,
  initialLabel = '',
  initialCategoryId,
  initialIsoCurrency,
  initialTags = [],
  initialNote = '',
  initialAttachmentUri = null,
  onSubmit,
  headerTitle,
}: TransactionFormProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const categories = useAppStore((s) => s.categories);
  const displayCurrency = useAppStore((s) => s.currency as CurrencyOptionId);

  const [kind, setKind] = useState<TransactionKind>(initialKind);
  const [amountText, setAmountText] = useState(
    initialAmount !== undefined ? String(initialAmount) : ''
  );
  const [label, setLabel] = useState(initialLabel);
  const [categoryId, setCategoryId] = useState<string | null>(
    initialCategoryId !== undefined
      ? initialCategoryId
      : (categories[0]?.id ?? null)
  );
  const [isoCurrency, setIsoCurrency] = useState(
    () => initialIsoCurrency ?? currencyOptionToIso(displayCurrency)
  );
  const [tagsLine, setTagsLine] = useState(initialTags.join(', '));
  const [note, setNote] = useState(initialNote);
  const [attachmentUri, setAttachmentUri] = useState<string | null>(
    initialAttachmentUri
  );
  const [saving, setSaving] = useState(false);

  const amount = parseAmount(amountText);
  const amountLooksInvalid =
    amountText.trim() !== '' && amount === null && !saving;
  const canSave = amount !== null && !saving;

  const pickImage = async () => {
    const { status } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission',
        'Autorisez l’accès aux photos pour joindre un ticket (stockage local uniquement).'
      );
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.75,
    });
    if (!res.canceled && res.assets[0]) {
      setAttachmentUri(res.assets[0].uri);
    }
  };

  const save = async () => {
    const parsed = parseAmount(amountText);
    if (parsed === null) {
      Alert.alert(
        'Montant requis',
        'Saisissez un montant en haut de l’écran (nombre supérieur à 0). Les lettres et symboles sont ignorés automatiquement.'
      );
      return;
    }
    setSaving(true);
    try {
      await Promise.resolve(
        onSubmit({
          kind,
          amount: parsed,
          isoCurrency: isoCurrency.toUpperCase(),
          label:
            label.trim() ||
            (KINDS.find((k) => k.kind === kind)?.label ?? ''),
          categoryId,
          tags: parseTagsLine(tagsLine),
          note: note.trim(),
          attachmentUri,
        })
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.flex} edges={['top', 'left', 'right']}>
      <View style={styles.layout}>
          {headerTitle ? (
            <ScreenHeader title={headerTitle} onBack={() => router.back()} />
          ) : null}
          <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          style={styles.scrollFlex}
          showsVerticalScrollIndicator={false}>
          <LinearGradient
            colors={['#FFFFFF', finShell.page]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}>
            <View style={styles.heroTab} />
            <Text style={styles.heroKicker}>Montant</Text>
            <Text style={styles.heroHintTop}>
              Saisie libre : chiffres, virgule ou point pour les centimes.
            </Text>
            <View style={styles.amountRow}>
              <TextInput
                style={styles.amountInput}
                placeholder="0"
                placeholderTextColor={finShell.muted}
                keyboardType={
                  Platform.OS === 'ios'
                    ? 'numbers-and-punctuation'
                    : 'decimal-pad'
                }
                value={amountText}
                onChangeText={setAmountText}
                selectTextOnFocus
                autoCorrect={false}
              />
            </View>
            {amount !== null ? (
              <Text style={styles.amountOk}>
                Montant valide · {amount.toLocaleString('fr-FR', {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                })}
              </Text>
            ) : null}
            {amountLooksInvalid ? (
              <Text style={styles.amountError}>
                Montant non reconnu. Exemples : 1500, 12,50 ou 1 234,00
              </Text>
            ) : null}
          </LinearGradient>

        <Text style={styles.section}>Type de mouvement</Text>
        <View style={styles.kindRow}>
          {KINDS.map(({ kind: k, label: l, icon }) => (
            <Pressable
              key={k}
              onPress={() => setKind(k)}
              style={[
                styles.kindChip,
                kind === k && {
                  borderColor: KIND_BORDER[k],
                  backgroundColor: KIND_BG[k],
                },
              ]}>
              <Ionicons
                name={icon}
                size={18}
                color={kind === k ? finShell.ink : finShell.muted}
              />
              <Text
                style={[styles.kindText, kind === k && styles.kindTextActive]}>
                {l}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.section}>Devise du mouvement</Text>
        <View style={styles.currencyWrap}>
          {currencyChips.map((opt) => (
            <Pressable
              key={opt.id}
              onPress={() => setIsoCurrency(opt.iso4217)}
              style={[
                styles.currencyChip,
                isoCurrency.toUpperCase() === opt.iso4217.toUpperCase() &&
                  styles.currencyChipActive,
              ]}>
              <Text
                style={[
                  styles.currencyChipText,
                  isoCurrency.toUpperCase() === opt.iso4217.toUpperCase() &&
                    styles.currencyChipTextActive,
                ]}>
                {opt.icon} {opt.iso4217}
              </Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.currencyHint}>
          Si la devise ≠ devise d’affichage, le taux est récupéré en ligne à l’enregistrement
          (connexion requise).
        </Text>

        <Text style={styles.section}>Libellé</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex. Courses du marché"
          placeholderTextColor={finShell.muted}
          value={label}
          onChangeText={setLabel}
        />

        <Text style={styles.section}>Catégorie</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.catRow}>
            <Pressable
              onPress={() => setCategoryId(null)}
              style={[
                styles.catChip,
                categoryId === null && styles.catChipActive,
              ]}>
              <Text
                style={[
                  styles.catText,
                  categoryId === null && styles.catTextActive,
                ]}>
                Sans
              </Text>
            </Pressable>
            {categories.map((c) => (
              <Pressable
                key={c.id}
                onPress={() => setCategoryId(c.id)}
                style={[
                  styles.catChip,
                  categoryId === c.id && styles.catChipActive,
                ]}>
                <Text
                  style={[
                    styles.catText,
                    categoryId === c.id && styles.catTextActive,
                  ]}>
                  {c.name}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        <Text style={styles.section}>Étiquettes (optionnel)</Text>
        <TextInput
          style={styles.input}
          placeholder="travail, urgent…"
          placeholderTextColor={finShell.muted}
          value={tagsLine}
          onChangeText={setTagsLine}
        />

        <Text style={styles.section}>Note</Text>
        <TextInput
          style={[styles.input, styles.noteInput]}
          placeholder="Détails, contexte…"
          placeholderTextColor={finShell.muted}
          value={note}
          onChangeText={setNote}
          multiline
        />

        <Text style={styles.section}>Pièce jointe (ticket)</Text>
        <View style={styles.attachRow}>
          <Pressable
            onPress={() => void pickImage()}
            style={({ pressed }) => [styles.attachBtn, pressed && styles.pressed]}>
            <Ionicons name="image-outline" size={22} color={finShell.ink} />
            <Text style={styles.attachLabel}>Choisir une photo</Text>
          </Pressable>
          {attachmentUri ? (
            <Pressable onPress={() => setAttachmentUri(null)} style={styles.clearPhoto}>
              <Text style={styles.clearPhotoText}>Retirer</Text>
            </Pressable>
          ) : null}
        </View>
        {attachmentUri ? (
          <Image source={{ uri: attachmentUri }} style={styles.preview} contentFit="cover" />
        ) : null}

          <View style={{ height: spacing.xl * 2 }} />
        </ScrollView>

        <View
          style={[
            styles.footer,
            {
              paddingBottom: Math.max(insets.bottom, 12) + 8,
              paddingTop: spacing.sm,
            },
          ]}>
          <Pressable
            onPress={() => void save()}
            disabled={saving}
            style={({ pressed }) => [
              styles.saveOuter,
              !canSave && !saving && styles.saveMuted,
              saving && styles.saveDisabled,
              pressed && !saving && styles.savePressed,
            ]}>
            <LinearGradient
              colors={
                canSave
                  ? [finShell.purple, '#6B52D8']
                  : ['#D8D8E0', '#C8C8D4']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.save}>
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons
                    name="checkmark-circle"
                    size={22}
                    color={canSave ? '#FFFFFF' : finShell.muted}
                    style={styles.saveIcon}
                  />
                  <Text
                    style={[
                      styles.saveLabel,
                      !canSave && styles.saveLabelMuted,
                    ]}>
                    {submitLabel}
                  </Text>
                </>
              )}
            </LinearGradient>
          </Pressable>
          {!canSave && !saving ? (
            <Text style={styles.footerHint}>
              Indiquez un montant en haut pour activer l’enregistrement, ou touchez le bouton pour
              voir l’aide.
            </Text>
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: finShell.page,
  },
  layout: {
    flex: 1,
  },
  scrollFlex: {
    flex: 1,
  },
  scroll: {
    padding: spacing.md,
    paddingBottom: spacing.md,
  },
  hero: {
    position: 'relative',
    borderRadius: 28,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: finShell.border,
    overflow: 'hidden',
  },
  heroTab: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 6,
    backgroundColor: finShell.purple,
  },
  heroKicker: {
    fontSize: 11,
    fontWeight: '800',
    color: finShell.muted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  heroHintTop: {
    fontSize: 13,
    color: finShell.sub,
    lineHeight: 19,
    marginBottom: spacing.md,
    opacity: 0.95,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountInput: {
    flex: 1,
    fontSize: 42,
    fontWeight: '800',
    color: finShell.ink,
    fontVariant: ['tabular-nums'],
    letterSpacing: -1,
    padding: 0,
    minHeight: 52,
  },
  amountOk: {
    marginTop: spacing.sm,
    fontSize: 14,
    fontWeight: '700',
    color: finShell.green,
  },
  amountError: {
    marginTop: spacing.sm,
    fontSize: 13,
    color: finShell.orange,
    lineHeight: 18,
  },
  section: {
    color: finShell.muted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  kindRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  kindChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 18,
    backgroundColor: finShell.card,
    borderWidth: 1,
    borderColor: finShell.border,
  },
  kindText: {
    color: finShell.muted,
    fontSize: 15,
    fontWeight: '600',
  },
  kindTextActive: {
    color: finShell.ink,
    fontWeight: '800',
  },
  currencyWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  currencyChip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 14,
    backgroundColor: finShell.card,
    borderWidth: 1,
    borderColor: finShell.border,
  },
  currencyChipActive: {
    borderColor: finShell.purple,
    backgroundColor: 'rgba(138,112,245,0.1)',
  },
  currencyChipText: {
    color: finShell.muted,
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  currencyChipTextActive: {
    color: finShell.ink,
  },
  currencyHint: {
    color: finShell.muted,
    fontSize: 12,
    lineHeight: 16,
    marginTop: spacing.xs,
  },
  input: {
    backgroundColor: finShell.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: finShell.border,
    color: finShell.ink,
    fontSize: 17,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === 'ios' ? 14 : 12,
  },
  noteInput: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
  catRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingVertical: 4,
  },
  catChip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 20,
    backgroundColor: finShell.card,
    borderWidth: 1,
    borderColor: finShell.border,
  },
  catChipActive: {
    borderColor: finShell.purple,
    backgroundColor: 'rgba(138,112,245,0.08)',
  },
  catText: {
    color: finShell.sub,
    fontSize: 14,
  },
  catTextActive: {
    color: finShell.ink,
    fontWeight: '700',
  },
  attachRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  attachBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: finShell.card,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: finShell.border,
  },
  attachLabel: {
    color: finShell.ink,
    fontWeight: '700',
    fontSize: 15,
  },
  clearPhoto: {
    padding: spacing.sm,
  },
  clearPhotoText: {
    color: finShell.orange,
    fontWeight: '700',
    fontSize: 14,
  },
  preview: {
    width: '100%',
    height: 160,
    borderRadius: 14,
    marginTop: spacing.sm,
  },
  pressed: {
    opacity: 0.88,
  },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: finShell.border,
    backgroundColor: finShell.page,
    paddingHorizontal: spacing.md,
  },
  footerHint: {
    marginTop: spacing.sm,
    textAlign: 'center',
    fontSize: 12,
    color: finShell.muted,
    lineHeight: 17,
  },
  saveOuter: {
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: finShell.border,
  },
  saveMuted: {
    opacity: 0.92,
  },
  save: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: 16,
    minHeight: 56,
  },
  saveDisabled: {
    opacity: 0.55,
  },
  savePressed: {
    opacity: 0.9,
  },
  saveIcon: {
    marginTop: 1,
  },
  saveLabel: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  saveLabelMuted: {
    color: finShell.sub,
  },
});
