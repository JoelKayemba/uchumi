import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  CURRENCY_OPTIONS,
  currencyOptionToIso,
  type CurrencyOptionId,
} from '@/src/constants/currencies';
import { useAppStore } from '@/src/store/use-app-store';
import type { TransactionKind } from '@/src/types/transaction';
import { colors } from '@/src/theme';
import { spacing } from '@/src/theme/spacing';

const KINDS: { kind: TransactionKind; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { kind: 'income', label: 'Entrée', icon: 'trending-up' },
  { kind: 'expense', label: 'Dépense', icon: 'trending-down' },
  { kind: 'savings', label: 'Épargne', icon: 'albums' },
];

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
};

const currencyChips = [
  ...new Map(CURRENCY_OPTIONS.map((o) => [o.iso4217, o])).values(),
];

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
}: TransactionFormProps) {
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
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 72 : 0}>
      <View style={styles.layout}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          style={styles.scrollFlex}
          showsVerticalScrollIndicator={false}>
          <LinearGradient
            colors={['#343d48', '#232a32', '#1a1f24']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}>
            <View style={styles.heroAccentLine} />
            <Text style={styles.heroKicker}>Montant</Text>
            <Text style={styles.heroHintTop}>
              Touchez le champ ci-dessous — chiffres uniquement (virgule ou point pour les centimes).
            </Text>
            <View style={styles.amountRow}>
              <TextInput
                style={styles.amountInput}
                placeholder="0"
                placeholderTextColor="rgba(244,241,238,0.35)"
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
              style={[styles.kindChip, kind === k && styles.kindChipActive]}>
              <Ionicons
                name={icon}
                size={18}
                color={kind === k ? colors.textPrimary : colors.textMuted}
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
              key={opt.iso4217}
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
                {opt.iso4217}
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
          placeholderTextColor={colors.textMuted}
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
          placeholderTextColor={colors.textMuted}
          value={tagsLine}
          onChangeText={setTagsLine}
        />

        <Text style={styles.section}>Note</Text>
        <TextInput
          style={[styles.input, styles.noteInput]}
          placeholder="Détails, contexte…"
          placeholderTextColor={colors.textMuted}
          value={note}
          onChangeText={setNote}
          multiline
        />

        <Text style={styles.section}>Pièce jointe (ticket)</Text>
        <View style={styles.attachRow}>
          <Pressable
            onPress={() => void pickImage()}
            style={({ pressed }) => [styles.attachBtn, pressed && styles.pressed]}>
            <Ionicons name="image-outline" size={22} color={colors.textPrimary} />
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
                  ? ['#5a7a82', '#3d5a62']
                  : ['#4a4540', '#353230']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.save}>
              {saving ? (
                <ActivityIndicator color={colors.textPrimary} />
              ) : (
                <>
                  <Ionicons
                    name="checkmark-circle"
                    size={22}
                    color={colors.textPrimary}
                    style={styles.saveIcon}
                  />
                  <Text style={styles.saveLabel}>{submitLabel}</Text>
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.marshland,
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
    borderRadius: 22,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  heroAccentLine: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: 'rgba(122,158,122,0.75)',
    borderTopLeftRadius: 22,
    borderBottomLeftRadius: 22,
  },
  heroKicker: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  heroHintTop: {
    fontSize: 13,
    color: colors.textSecondary,
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
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
    letterSpacing: -1,
    padding: 0,
    minHeight: 52,
  },
  amountOk: {
    marginTop: spacing.sm,
    fontSize: 14,
    fontWeight: '700',
    color: colors.success,
  },
  amountError: {
    marginTop: spacing.sm,
    fontSize: 13,
    color: colors.danger,
    lineHeight: 18,
  },
  section: {
    color: colors.textMuted,
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
    borderRadius: 16,
    backgroundColor: '#2c2826',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  kindChipActive: {
    borderColor: 'rgba(122,158,122,0.55)',
    backgroundColor: 'rgba(122,158,122,0.12)',
  },
  kindText: {
    color: colors.textMuted,
    fontSize: 15,
    fontWeight: '600',
  },
  kindTextActive: {
    color: colors.textPrimary,
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
    backgroundColor: '#2c2826',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  currencyChipActive: {
    borderColor: 'rgba(168,159,150,0.5)',
    backgroundColor: 'rgba(168,159,150,0.1)',
  },
  currencyChipText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  currencyChipTextActive: {
    color: colors.textPrimary,
  },
  currencyHint: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 16,
    marginTop: spacing.xs,
  },
  input: {
    backgroundColor: '#2c2826',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    color: colors.textPrimary,
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
    backgroundColor: colors.dune,
    borderWidth: 1,
    borderColor: colors.fuscousGray,
  },
  catChipActive: {
    borderColor: colors.accent,
  },
  catText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  catTextActive: {
    color: colors.textPrimary,
    fontWeight: '600',
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
    backgroundColor: colors.dune,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.fuscousGray,
  },
  attachLabel: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 15,
  },
  clearPhoto: {
    padding: spacing.sm,
  },
  clearPhotoText: {
    color: colors.danger,
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
    borderTopColor: 'rgba(255,255,255,0.1)',
    backgroundColor: colors.marshland,
    paddingHorizontal: spacing.md,
  },
  footerHint: {
    marginTop: spacing.sm,
    textAlign: 'center',
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 17,
  },
  saveOuter: {
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
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
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '800',
  },
});
