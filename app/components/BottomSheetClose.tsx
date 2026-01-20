import { forwardRef, ReactNode, MutableRefObject, useCallback } from "react"
import { ViewStyle, Image, Dimensions, TouchableOpacity, ImageStyle } from "react-native"
import {
  BottomSheetModal,
  BottomSheetModalProps,
  BottomSheetScrollView,
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet"
import { KeyboardAwareScrollView } from "react-native-keyboard-controller"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { Box } from "@/components/Box"
import { Icon } from "@/components/Icon"
import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

export interface BottomSheetProps extends BottomSheetModalProps {
  children: ReactNode
  title?: string
  titlePreset?: "default" | "bold" | "heading" | "subheading" | "formLabel" | "formHelper"
  subTitle?: string | ReactNode
  cancelAble?: boolean
  style?: ViewStyle
  containerStyle?: ViewStyle
  bottomComponent?: ReactNode
  onClose?(): void
  icon?: string
  snapPoints?: (string | number)[]
  disableExpand?: boolean
  disableScrollContent?: boolean
  titleCenter?: boolean
  removeSafeBottom?: boolean
  height?: any
  noLine?: boolean
  enableScrollForKeyboard?: boolean
  renderClose?: () => ReactNode
}

const { height: heightScreen } = Dimensions.get("window")

export const BottomSheetClose = forwardRef<BottomSheetModal, BottomSheetProps>(
  (props: BottomSheetProps, ref: MutableRefObject<BottomSheetModal> | any) => {
    const { theme, themed } = useAppTheme()
    const insets = useSafeAreaInsets()

    const onClose = () => {
      ref.current?.dismiss()
      props?.onClose?.()
    }
    const {
      title,
      icon,
      cancelAble,
      subTitle,
      snapPoints = [10],
      titleCenter,
      height,
      disableExpand,
      noLine = false,
      containerStyle,
      titlePreset,
      enableScrollForKeyboard = false,
    } = props
    const ViewChildren = enableScrollForKeyboard
      ? KeyboardAwareScrollView
      : props.disableExpand
        ? Box
        : BottomSheetScrollView

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          pressBehavior={"close"}
          appearsOnIndex={0}
          onPress={onClose}
          disappearsOnIndex={-1}
        />
      ),
      [disableExpand],
    )
    const renderClose = () =>
      props.renderClose ? (
        props.renderClose()
      ) : (
        <TouchableOpacity
          onPress={onClose}
          style={
            icon
              ? themed($closeIcon)
              : titleCenter
                ? themed($closeNoIconCenter)
                : themed($closeNoIcon)
          }
          activeOpacity={0.7}
        >
          <Icon size={20} icon="x" color={theme.colors.textDim} />
        </TouchableOpacity>
      )
    const renderIconHeader = useCallback(
      () => icon && <Image source={{ uri: icon }} style={themed($handle)} />,
      [icon, themed],
    )
    return (
      <BottomSheetModal
        snapPoints={!!height ? [height] : snapPoints}
        ref={ref}
        index={!!height ? 0 : 1}
        maxDynamicContentSize={heightScreen * 0.8}
        backgroundStyle={themed($container)}
        backdropComponent={renderBackdrop}
        handleComponent={renderIconHeader}
        enableContentPanningGesture={!disableExpand}
        enablePanDownToClose={!disableExpand}
        enableHandlePanningGesture={!disableExpand}
        enableDynamicSizing={!height}
        keyboardBehavior="extend"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
        {...props}
      >
        <BottomSheetView style={containerStyle}>
          <Box style={icon ? themed($wrapIcon) : themed($wrap)}>
            <Box style={icon ? themed($wrapTitle) : themed($wrapTitleNoIcon)}>
              {!!title && (
                <Text
                  preset={titlePreset || "subheading"}
                  text={title}
                  style={[
                    !icon && themed($titleNoIcon),
                    titleCenter && themed($center),
                    themed($titleMargin),
                  ]}
                />
              )}
              {!!subTitle &&
                (typeof subTitle === "string" ? (
                  <Text
                    preset="default"
                    text={subTitle}
                    style={[!!icon && themed($subtitle), themed($titleMargin)]}
                  />
                ) : (
                  subTitle
                ))}
            </Box>
            {!cancelAble && !icon && renderClose()}
          </Box>
          {!icon && !noLine && (
            <Box
              height={0.5}
              width={"100%"}
              backgroundColor={theme.colors.separator}
              style={themed($separatorMargin)}
            />
          )}
          {!cancelAble && icon && renderClose()}
          <ViewChildren
            style={[
              !props?.bottomComponent && { paddingBottom: insets.bottom },
              !disableExpand && {
                height: height,
              },
            ]}
            scrollEnabled={!disableExpand || enableScrollForKeyboard}
            keyboardShouldPersistTaps="handled"
          >
            {props.children}
          </ViewChildren>
          {!!props.bottomComponent && (
            <Box style={[themed($rootBottom), noLine && themed($noLine)]}>
              {props.bottomComponent}
            </Box>
          )}
        </BottomSheetView>
      </BottomSheetModal>
    )
  },
)

const $container: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.background,
  borderTopLeftRadius: 16,
  borderTopRightRadius: 16,
})

const $closeIcon: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  width: 32,
  height: 32,
  borderRadius: 16,
  backgroundColor: colors.palette.neutral200,
  alignItems: "center",
  justifyContent: "center",
  position: "absolute",
  right: spacing.md,
  top: spacing.md,
})

const $wrap: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: spacing.md,
})

const $wrapIcon: ThemedStyle<ViewStyle> = () => ({
  alignItems: "center",
  marginTop: 44,
})

const $rootBottom: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  paddingHorizontal: spacing.md,
  paddingTop: spacing.md,
  paddingBottom: spacing.md,
  borderTopWidth: 1,
  borderColor: colors.separator,
})

const $noLine: ThemedStyle<ViewStyle> = () => ({
  borderTopWidth: 0,
})

const $handle: ThemedStyle<ImageStyle> = () => ({
  height: 96,
  width: 96,
  position: "absolute",
  alignSelf: "center",
  alignItems: "center",
  justifyContent: "center",
  top: -48,
})

const $center: ThemedStyle<ViewStyle> = () => ({
  alignSelf: "center",
})

const $closeNoIcon: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  width: 32,
  height: 32,
  borderRadius: 16,
  backgroundColor: colors.palette.neutral200,
  alignItems: "center",
  justifyContent: "center",
  position: "absolute",
  right: spacing.sm,
  alignSelf: "center",
})

const $closeNoIconCenter: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  width: 32,
  height: 32,
  borderRadius: 16,
  backgroundColor: colors.palette.neutral200,
  alignItems: "center",
  justifyContent: "center",
  position: "absolute",
  right: spacing.sm,
  top: -spacing.xs,
})

const $wrapTitle: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  gap: 10,
  marginHorizontal: spacing.md,
  marginTop: spacing.xl,
})

const $wrapTitleNoIcon: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  alignItems: "flex-start",
})

const $titleNoIcon: ThemedStyle<ViewStyle> = () => ({
  alignSelf: "flex-start",
})

const $titleMargin: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginHorizontal: spacing.md,
})

const $separatorMargin: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.sm,
})

const $subtitle: ThemedStyle<TextStyle> = () => ({
  textAlign: "center",
})
