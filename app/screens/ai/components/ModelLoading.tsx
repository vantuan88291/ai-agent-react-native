import { ActivityIndicator, TextStyle, ViewStyle } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { Box } from "@/components/Box"
import { Row } from "@/components/Row"
import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import { spacing } from "@/theme/spacing"
import type { ThemedStyle } from "@/theme/types"

interface ModelLoadingProps {
  modelLoadingState: "idle" | "downloading" | "preparing"
  downloadProgress: number
}

export const ModelLoading = ({ modelLoadingState, downloadProgress }: ModelLoadingProps) => {
  const { theme, themed } = useAppTheme()
  const insets = useSafeAreaInsets()
  if (modelLoadingState === "idle") return null

  const loadingText =
    modelLoadingState === "downloading"
      ? "Downloading AI model..."
      : modelLoadingState === "preparing"
        ? "Preparing model..."
        : ""

  const progress = modelLoadingState === "downloading" ? downloadProgress : 0
  const showProgress = modelLoadingState === "downloading" && progress > 0

  return (
    <Box
      backgroundColor={theme.colors.background}
      style={[themed($loadingInputContainer), { paddingBottom: insets.bottom + 20 }]}
    >
      <Row style={themed($loadingInputRow)} gap={spacing.md} alignItems="center">
        <ActivityIndicator size="small" color={theme.colors.tint} />
        <Box style={themed($loadingContentContainer)}>
          <Text text={loadingText} preset="default" size="md" style={themed($loadingText)} />
          {showProgress && (
            <Box style={themed($progressBarContainer)}>
              <Box style={themed($progressBarBackground)}>
                <Box
                  style={[
                    themed($progressBarFill),
                    {
                      width: `${progress}%`,
                    },
                  ]}
                />
              </Box>
              <Text
                text={`${progress.toFixed(0)}%`}
                preset="default"
                size="xs"
                style={themed($progressText)}
              />
            </Box>
          )}
          {!showProgress && modelLoadingState === "downloading" && (
            <Text
              text="Please wait a moment..."
              preset="default"
              size="xs"
              style={themed($loadingSubtext)}
            />
          )}
        </Box>
      </Row>
    </Box>
  )
}

const $loadingInputContainer: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  paddingHorizontal: spacing.xl,
  paddingTop: spacing.sm,
  borderTopWidth: 1,
  borderTopColor: colors.separator,
  minHeight: 60,
})

const $loadingInputRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  paddingVertical: spacing.xs,
})

const $loadingContentContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  gap: spacing.sm,
})

const $loadingText: ThemedStyle<TextStyle> = () => ({
  textAlign: "left",
})

const $loadingSubtext: ThemedStyle<TextStyle> = () => ({
  textAlign: "left",
})

const $progressBarContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  gap: spacing.xs,
})

const $progressBarBackground: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: 6,
  backgroundColor: colors.separator,
  borderRadius: 3,
  overflow: "hidden",
})

const $progressBarFill: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: "100%",
  backgroundColor: colors.tint,
  borderRadius: 3,
})

const $progressText: ThemedStyle<TextStyle> = () => ({
  textAlign: "right",
  fontSize: 12,
})
