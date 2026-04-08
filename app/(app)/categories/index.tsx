import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  SilkyModalize,
  type ModalizeRef,
} from '@/src/components/silky-modalize';
import { ScreenHeader } from '@/src/components/screen-header';
import { UchumiScreen } from '@/src/components/uchumi-screen';
import { useAppStore } from '@/src/store/use-app-store';
import type { Category } from '@/src/types/category';
import { colors } from '@/src/theme';
import { spacing } from '@/src/theme/spacing';

export default function CategoriesScreen() {
  const insets = useSafeAreaInsets();
  const categories = useAppStore((s) => s.categories);
  const addCategory = useAppStore((s) => s.addCategory);
  const updateCategory = useAppStore((s) => s.updateCategory);
  const deleteCategory = useAppStore((s) => s.deleteCategory);

  const categoryModalRef = useRef<ModalizeRef>(null);
  const [draftName, setDraftName] = useState('');
  const [editing, setEditing] = useState<Category | null>(null);

  const openAdd = () => {
    setEditing(null);
    setDraftName('');
    categoryModalRef.current?.open();
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setDraftName(cat.name);
    categoryModalRef.current?.open();
  };

  const closeModal = () => {
    categoryModalRef.current?.close();
  };

  const onCategoryModalClosed = () => {
    setDraftName('');
    setEditing(null);
  };

  const saveModal = () => {
    const name = draftName.trim();
    if (!name) return;
    if (editing) {
      updateCategory(editing.id, name);
    } else {
      addCategory(name);
    }
    closeModal();
  };

  const confirmDelete = (cat: Category) => {
    Alert.alert(
      'Supprimer la catégorie ?',
      `« ${cat.name} » sera retirée. Les mouvements associés passeront en « Sans catégorie ».`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => deleteCategory(cat.id),
        },
      ]
    );
  };

  return (
    <UchumiScreen style={styles.flex}>
      <ScreenHeader title="Catégories" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.page}>
        <LinearGradient
          colors={['#353a42', '#22262c']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}>
          <View style={styles.heroIcon}>
            <Ionicons name="pricetags" size={26} color={colors.textOnDark} />
          </View>
          <Text style={styles.heroTitle}>Organisez vos sorties</Text>
          <Text style={styles.heroSub}>
            Les catégories classent dépenses et épargne. Ajoutez les vôtres ou renommez celles par
            défaut.
          </Text>
        </LinearGradient>

        <Pressable
          onPress={openAdd}
          style={({ pressed }) => [styles.addMain, pressed && styles.pressed]}>
          <LinearGradient
            colors={['#4a6670', '#2f3d42']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.addGrad}>
            <Ionicons name="add-circle-outline" size={22} color={colors.textOnDark} />
            <Text style={styles.addMainLabel}>Nouvelle catégorie</Text>
          </LinearGradient>
        </Pressable>

        <FlatList
          data={categories}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: insets.bottom + spacing.xl },
          ]}
          renderItem={({ item }) => (
            <View style={styles.rowCard}>
              <View style={[styles.dot, { backgroundColor: item.color }]} />
              <Text style={styles.rowName} numberOfLines={1}>
                {item.name}
              </Text>
              <Pressable
                onPress={() => openEdit(item)}
                style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}>
                <Ionicons name="create-outline" size={22} color={colors.accent} />
              </Pressable>
              <Pressable
                onPress={() => confirmDelete(item)}
                style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}>
                <Ionicons name="trash-outline" size={22} color={colors.danger} />
              </Pressable>
            </View>
          )}
        />
      </View>

      <SilkyModalize
        ref={categoryModalRef}
        adjustToContentHeight
        childrenStyle={{ gap: spacing.sm }}
        onClosed={onCategoryModalClosed}
        scrollViewProps={{ keyboardShouldPersistTaps: 'handled' }}>
        <View style={styles.modalHeader}>
            <Ionicons
              name={editing ? 'create' : 'add-circle'}
              size={24}
              color={colors.accent}
            />
            <Text style={styles.modalTitle}>
              {editing ? 'Renommer la catégorie' : 'Nouvelle catégorie'}
            </Text>
          </View>
          <TextInput
            style={styles.modalInput}
            placeholder="Nom"
            placeholderTextColor={colors.textMuted}
            value={draftName}
            onChangeText={setDraftName}
            onSubmitEditing={saveModal}
          />
          <View style={styles.modalActions}>
            <Pressable onPress={closeModal} style={styles.modalCancel}>
              <Text style={styles.modalCancelText}>Annuler</Text>
            </Pressable>
            <Pressable
              onPress={saveModal}
              disabled={!draftName.trim()}
              style={({ pressed }) => [
                styles.modalSave,
                !draftName.trim() && styles.modalSaveDisabled,
                pressed && draftName.trim() && styles.pressed,
              ]}>
              <LinearGradient
                colors={['#5a6a62', '#3d4a42']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.modalSaveGrad}>
                <Text style={styles.modalSaveText}>Enregistrer</Text>
              </LinearGradient>
            </Pressable>
          </View>
      </SilkyModalize>
      </KeyboardAvoidingView>
    </UchumiScreen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.marshland,
  },
  page: {
    flex: 1,
    paddingTop: spacing.xs,
  },
  hero: {
    borderRadius: 20,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
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
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textOnDark,
    letterSpacing: -0.3,
  },
  heroSub: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textOnDarkMuted,
  },
  addMain: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  addGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  addMainLabel: {
    color: colors.textOnDark,
    fontSize: 16,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.88,
  },
  list: {
    gap: spacing.sm,
  },
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 16,
    backgroundColor: colors.dune,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    gap: spacing.sm,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  rowName: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  iconBtn: {
    padding: 6,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  modalTitle: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
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
    gap: spacing.md,
  },
  modalCancel: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  modalCancelText: {
    color: colors.textMuted,
    fontSize: 16,
    fontWeight: '600',
  },
  modalSave: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalSaveGrad: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  modalSaveDisabled: {
    opacity: 0.4,
  },
  modalSaveText: {
    color: colors.textOnDark,
    fontSize: 16,
    fontWeight: '800',
  },
});
