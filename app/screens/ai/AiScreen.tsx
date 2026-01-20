import { FC, useRef, useCallback, useMemo } from "react"
import { FlatList, ListRenderItem, View } from "react-native"
import { ViewStyle } from "react-native"
import { BottomSheetModal } from "@gorhom/bottom-sheet"
import { KeyboardAvoidingView } from "react-native-keyboard-controller"
import { SafeAreaView } from "react-native-safe-area-context"

import { Box } from "@/components/Box"
import { EmptyState } from "@/components/EmptyState"
import { Header } from "@/components/Header"
import { Message, ModelInfo } from "@/screens/ai/hooks/models"
import { useAppTheme } from "@/theme/context"
import { $styles } from "@/theme/styles"
import type { ThemedStyle } from "@/theme/types"

import { ChatInput, MessageItem, ModelLoading, ModelListSheet } from "./components"
import { useAiChat } from "./hooks/useAiChat"

export const AiScreen: FC = function AiScreen() {
  const modelSheetRef = useRef<BottomSheetModal>(null)
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
    removeModelById,
    selectedModelId,
    selectedModelName,
    useContextHistory,
    setUseContextHistory,
    sortedModels,
  } = useAiChat()

  const handleSelectModel = useCallback(
    (model: ModelInfo) => {
      modelSheetRef.current?.dismiss()
      if (model.id !== selectedModelId) setupModel(model.id)
    },
    [setupModel, selectedModelId],
  )

  const handleRemoveSpecificModel = useCallback(
    async (modelId: string) => {
      modelSheetRef.current?.dismiss()
      await removeModelById(modelId)
    },
    [removeModelById],
  )

  const handleOpenModelSheet = useCallback(() => {
    if (modelLoadingState === "idle") modelSheetRef.current?.present()
  }, [modelLoadingState])

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
          rightIcon={!isModelLoading ? "settings" : undefined}
          onRightPress={!isModelLoading ? handleOpenModelSheet : undefined}
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
                  onSetupModelPress={handleOpenModelSheet}
                  useContextHistory={useContextHistory}
                  onToggleContextHistory={setUseContextHistory}
                />
              )}
            </Box>
          </Box>
        </KeyboardAvoidingView>
      </View>

      <ModelListSheet
        ref={modelSheetRef}
        selectedModelId={selectedModelId}
        sortedModels={sortedModels}
        onSelectModel={handleSelectModel}
        onRemoveModel={handleRemoveSpecificModel}
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
