import { forwardRef } from 'react';
import { Easing, Platform, type ViewStyle } from 'react-native';
import {
  Modalize as RNModalize,
  type Modalize as ModalizeRef,
  type ModalizeProps,
} from 'react-native-modalize';

import { TAB_BAR_FLOAT_BOTTOM_OFFSET } from '@/src/theme';
import { finShell } from '@/src/theme/fin-shell';
import { spacing } from '@/src/theme/spacing';

/** Overlay plus doux, aligné thème clair « fin shell ». */
const overlay: ViewStyle = {
  backgroundColor: 'rgba(18, 20, 35, 0.42)',
};

const modal: ViewStyle = {
  backgroundColor: finShell.card,
  borderTopLeftRadius: 28,
  borderTopRightRadius: 28,
  borderWidth: 1,
  borderBottomWidth: 0,
  borderColor: finShell.border,
  ...Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -10 },
      shadowOpacity: 0.12,
      shadowRadius: 24,
    },
    android: {
      elevation: 20,
    },
    default: {},
  }),
};

const handle: ViewStyle = {
  alignSelf: 'center',
  width: 40,
  height: 5,
  borderRadius: 3,
  backgroundColor: 'rgba(138,112,245,0.45)',
};

/** Espace bas pour que le contenu ne soit pas masqué par la tab bar flottante sur les écrans à onglets. */
const childrenPad: ViewStyle = {
  paddingHorizontal: spacing.md,
  paddingTop: spacing.lg,
  paddingBottom: spacing.lg + TAB_BAR_FLOAT_BOTTOM_OFFSET,
};

export type SilkyModalizeProps = ModalizeProps;

/**
 * Panneau Modalize aux finitions « soyeuses » : overlay adouci, ancrage bas, poignée discrète.
 */
export const SilkyModalize = forwardRef<ModalizeRef, SilkyModalizeProps>(
  function SilkyModalize(
    {
      overlayStyle,
      modalStyle,
      handleStyle,
      childrenStyle,
      openAnimationConfig: openAnim,
      closeAnimationConfig: closeAnim,
      avoidKeyboardLikeIOS = true,
      handlePosition = 'inside',
      panGestureEnabled = true,
      closeOnOverlayTap = true,
      ...rest
    },
    ref
  ) {
    return (
      <RNModalize
        ref={ref}
        avoidKeyboardLikeIOS={avoidKeyboardLikeIOS}
        handlePosition={handlePosition}
        panGestureEnabled={panGestureEnabled}
        closeOnOverlayTap={closeOnOverlayTap}
        overlayStyle={[overlay, overlayStyle]}
        modalStyle={[modal, modalStyle]}
        handleStyle={[handle, handleStyle]}
        childrenStyle={[childrenPad, childrenStyle]}
        openAnimationConfig={
          openAnim ?? {
            timing: {
              duration: 340,
              easing: Easing.out(Easing.cubic),
            },
            spring: { damping: 24, stiffness: 280 },
          }
        }
        closeAnimationConfig={
          closeAnim ?? {
            timing: {
              duration: 280,
              easing: Easing.in(Easing.cubic),
            },
            spring: { damping: 26, stiffness: 300 },
          }
        }
        {...rest}
      />
    );
  }
);

export type { Modalize as ModalizeRef } from 'react-native-modalize';
