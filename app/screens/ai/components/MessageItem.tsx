import { FC } from "react"
import { TextStyle, View, ViewStyle } from "react-native"

import { Box } from "@/components/Box"
import { PressableIcon } from "@/components/Icon"
import { Text } from "@/components/Text"
import { Message } from "@/screens/ai/hooks/models"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

interface MessageItemProps {
  message: Message
  modelName?: string | null
  onViewFullMessage?: (message: Message) => void
}

export const MessageItem: FC<MessageItemProps> = ({ message, modelName, onViewFullMessage }) => {
  const isUser = message.isUser
  const { themed, theme } = useAppTheme()

  return (
    <View
      style={[
        themed($messageContainer),
        isUser ? themed($userMessageContainer) : themed($aiMessageContainer),
      ]}
    >
      <Box style={[themed($messageBubble), isUser ? themed($userBubble) : themed($aiBubble)]}>
        {!isUser && modelName && (
          <Text text={modelName} size="xxs" numberOfLines={1} style={themed($modelName)} />
        )}
        <Text
          text={message.text || "Thinking..."}
          preset="default"
          size="md"
          selectable
          style={[themed($messageText), isUser ? themed($userMessageText) : themed($aiMessageText)]}
        />
        {!isUser && onViewFullMessage && (
          <PressableIcon
            icon="expand"
            size={16}
            color={theme.colors.tint}
            onPress={() => onViewFullMessage(message)}
            containerStyle={themed($viewButton)}
          />
        )}
      </Box>
    </View>
  )
}

const $messageContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginVertical: spacing.xs,
})

const $userMessageContainer: ThemedStyle<ViewStyle> = () => ({
  alignSelf: "flex-end",
  alignItems: "flex-end",
})

const $aiMessageContainer: ThemedStyle<ViewStyle> = () => ({
  alignSelf: "flex-start",
  alignItems: "flex-start",
})

const $messageBubble: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  borderRadius: 16,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
})

const $userBubble: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.tint,
  borderBottomRightRadius: 4,
  shadowColor: colors.palette.neutral900,
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.1,
  shadowRadius: 2,
  elevation: 2,
})

const $aiBubble: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.neutral100,
  borderBottomLeftRadius: 4,
  borderWidth: 1,
  borderColor: colors.separator,
  shadowColor: colors.palette.neutral900,
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.05,
  shadowRadius: 2,
  elevation: 1,
})

const $messageText: ThemedStyle<TextStyle> = () => ({
  lineHeight: 20,
})

const $userMessageText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.neutral100,
})

const $aiMessageText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
})

const $modelName: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  marginBottom: spacing.xxs,
  color: colors.tint,
  marginRight: spacing.xl,
})

const $viewButton: ThemedStyle<ViewStyle> = () => ({
  position: "absolute",
  top: 8,
  right: 15,
  opacity: 0.6,
})
