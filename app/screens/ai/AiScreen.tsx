import { FC, useRef, useCallback } from "react"
import { FlatList, ListRenderItem, Platform, View, ViewStyle } from "react-native"
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

const $inputBoxStyle: ViewStyle = { flexShrink: 0 }

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
    totalToken,
    remainTokens,
    // Conversations
    conversations,
    activeConversationId,
    conversationTitle,
    createConversation,
    selectConversation,
    deleteConversation,
    generateMissingTitles,
  } = useAiChat()

  const isModelLoading = modelLoadingState !== "idle"

  const handleGoBack = useCallback(() => {
    navigation.goBack()
  }, [navigation])

  const handleOpenModelDetails = useCallback(() => {
    if (modelLoadingState === "idle") {
      modelDetailsSheetRef.current?.present()
      // Generate missing titles when opening the sheet
      generateMissingTitles()
    }
  }, [modelLoadingState, generateMissingTitles])

  const handleSetupModel = useCallback(() => {
    if (selectedModelId) {
      setupModel(selectedModelId)
    }
  }, [selectedModelId, setupModel])

  const handleViewFullMessage = useCallback(
    (message: Message) => {
      navigation.navigate("FullMessage", {
        message: message.text || "",
        modelName: selectedModelName || undefined,
      })
    },
    [navigation, selectedModelName],
  )

  const { themed } = useAppTheme()

  const renderMessage = useCallback<ListRenderItem<Message>>(
    ({ item }) => (
      <MessageItem
        message={item}
        modelName={!item.isUser ? selectedModelName : undefined}
        onViewFullMessage={!item.isUser ? handleViewFullMessage : undefined}
      />
    ),
    [selectedModelName, handleViewFullMessage],
  )

  const keyExtractor = useCallback((item: Message) => item.id, [])

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

  // Header title: show conversation title if available
  const headerTitle = conversationTitle || "AI Assistant"

  return (
    <SafeAreaView style={$styles.flex1} edges={["bottom"]}>
      <View style={themed($screen)}>
        <Header
          title={headerTitle}
          leftIcon="back"
          onLeftPress={handleGoBack}
          rightIcon={!isModelLoading ? "more" : undefined}
          onRightPress={!isModelLoading ? handleOpenModelDetails : undefined}
        />
        <KeyboardAvoidingView
          behavior="translate-with-padding"
          style={$styles.flex1}
          keyboardVerticalOffset={0}
        >
          <Box flex={1}>
            <FlatList
              ref={listRef}
              inverted
              data={messages}
              renderItem={renderMessage}
              keyExtractor={keyExtractor}
              windowSize={10}
              maxToRenderPerBatch={10}
              initialNumToRender={15}
              updateCellsBatchingPeriod={50}
              removeClippedSubviews={Platform.OS === "android"}
              contentContainerStyle={themed($listContent)}
              showsVerticalScrollIndicator={true}
              keyboardDismissMode="on-drag"
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={renderEmptyState}
            />
            <Box style={$inputBoxStyle}>
              {isModelLoading ? (
                <ModelLoading
                  modelLoadingState={modelLoadingState}
                  downloadProgress={downloadProgress}
                />
              ) : (
                <ChatInput
                  totalToken={totalToken}
                  remainTokens={remainTokens}
                  inputText={inputText}
                  setInputText={setInputText}
                  handleSend={handleSend}
                  modelStatus={modelStatus}
                  onSetupModelPress={handleSetupModel}
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
        onRemoveModel={removeModel}
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={selectConversation}
        onDeleteConversation={deleteConversation}
        onNewConversation={createConversation}
      />
    </SafeAreaView>
  )
}

const $screen: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  backgroundColor: colors.background,
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
  transform: [{ rotateY: "180deg" }, { scaleX: -1 }, { scaleY: -1 }],
})
