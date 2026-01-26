import { forwardRef, useCallback } from "react"
import { Pressable, ScrollView, TextStyle, View, ViewStyle } from "react-native"
import { BottomSheetModal } from "@gorhom/bottom-sheet"

import { BottomSheetClose } from "@/components/BottomSheetClose"
import { Box } from "@/components/Box"
import { Button } from "@/components/Button"
import { Icon } from "@/components/Icon"
import { Text } from "@/components/Text"
import { ConversationMeta, ModelInfo } from "@/screens/ai/hooks/models"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

interface ModelDetailsSheetProps {
  model: ModelInfo | null
  modelStatus: "not_setup" | "downloading" | "preparing" | "ready"
  onRemoveModel: () => void
  conversations: ConversationMeta[]
  activeConversationId: string | null
  onSelectConversation: (conversationId: string) => void
  onDeleteConversation: (conversationId: string) => void
  onNewConversation: () => void
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

export const ModelDetailsSheet = forwardRef<BottomSheetModal, ModelDetailsSheetProps>(
  (
    {
      model,
      modelStatus,
      onRemoveModel,
      conversations,
      activeConversationId,
      onSelectConversation,
      onDeleteConversation,
      onNewConversation,
    },
    ref,
  ) => {
    const { themed, theme } = useAppTheme()

    const handleRemove = useCallback(() => {
      onRemoveModel()
      if (ref && typeof ref !== "function" && "current" in ref) {
        ref.current?.dismiss()
      }
    }, [onRemoveModel, ref])

    const handleSelectConversation = useCallback(
      (conversationId: string) => {
        onSelectConversation(conversationId)
        if (ref && typeof ref !== "function" && "current" in ref) {
          ref.current?.dismiss()
        }
      },
      [onSelectConversation, ref],
    )

    const handleNewConversation = useCallback(() => {
      onNewConversation()
      if (ref && typeof ref !== "function" && "current" in ref) {
        ref.current?.dismiss()
      }
    }, [onNewConversation, ref])

    const renderConversationItem = useCallback(
      (item: ConversationMeta) => {
        const isActive = item.id === activeConversationId
        return (
          <Pressable
            key={item.id}
            onPress={() => handleSelectConversation(item.id)}
            style={({ pressed }) => [
              themed($conversationItem),
              isActive && themed($conversationItemActive),
              pressed && { opacity: 0.7 },
            ]}
          >
            <View style={$conversationContent}>
              <Text
                text={item.title || "New Chat"}
                preset="default"
                size="sm"
                weight={isActive ? "semiBold" : "normal"}
                numberOfLines={1}
                style={isActive ? themed($conversationTitleActive) : undefined}
              />
              {item.lastMessagePreview && (
                <Text
                  text={item.lastMessagePreview}
                  preset="default"
                  size="xxs"
                  numberOfLines={1}
                  style={themed($conversationPreview)}
                />
              )}
              <Text
                text={formatDate(item.updatedAt)}
                preset="default"
                size="xxs"
                style={themed($conversationDate)}
              />
            </View>
            {conversations.length > 1 && (
              <Pressable
                onPress={() => onDeleteConversation(item.id)}
                hitSlop={8}
                style={themed($deleteButton)}
              >
                <Icon icon="x" size={16} color={theme.colors.textDim} />
              </Pressable>
            )}
          </Pressable>
        )
      },
      [
        activeConversationId,
        conversations.length,
        handleSelectConversation,
        onDeleteConversation,
        theme.colors.textDim,
        themed,
      ],
    )

    // Bottom button component - always visible at bottom
    const renderBottomButton =
      modelStatus === "ready" ? (
        <Button
          text="Remove Model"
          preset="reversed"
          onPress={handleRemove}
          style={themed($removeButton)}
        />
      ) : null

    // Early return AFTER all hooks
    if (!model) return null

    return (
      <BottomSheetClose
        ref={ref}
        title="Model Details"
        bottomComponent={renderBottomButton}
        disableScrollContent
        disableExpand
      >
        <Box style={themed($contentContainer)}>
          {/* Model Name - Full width */}
          <Box style={themed($modelNameSection)}>
            <Text text={model.name} preset="default" size="xs" weight="medium" />
          </Box>

          {/* Size & Status - Compact row */}
          <Box style={themed($modelInfoRow)}>
            <Box style={themed($modelInfoItem)}>
              <Text text="Size" preset="formLabel" size="xxs" style={themed($label)} />
              <Text text={model.size} preset="default" size="xs" />
            </Box>
            <Box style={themed($modelInfoItem)}>
              <Text text="Status" preset="formLabel" size="xxs" style={themed($label)} />
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
                size="xs"
                style={themed($statusText(modelStatus))}
              />
            </Box>
          </Box>

          {/* Conversations Section */}
          {modelStatus === "ready" && (
            <Box style={themed($conversationsSection)}>
              <Box style={themed($conversationsHeader)}>
                <Text text="Conversations" preset="formLabel" size="xs" style={themed($label)} />
                <Pressable onPress={handleNewConversation} hitSlop={8}>
                  <Text text="+ New Chat" preset="default" size="xs" style={themed($newChatLink)} />
                </Pressable>
              </Box>

              {conversations.length > 0 ? (
                <ScrollView
                  style={themed($conversationList)}
                  showsVerticalScrollIndicator={true}
                  nestedScrollEnabled
                >
                  {conversations.map(renderConversationItem)}
                </ScrollView>
              ) : (
                <Box style={themed($emptyConversations)}>
                  <Text
                    text="No conversations yet"
                    preset="default"
                    size="sm"
                    style={themed($emptyText)}
                  />
                </Box>
              )}
            </Box>
          )}
        </Box>
      </BottomSheetClose>
    )
  },
)

const $contentContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
})

const $modelNameSection: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.xs,
})

const $modelInfoRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  marginBottom: spacing.xs,
  gap: spacing.lg,
})

const $modelInfoItem: ThemedStyle<ViewStyle> = () => ({})

const $label: ThemedStyle<ViewStyle> = ({ colors }) => ({
  marginBottom: 2,
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

const $conversationsSection: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.xs,
  paddingTop: spacing.xs,
  borderTopWidth: 1,
  borderTopColor: "rgba(128, 128, 128, 0.2)",
  flex: 1,
})

const $conversationsHeader: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: spacing.xs,
})

const $newChatLink: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.tint,
})

const $conversationList: ThemedStyle<ViewStyle> = () => ({
  maxHeight: 400,
})

const $conversationItem: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  flexDirection: "row",
  alignItems: "center",
  paddingVertical: spacing.xs,
  paddingHorizontal: spacing.sm,
  borderRadius: 8,
  marginBottom: spacing.xxs,
  backgroundColor: colors.background,
})

const $conversationItemActive: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.tint + "20",
})

const $conversationContent: ViewStyle = {
  flex: 1,
}

const $conversationTitleActive: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.tint,
})

const $conversationPreview: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.textDim,
  marginTop: spacing.xxs,
})

const $conversationDate: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.textDim,
  marginTop: spacing.xxs,
  opacity: 0.7,
})

const $deleteButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: spacing.xs,
})

const $emptyConversations: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingVertical: spacing.md,
  alignItems: "center",
})

const $emptyText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
})

const $removeButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingVertical: spacing.md,
  borderRadius: 8,
})
