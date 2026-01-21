import { FC } from "react"
import { TextStyle, View, ViewStyle } from "react-native"
import Markdown from "react-native-markdown-display"

import { Box } from "@/components/Box"
import { Text } from "@/components/Text"
import { Message } from "@/screens/ai/hooks/models"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

interface MessageItemProps {
  message: Message
  modelName?: string | null
}

export const MessageItem: FC<MessageItemProps> = ({ message, modelName }) => {
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
        {isUser ? (
          <Text
            text={message.text || "Thinking..."}
            preset="default"
            size="md"
            selectable
            style={[themed($messageText), themed($userMessageText)]}
          />
        ) : (
          <Markdown style={$markdownStyles(theme)} mergeStyle={false}>
            {message.text || "..."}
          </Markdown>
        )}
      </Box>
    </View>
  )
}

const $messageContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginVertical: spacing.xs,
  maxWidth: "80%",
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
  minWidth: 100,
  maxWidth: "100%",
  flexShrink: 1,
  width: "100%",
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

const $modelName: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  marginBottom: spacing.xxs,
  color: colors.tint,
})

const $markdownStyles = (theme: any) => ({
  body: {
    color: theme.colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  paragraph: {
    marginTop: 4,
    marginBottom: 4,
  },
  heading1: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "bold" as const,
    marginTop: 12,
    marginBottom: 8,
  },
  heading2: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "bold" as const,
    marginTop: 10,
    marginBottom: 6,
  },
  heading3: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "600" as const,
    marginTop: 8,
    marginBottom: 4,
  },
  code_inline: {
    backgroundColor: theme.colors.palette.neutral200,
    color: theme.colors.text,
    fontSize: 13,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    fontFamily: "monospace",
  },
  code_block: {
    backgroundColor: theme.colors.palette.neutral200,
    color: theme.colors.text,
    fontSize: 13,
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
    fontFamily: "monospace",
  },
  fence: {
    backgroundColor: theme.colors.palette.neutral200,
    color: theme.colors.text,
    fontSize: 14,
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
    fontFamily: "monospace",
  },
  link: {
    color: theme.colors.tint,
    textDecorationLine: "underline" as const,
  },
  list_item: {
    marginBottom: 4,
  },
  bullet_list: {
    marginVertical: 8,
  },
  ordered_list: {
    marginVertical: 8,
  },
  blockquote: {
    backgroundColor: theme.colors.palette.neutral200,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.tint,
    paddingLeft: 12,
    paddingVertical: 8,
    marginVertical: 8,
    fontStyle: "italic" as const,
  },
  strong: {
    fontWeight: "bold" as const,
    color: theme.colors.text,
  },
  em: {
    fontStyle: "italic" as const,
  },
  hr: {
    backgroundColor: theme.colors.separator,
    height: 1,
    marginVertical: 12,
  },
  table: {
    borderWidth: 1,
    borderColor: theme.colors.separator,
    borderRadius: 8,
    marginVertical: 8,
  },
  thead: {
    backgroundColor: theme.colors.palette.neutral200,
  },
  th: {
    borderWidth: 1,
    borderColor: theme.colors.separator,
    padding: 8,
    fontWeight: "bold" as const,
  },
  td: {
    borderWidth: 1,
    borderColor: theme.colors.separator,
    padding: 8,
  },
})
