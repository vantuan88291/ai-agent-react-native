import { useCallback, useState, useMemo, useEffect, useRef } from "react"
import { useRoute } from "@react-navigation/native"

import { AppStackScreenProps } from "@/navigators/navigationTypes"
import { ModelLoadingState, Message, getMessagesKey } from "@/screens/ai/hooks/models"
import { promptAI } from "@/utils/aiHelper"
import { load } from "@/utils/storage"

import { useConversations } from "./useConversations"
import { useMessages } from "./useMessages"
import { useMessageStream } from "./useMessageStream"
import { useModelSetup } from "./useModelSetup"

const MIN_MESSAGES_FOR_TITLE = 3

/**
 * Main AI Chat hook that orchestrates model setup, messages, and streaming.
 * This hook composes smaller, focused hooks for better maintainability.
 */
export const useAiChat = () => {
  const route = useRoute<AppStackScreenProps<"ai">["route"]>()
  const model = route.params?.model
  const modelId = model?.id

  const [inputText, setInputTextState] = useState("")
  const [useContextHistory, setUseContextHistory] = useState<boolean>(true)

  const setInputText = useCallback((text: string) => {
    setInputTextState(text)
  }, [])

  // Conversations hook
  const {
    conversations,
    activeConversationId,
    activeConversation,
    createConversation,
    selectConversation,
    deleteConversation,
    updateConversationMeta,
    deleteAllConversations,
  } = useConversations({ modelId })

  // Use refs to avoid dependency cycles in callbacks
  const activeConversationIdRef = useRef<string | null>(activeConversationId)
  const updateConversationMetaRef = useRef(updateConversationMeta)
  const conversationsRef = useRef(conversations)
  const modelIdRef = useRef(modelId)
  const isGeneratingTitleRef = useRef<Set<string>>(new Set()) // Track which conversations are generating titles

  useEffect(() => {
    activeConversationIdRef.current = activeConversationId
  }, [activeConversationId])

  useEffect(() => {
    updateConversationMetaRef.current = updateConversationMeta
  }, [updateConversationMeta])

  useEffect(() => {
    conversationsRef.current = conversations
  }, [conversations])

  useEffect(() => {
    modelIdRef.current = modelId
  }, [modelId])

  /**
   * Generate title for a single conversation using AI
   */
  const generateConversationTitle = useCallback(
    async (conversationId: string, messagesForTitle: Message[]) => {
      const currentModelId = modelIdRef.current
      if (!currentModelId) return

      // Mark as generating to prevent duplicate calls
      if (isGeneratingTitleRef.current.has(conversationId)) return
      isGeneratingTitleRef.current.add(conversationId)

      try {
        // messages should be in chronological order for the prompt
        const summaryResult = await promptAI(currentModelId, "", {
          messages: [
            ...messagesForTitle.slice(0, 5).map((msg) => ({
              role: msg.isUser ? ("user" as const) : ("assistant" as const),
              content: msg.text,
            })),
            {
              role: "user" as const,
              content:
                "Give this conversation a short title (max 5 words), using the same language as the conversation. Only respond with the title, nothing else.",
            },
          ],
        })

        if (summaryResult) {
          const title = summaryResult.trim().slice(0, 50)
          updateConversationMetaRef.current(conversationId, { title })
        }
      } catch (error) {
        console.error("[useAiChat] Error generating title:", error)
      } finally {
        isGeneratingTitleRef.current.delete(conversationId)
      }
    },
    [],
  )

  /**
   * Generate missing titles for all conversations without title
   * Called when user opens the conversation list popup
   */
  const generateMissingTitles = useCallback(async () => {
    const currentModelId = modelIdRef.current
    if (!currentModelId) return

    // Find conversations without titles that have enough messages
    const conversationsWithoutTitle = conversationsRef.current.filter(
      (c) => !c.title && !isGeneratingTitleRef.current.has(c.id),
    )

    for (const conv of conversationsWithoutTitle) {
      // Load messages from storage for this conversation

      const storedMessages = load<Message[]>(getMessagesKey(conv.id)) || []

      // Only generate if has at least MIN_MESSAGES_FOR_TITLE messages
      if (storedMessages.length >= MIN_MESSAGES_FOR_TITLE) {
        // Messages in storage are chronological (oldest first)
        await generateConversationTitle(conv.id, storedMessages)
      }
    }
  }, [generateConversationTitle])

  // Callback to update conversation meta when messages change - stable reference
  const handleMessagesChange = useCallback((messages: Message[]) => {
    const currentConvId = activeConversationIdRef.current
    if (!currentConvId || !messages.length) return

    const lastMessage = messages[0] // newest first
    updateConversationMetaRef.current(currentConvId, {
      lastMessagePreview: lastMessage?.text?.slice(0, 100) || null,
      updatedAt: new Date().toISOString(),
    })
  }, [])

  // Messages hook - now uses conversationId
  const {
    messages,
    setMessages,
    listRef,
    isMountedRef,
    scrollToBottom,
    saveMessages,
    totalToken,
    remainTokens,
  } = useMessages({
    conversationId: activeConversationId,
    onMessagesChange: handleMessagesChange,
  })

  // Model setup hook
  const {
    modelRef,
    modelStatus,
    downloadProgress,
    selectedModelId,
    setupModel,
    removeModel: removeModelFromDevice,
    removeModelById,
  } = useModelSetup({ initialModelId: modelId })

  // Message streaming hook
  const {
    isLoading,
    handleSend: streamHandleSend,
    abortStream,
  } = useMessageStream({
    modelRef,
    isMountedRef,
    messages,
    setMessages,
    scrollToBottom,
    useContextHistory,
  })

  /**
   * Handle sending a message
   */
  const handleSend = useCallback(() => {
    const text = inputText.trim()
    if (!text || modelStatus !== "ready") return

    // If no active conversation, create one first
    if (!activeConversationId) {
      const newId = createConversation()
      if (!newId) return
    }

    setInputTextState("")
    streamHandleSend(text)

    // Save messages after sending
    setTimeout(() => {
      saveMessages()
    }, 100)
  }, [
    inputText,
    modelStatus,
    activeConversationId,
    createConversation,
    streamHandleSend,
    saveMessages,
  ])

  /**
   * Create a new conversation (new chat)
   */
  const handleNewConversation = useCallback(() => {
    // Save current messages before creating new conversation
    saveMessages()
    createConversation()
  }, [saveMessages, createConversation])

  /**
   * Remove model and clear all associated conversations
   */
  const removeModel = useCallback(async () => {
    // Delete all conversations for this model
    deleteAllConversations()

    setMessages([])
    await removeModelFromDevice()
  }, [deleteAllConversations, setMessages, removeModelFromDevice])

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      abortStream()
      saveMessages()
    }
  }, [abortStream, saveMessages])

  // Derived state
  const modelLoadingState: ModelLoadingState =
    modelStatus === "downloading" || modelStatus === "preparing" ? modelStatus : "idle"

  const selectedModelName = useMemo(() => {
    return model?.name || null
  }, [model])

  // Generate conversation title from active conversation
  const conversationTitle = useMemo(() => {
    return activeConversation?.title || null
  }, [activeConversation])

  return {
    // Messages
    messages,
    inputText,
    setInputText,
    handleSend,
    isLoading,
    listRef,

    // Model
    modelStatus,
    modelLoadingState,
    downloadProgress,
    setupModel,
    removeModel,
    removeModelById,
    selectedModel: model || null,
    selectedModelId,
    selectedModelName,
    model: modelRef.current,

    // Conversations
    conversations,
    activeConversationId,
    activeConversation,
    conversationTitle,
    createConversation: handleNewConversation,
    selectConversation,
    deleteConversation,
    generateMissingTitles,

    // Context
    useContextHistory,
    setUseContextHistory,
    totalToken,
    remainTokens,
  }
}
