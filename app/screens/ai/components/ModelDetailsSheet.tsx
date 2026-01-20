import { forwardRef } from "react"
import { TextStyle, ViewStyle } from "react-native"
import { BottomSheetModal } from "@gorhom/bottom-sheet"

import { BottomSheetClose } from "@/components/BottomSheetClose"
import { Box } from "@/components/Box"
import { Button } from "@/components/Button"
import { Text } from "@/components/Text"
import { ModelInfo } from "@/screens/ai/hooks/models"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

interface ModelDetailsSheetProps {
  model: ModelInfo | null
  modelStatus: "not_setup" | "downloading" | "preparing" | "ready"
  onRemoveModel: () => void
  onClearConversation: () => void
}

export const ModelDetailsSheet = forwardRef<BottomSheetModal, ModelDetailsSheetProps>(
  ({ model, modelStatus, onRemoveModel, onClearConversation }, ref) => {
    const { themed } = useAppTheme()

    if (!model) return null

    const handleRemove = () => {
      onRemoveModel()
      if (ref && typeof ref !== "function" && "current" in ref) {
        ref.current?.dismiss()
      }
    }

    const handleClearConversation = () => {
      onClearConversation()
      if (ref && typeof ref !== "function" && "current" in ref) {
        ref.current?.dismiss()
      }
    }

    return (
      <BottomSheetClose ref={ref} disableExpand title="Model Details">
        <Box style={themed($contentContainer)}>
          <Box style={themed($infoSection)}>
            <Text text="Model Name" preset="formLabel" size="xs" style={themed($label)} />
            <Text text={model.name} preset="default" size="md" weight="medium" />
          </Box>

          <Box style={themed($infoSection)}>
            <Text text="Model Size" preset="formLabel" size="xs" style={themed($label)} />
            <Text text={model.size} preset="default" size="md" />
          </Box>

          <Box style={themed($infoSection)}>
            <Text text="Status" preset="formLabel" size="xs" style={themed($label)} />
            <Text
              text={
                modelStatus === "ready"
                  ? "Ready"
                  : modelStatus === "downloading"
                    ? "Downloading"
                    : modelStatus === "preparing"
                      ? "Preparing"
                      : "Not Installed"
              }
              preset="default"
              size="md"
              style={themed($statusText(modelStatus))}
            />
          </Box>

          {modelStatus === "ready" && (
            <Box style={themed($buttonSection)}>
              <Button
                text="Clear Conversation"
                preset="default"
                onPress={handleClearConversation}
                style={themed($clearButton)}
              />
              <Button
                text="Remove Model"
                preset="reversed"
                onPress={handleRemove}
                style={themed($removeButton)}
              />
            </Box>
          )}
        </Box>
      </BottomSheetClose>
    )
  },
)

const $contentContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.md,
})

const $infoSection: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.lg,
})

const $label: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  marginBottom: spacing.xs,
  color: colors.textDim,
})

const $statusText: (
  status: "not_setup" | "downloading" | "preparing" | "ready",
) => ThemedStyle<TextStyle> =
  (status) =>
  ({ colors }) => ({
    color:
      status === "ready"
        ? colors.tint
        : status === "downloading" || status === "preparing"
          ? colors.tintInactive
          : colors.textDim,
  })

const $buttonSection: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.xl,
  paddingTop: spacing.lg,
  borderTopWidth: 1,
  borderTopColor: "transparent",
})

const $clearButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingVertical: spacing.md,
  borderRadius: 8,
  marginBottom: spacing.sm,
})

const $removeButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingVertical: spacing.md,
  borderRadius: 8,
})
