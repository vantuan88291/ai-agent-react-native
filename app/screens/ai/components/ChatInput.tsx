import { ViewStyle, TextStyle } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { Box } from "@/components/Box"
import { Button } from "@/components/Button"
import { Icon } from "@/components/Icon"
import { Row } from "@/components/Row"
import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import { Checkbox } from "@/components/Toggle/Checkbox"
import { useAppTheme } from "@/theme/context"
import { spacing } from "@/theme/spacing"
import type { ThemedStyle } from "@/theme/types"

interface ChatInputProps {
  inputText: string
  setInputText: (text: string) => void
  handleSend: () => void
  modelStatus: "not_setup" | "downloading" | "preparing" | "ready"
  onSetupModelPress: () => void
  useContextHistory: boolean
  onToggleContextHistory: (value: boolean) => void
  totalToken: number
  remainTokens?: number
}

export const ChatInput = ({
  inputText,
  setInputText,
  handleSend,
  modelStatus,
  onSetupModelPress,
  useContextHistory,
  onToggleContextHistory,
  totalToken,
  remainTokens,
}: ChatInputProps) => {
  const { theme, themed } = useAppTheme()
  const insets = useSafeAreaInsets()

  return (
    <Box
      backgroundColor={theme.colors.background}
      style={[themed($inputContainer), { paddingBottom: insets.bottom / 2 }]}
    >
      {modelStatus === "not_setup" ? (
        <Row style={themed($setupButtonRow)} justifyContent="center">
          <Button
            onPress={onSetupModelPress}
            preset="filled"
            text="Download AI Model"
            style={themed($setupButton)}
          />
        </Row>
      ) : (
        <>
          <Row style={themed($toggleRow)} alignItems="center" gap={spacing.xs}>
            <Checkbox
              value={useContextHistory}
              onValueChange={onToggleContextHistory}
              inputOuterStyle={themed($checkboxSquare)}
            />
            <Text
              text={
                !totalToken
                  ? "Conversation history"
                  : `Conversation history (${totalToken}${remainTokens && useContextHistory ? `/${remainTokens}` : ""} tokens)`
              }
              preset="default"
              size="xs"
              style={themed($toggleLabel)}
            />
          </Row>
          <Row style={themed($inputRow)} gap={spacing.xs}>
            <Box style={themed($textFieldWrapper)}>
              <TextField
                placeholder="Type your message..."
                value={inputText}
                onChangeText={setInputText}
                multiline
                keyboardType="default"
                containerStyle={themed($textFieldContainer)}
                inputWrapperStyle={themed($textFieldInputWrapper)}
                style={themed($textFieldInput)}
              />
            </Box>
            <Button
              preset="default"
              onPress={handleSend}
              disabled={!inputText.trim()}
              style={
                !inputText.trim()
                  ? [themed($sendButton), themed($sendButtonDisabled)]
                  : [themed($sendButton), themed($sendButtonActive)]
              }
            >
              <Icon
                icon="send"
                size={20}
                color={inputText.trim() ? theme.colors.palette.neutral100 : theme.colors.textDim}
              />
            </Button>
          </Row>
        </>
      )}
    </Box>
  )
}

const $inputContainer: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  paddingHorizontal: spacing.md,
  borderTopWidth: 1,
  borderTopColor: colors.separator,
  backgroundColor: colors.background,
  shadowColor: colors.palette.neutral900,
  shadowOffset: { width: 0, height: -2 },
  shadowOpacity: 0.05,
  shadowRadius: 4,
  elevation: 3,
})

const $toggleRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingVertical: spacing.xs,
})

const $toggleLabel: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $checkboxSquare: ThemedStyle<ViewStyle> = () => ({
  borderRadius: 4,
})

const $inputRow: ThemedStyle<ViewStyle> = () => ({
  alignItems: "center",
})

const $textFieldWrapper: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $textFieldContainer: ThemedStyle<ViewStyle> = () => ({
  marginBottom: 0,
  marginTop: 0,
})

const $textFieldInputWrapper: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  minHeight: 44,
  maxHeight: 150,
  backgroundColor: colors.palette.neutral100,
  borderColor: colors.separator,
  borderWidth: 1,
  borderRadius: 20,
  paddingVertical: spacing.xs,
  paddingHorizontal: spacing.sm,
  shadowColor: colors.palette.neutral900,
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.05,
  shadowRadius: 2,
  elevation: 1,
})

const $textFieldInput: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginVertical: 0,
  marginHorizontal: 0,
  paddingVertical: spacing.xxs,
  paddingHorizontal: 0,
})

const $sendButton: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  padding: spacing.xs,
  minWidth: 44,
  minHeight: 44,
  borderRadius: 22,
  backgroundColor: colors.palette.neutral100,
  borderWidth: 1,
  borderColor: colors.separator,
  justifyContent: "center",
  alignItems: "center",
})

const $sendButtonDisabled: ThemedStyle<ViewStyle> = () => ({
  opacity: 0.5,
})

const $sendButtonActive: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.tint,
  borderColor: colors.tint,
  shadowColor: colors.palette.neutral900,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 3,
  elevation: 2,
})

const $setupButtonRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingVertical: spacing.sm,
})

const $setupButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingTop: spacing.md,
  paddingBottom: spacing.md,
  paddingHorizontal: spacing.xl,
  borderRadius: 12,
})
