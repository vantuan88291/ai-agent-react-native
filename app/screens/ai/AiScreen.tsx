import { FC, useRef, useCallback, useMemo } from "react"
import { FlatList, ListRenderItem, View } from "react-native"
import { ViewStyle } from "react-native"
import { BottomSheetModal } from "@gorhom/bottom-sheet"
import { useNavigation } from "@react-navigation/native"
import { KeyboardAvoidingView } from "react-native-keyboard-controller"
import { SafeAreaView } from "react-native-safe-area-context"

import { Box } from "@/components/Box"
import { EmptyState } from "@/components/EmptyState"
import { Header } from "@/components/Header"
import { AppStackScreenProps } from "@/navigators/navigationTypes"
import { Message } from "@/screens/ai/hooks/models"
import { useAppTheme } from "@/theme/context"
import { $styles } from "@/theme/styles"
import type { ThemedStyle } from "@/theme/types"

import { ChatInput, MessageItem, ModelDetailsSheet, ModelLoading } from "./components"
import { useAiChat } from "./hooks/useAiChat"

export const AiScreen: FC<AppStackScreenProps<"ai">> = function AiScreen() {
  const navigation = useNavigation<AppStackScreenProps<"ai">["navigation"]>()
  const modelDetailsSheetRef = useRef<BottomSheetModal>(null)

  const {
    messages,
    inputText,
    setInputText,
    handleSend,
    listRef,
    modelStatus,
    modelLoadingState,
    downloadProgress,
    setupModel,
    removeModel,
    selectedModel,
    selectedModelId,
    selectedModelName,
    useContextHistory,
    setUseContextHistory,
  } = useAiChat()

  const handleOpenModelDetails = useCallback(() => {
    if (modelLoadingState === "idle") {
      modelDetailsSheetRef.current?.present()
    }
  }, [modelLoadingState])

  const handleRemoveModel = useCallback(async () => {
    await removeModel()
  }, [removeModel])

  const { themed } = useAppTheme()

  const renderMessage = useCallback<ListRenderItem<Message>>(
    ({ item }) => (
      <MessageItem message={item} modelName={!item.isUser ? selectedModelName : undefined} />
    ),
    [selectedModelName],
  )

  const keyExtractor = useCallback((item: Message) => item.id, [])

  const isModelLoading = useMemo(() => modelLoadingState !== "idle", [modelLoadingState])

  const renderEmptyState = useCallback(() => {
    if (isModelLoading) return null
    return (
      <Box style={themed($emptyStateContainer)}>
        <EmptyState
          heading="Start a conversation"
          content="Ask me anything! I'm here to help you with your questions."
        />
      </Box>
    )
  }, [isModelLoading, themed])

  return (
    <SafeAreaView style={$styles.flex1} edges={["bottom"]}>
      <View style={themed($screen)}>
        <Header
          title="AI Assistant"
          leftIcon="back"
          onLeftPress={() => navigation.goBack()}
          rightIcon={!isModelLoading ? "more" : undefined}
          onRightPress={!isModelLoading ? handleOpenModelDetails : undefined}
        />
        <KeyboardAvoidingView
          behavior="translate-with-padding"
          style={themed($keyboardAvoidingView)}
          keyboardVerticalOffset={0}
        >
          <Box flex={1} style={themed($containerBox)}>
            <FlatList
              ref={listRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={keyExtractor}
              contentContainerStyle={themed($listContent)}
              showsVerticalScrollIndicator={true}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={renderEmptyState}
            />
            <Box style={themed($inputBox)}>
              {isModelLoading ? (
                <ModelLoading
                  modelLoadingState={modelLoadingState}
                  downloadProgress={downloadProgress}
                />
              ) : (
                <ChatInput
                  inputText={inputText}
                  setInputText={setInputText}
                  handleSend={handleSend}
                  modelStatus={modelStatus}
                  onSetupModelPress={() => {
                    if (selectedModelId) {
                      setupModel(selectedModelId)
                    }
                  }}
                  useContextHistory={useContextHistory}
                  onToggleContextHistory={setUseContextHistory}
                />
              )}
            </Box>
          </Box>
        </KeyboardAvoidingView>
      </View>

      <ModelDetailsSheet
        ref={modelDetailsSheetRef}
        model={selectedModel}
        modelStatus={modelStatus}
        onRemoveModel={handleRemoveModel}
      />
    </SafeAreaView>
  )
}

const $screen: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  backgroundColor: colors.background,
})

const $keyboardAvoidingView: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $containerBox: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $inputBox: ThemedStyle<ViewStyle> = () => ({
  flexShrink: 0,
})

const $listContent: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  paddingHorizontal: spacing.md,
  paddingTop: spacing.md,
  paddingBottom: spacing.md,
  flexGrow: 1,
  backgroundColor: colors.background,
})

const $emptyStateContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  paddingVertical: spacing.xl,
})
