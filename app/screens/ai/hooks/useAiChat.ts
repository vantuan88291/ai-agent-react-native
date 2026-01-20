import { useCallback, useRef, useState, useEffect, useMemo } from "react"
import { FlatList } from "react-native"
import { llama } from "@react-native-ai/llama"
import { useRoute } from "@react-navigation/native"
import { streamText } from "ai"

import { AppStackScreenProps } from "@/navigators/navigationTypes"
import { Message, ModelLoadingState, ModelStatus } from "@/screens/ai/hooks/models"

const SCROLL_THROTTLE_MS = 200
const SCROLL_DEBOUNCE_MS = 100

const ERROR_MESSAGE = "Sorry, an error occurred. Please try again."

const createMessage = (text: string, isUser: boolean): Message => ({
  id: `${Date.now()}-${Math.random()}`,
  text,
  isUser,
  timestamp: new Date(),
})

export const useAiChat = () => {
  const route = useRoute<AppStackScreenProps<"ai">["route"]>()
  const model = route.params?.model
  const modelId = model?.id || null
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputTextState] = useState("")
  const [modelStatus, setModelStatus] = useState<ModelStatus>("not_setup")
  const [downloadProgress, setDownloadProgress] = useState<number>(0)
  const [selectedModelId, setSelectedModelId] = useState<string | null>(modelId)
  const [useContextHistory, setUseContextHistory] = useState<boolean>(true)
  const modelRef = useRef<any>(null)
  const isSetupInProgressRef = useRef<boolean>(false)
  const isMountedRef = useRef<boolean>(true)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const streamAbortControllerRef = useRef<AbortController | null>(null)

  const setInputText = useCallback((text: string) => {
    setInputTextState(text)
  }, [])
  const [isLoading, setIsLoading] = useState(false)
  const listRef = useRef<FlatList<Message>>(null)

  const scrollToBottomDebounced = useCallback(() => {
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current)
    scrollTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) listRef.current?.scrollToEnd({ animated: true })
    }, SCROLL_DEBOUNCE_MS)
  }, [])

  /**
   * Handle sending a message
   */
  const handleSend = useCallback(async () => {
    if (!inputText.trim() || isLoading || modelStatus !== "ready" || !modelRef.current) {
      return
    }

    const userMessageText = inputText.trim()
    setInputTextState("")

    const userMessage = createMessage(userMessageText, true)
    const aiMessage = createMessage("", false)
    const aiMessageId = aiMessage.id

    // Calculate messages for context (before state update)
    const messagesWithNewUser = [...messages, userMessage, aiMessage]

    setMessages((prev) => [...prev, userMessage, aiMessage])
    setIsLoading(true)

    scrollToBottomDebounced()

    // Create abort controller for cleanup
    const abortController = new AbortController()
    streamAbortControllerRef.current = abortController

    try {
      const model = modelRef.current
      if (!model || !isMountedRef.current) {
        return
      }

      // Format messages for AI SDK if context history is enabled
      const streamParams = useContextHistory
        ? {
            model,
            messages: messagesWithNewUser
              .filter((msg) => msg.id !== aiMessageId && msg.text.trim())
              .map((msg) => ({
                role: msg.isUser ? ("user" as const) : ("assistant" as const),
                content: msg.text,
              })),
          }
        : {
            model,
            prompt: userMessageText,
          }
      const { textStream } = streamText(streamParams)

      let fullText = ""
      let lastScrollTime = 0
      let started = false
      // Stream and update message as text comes in
      for await (const delta of textStream) {
        if (!started) {
          fullText = delta
          started = true
        } else {
          fullText += delta
        }

        // Update AI message with streaming text
        setMessages((prev) =>
          prev.map((msg) => (msg.id === aiMessageId ? { ...msg, text: fullText } : msg)),
        )

        // Throttle scroll updates during streaming
        const now = Date.now()
        if (now - lastScrollTime > SCROLL_THROTTLE_MS) {
          scrollToBottomDebounced()
          lastScrollTime = now
        }
      }

      if (isMountedRef.current && !abortController.signal.aborted) {
        setIsLoading(false)
        scrollToBottomDebounced()
      }
    } catch (error) {
      if (!isMountedRef.current || abortController.signal.aborted) {
        return
      }

      console.error("[useAiChat] Error streaming AI response:", error)

      setMessages((prev) =>
        prev.map((msg) => (msg.id === aiMessageId ? { ...msg, text: ERROR_MESSAGE } : msg)),
      )

      setIsLoading(false)
      scrollToBottomDebounced()
    } finally {
      streamAbortControllerRef.current = null
    }
  }, [inputText, isLoading, modelStatus, scrollToBottomDebounced, useContextHistory, messages])

  /**
   * Check if model is already downloaded/prepared
   */
  const checkModelExists = useCallback(
    async (modelId?: string) => {
      try {
        const modelToCheck = modelId || selectedModelId
        if (!modelToCheck) {
          return false
        }

        // Create model instance
        const model = llama.languageModel(modelToCheck)

        // Check if model is already downloaded
        const isDownloaded = await model.isDownloaded()

        if (isDownloaded) {
          await setModelStatus("preparing")
          // Model is downloaded, try to prepare it
          await model.prepare()

          // Model is ready!
          modelRef.current = model
          setSelectedModelId(modelToCheck)
          setModelStatus("ready")
          return true
        }

        // Model not downloaded yet
        console.log("[useAiChat] Model not downloaded yet")
        return false
      } catch (error) {
        // Error checking or preparing model
        console.log("[useAiChat] Error checking model:", error)
        return false
      }
    },
    [selectedModelId],
  )

  /**
   * Remove model from device
   */
  const removeModel = useCallback(async () => {
    try {
      // Unload model if loaded
      if (modelRef.current) {
        try {
          await modelRef.current.unload()
        } catch (error) {
          console.log("[useAiChat] Error unloading model:", error)
        }
        modelRef.current = null
      }

      if (!selectedModelId) {
        return
      }

      // Create model instance to call remove
      const model = llama.languageModel(selectedModelId)

      // Remove model from device
      await model.remove()

      setModelStatus("not_setup")
      setDownloadProgress(0)
      setSelectedModelId(null)
    } catch (error) {
      console.error("[useAiChat] Error removing model:", error)
      // TODO: Handle error - maybe show error message to user
    }
  }, [selectedModelId])

  /**
   * Remove specific model by ID
   */
  const removeModelById = useCallback(
    async (modelId: string) => {
      try {
        // If removing the current selected model and it's ready, use full removeModel
        if (modelId === selectedModelId && modelStatus === "ready") {
          await removeModel()
          return
        }

        // Otherwise, just remove the model file
        const model = llama.languageModel(modelId)
        await model.remove()

        // If removing the saved model, clear state
        if (modelId === selectedModelId) {
          setSelectedModelId(null)
          setModelStatus("not_setup")
        }
      } catch (error) {
        console.error("[useAiChat] Error removing model by ID:", error)
      }
    },
    [selectedModelId, modelStatus, removeModel],
  )

  /**
   * Setup and download model
   */
  const setupModel = useCallback(
    async (modelId: string) => {
      // Prevent concurrent setup calls
      if (isSetupInProgressRef.current) {
        console.warn("[useAiChat] Setup already in progress, ignoring duplicate call")
        return
      }

      // If selecting the same model, do nothing
      if (modelId === selectedModelId && modelStatus === "ready") {
        return
      }

      isSetupInProgressRef.current = true

      try {
        // If selecting a different model, remove the old one first
        if (modelId !== selectedModelId && selectedModelId) {
          try {
            // Unload current model if loaded
            if (modelRef.current) {
              await modelRef.current.unload()
              modelRef.current = null
            }

            // Remove old model file
            const oldModel = llama.languageModel(selectedModelId)
            await oldModel.remove()
          } catch (error) {
            console.error("[useAiChat] Error removing old model:", error)
            // Continue with setup even if removal fails
          }

          // Only update state if still mounted
          if (isMountedRef.current) {
            setModelStatus("not_setup")
            setDownloadProgress(0)
          }
        }

        // Check if still mounted after async operations
        if (!isMountedRef.current) {
          return
        }

        // Start downloading new model
        setModelStatus("downloading")
        setDownloadProgress(0)

        const model = llama.languageModel(modelId)

        // Download model with progress callback (if supported)
        await model.download((event: any) => {
          // Check if event has percentage property and component still mounted
          if (event && typeof event.percentage === "number" && isMountedRef.current) {
            setDownloadProgress(event.percentage)
          }
        })

        // Check if still mounted after download
        if (!isMountedRef.current) {
          return
        }

        setDownloadProgress(100)
        setModelStatus("preparing")

        // Prepare model
        await model.prepare()

        // Only set modelRef and state when model is fully ready and mounted
        if (isMountedRef.current) {
          modelRef.current = model
          setSelectedModelId(modelId)
          setModelStatus("ready")
        }
      } catch (error) {
        console.error("[useAiChat] Error setting up model:", error)
        if (isMountedRef.current) {
          setModelStatus("not_setup")
          setDownloadProgress(0)
        }
      } finally {
        isSetupInProgressRef.current = false
      }
    },
    [modelStatus, selectedModelId],
  )

  /**
   * Load model from navigation params and check on mount
   */
  useEffect(() => {
    if (!isMountedRef.current) return

    // If modelId from params, check if it exists
    if (modelId) {
      // Set selectedModelId to the modelId from params
      setSelectedModelId(modelId)

      // Check if model is already downloaded
      checkModelExists(modelId)
        .then((exists) => {
          // If model doesn't exist, set status to not_setup
          // This will show the setup button in ChatInput
          if (!exists && isMountedRef.current) {
            setModelStatus("not_setup")
          }
        })
        .catch((error) => {
          if (isMountedRef.current) {
            console.error("[useAiChat] Error checking model from params:", error)
            setModelStatus("not_setup")
          }
        })
    } else {
      // If no modelId provided, set to not_setup
      setModelStatus("not_setup")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelId]) // Run when modelId changes

  /**
   * Cleanup: unload model on unmount
   */
  useEffect(() => {
    isMountedRef.current = true

    return () => {
      isMountedRef.current = false

      // Abort any ongoing stream
      if (streamAbortControllerRef.current) {
        streamAbortControllerRef.current.abort()
        streamAbortControllerRef.current = null
      }

      // Clear any pending scroll timeouts
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
        scrollTimeoutRef.current = null
      }

      // Unload model when component unmounts (fire and forget for cleanup)
      if (modelRef.current) {
        // Use promise without await in cleanup - this is intentional
        modelRef.current.unload().catch((error: any) => {
          console.error("[useAiChat] Error unloading model in cleanup:", error)
        })
        modelRef.current = null
      }
    }
  }, [])

  const modelLoadingState: ModelLoadingState =
    modelStatus === "downloading" || modelStatus === "preparing" ? modelStatus : "idle"

  // Get selected model name from route params
  const selectedModelName = useMemo(() => {
    return model?.name || null
  }, [model])

  return {
    messages,
    inputText,
    setInputText,
    handleSend,
    isLoading,
    listRef,
    modelStatus,
    modelLoadingState,
    downloadProgress,
    setupModel,
    removeModel,
    removeModelById,
    selectedModel: model || null,
    selectedModelId,
    selectedModelName,
    useContextHistory,
    setUseContextHistory,
    model: modelRef.current,
  }
}
