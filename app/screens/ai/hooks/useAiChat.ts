import { useCallback, useRef, useState, useEffect, useMemo } from "react"
import { FlatList } from "react-native"
import { llama } from "@react-native-ai/llama"
import { streamText } from "ai"

import {
  Message,
  ModelLoadingState,
  ModelStatus,
  AVAILABLE_MODELS,
  ModelInfo,
} from "@/screens/ai/hooks/models"
import { loadString, remove, saveString } from "@/utils/storage";

const STORAGE_KEY_SELECTED_MODEL = "ai_selected_model_id"
const SCROLL_THROTTLE_MS = 200
const SCROLL_DEBOUNCE_MS = 100

const ERROR_MESSAGE = "Sorry, an error occurred. Please try again."

/**
 * Parse size string to bytes for comparison
 * Examples: "1.04 MB" -> 1090519, "2.39GB" -> 2566914048
 */
const parseSizeToBytes = (sizeStr: string): number => {
  const normalized = sizeStr.trim().toUpperCase()
  const match = normalized.match(/^([\d.]+)\s*(KB|MB|GB)?$/i)
  if (!match) return 0

  const value = parseFloat(match[1])
  const unit = match[2] || ""

  switch (unit) {
    case "GB":
      return value * 1024 * 1024 * 1024
    case "MB":
      return value * 1024 * 1024
    case "KB":
      return value * 1024
    default:
      // If no unit, assume MB
      return value * 1024 * 1024
  }
}

/**
 * Sort models by size (ascending) and move selected model to the top
 */
const sortModels = (models: ModelInfo[], selectedModelId: string | null): ModelInfo[] => {
  // Separate selected model from others
  const selectedModel = selectedModelId ? models.find((m) => m.id === selectedModelId) : null
  const otherModels = selectedModelId ? models.filter((m) => m.id !== selectedModelId) : models

  // Sort by size (ascending)
  const sorted = [...otherModels].sort((a, b) => {
    const sizeA = parseSizeToBytes(a.size)
    const sizeB = parseSizeToBytes(b.size)
    return sizeA - sizeB
  })

  // Put selected model at the top if it exists
  return selectedModel ? [selectedModel, ...sorted] : sorted
}

/**
 * Hook to manage AI chat state and logic
 * @returns An object containing messages, input text, handlers, and loading state
 */
const createMessage = (text: string, isUser: boolean): Message => ({
  id: `${Date.now()}-${Math.random()}`,
  text,
  isUser,
  timestamp: new Date(),
})

export const useAiChat = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputTextState] = useState("")
  const [modelStatus, setModelStatus] = useState<ModelStatus>("not_setup")
  const [downloadProgress, setDownloadProgress] = useState<number>(0)
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null)
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

          // Save selected model ID to storage
          saveString(STORAGE_KEY_SELECTED_MODEL, modelToCheck)

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

      // Remove from storage
      remove(STORAGE_KEY_SELECTED_MODEL)
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

        // If removing the saved model, also clear storage
        if (modelId === selectedModelId) {
          remove(STORAGE_KEY_SELECTED_MODEL)
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

          // Save selected model ID to storage
          saveString(STORAGE_KEY_SELECTED_MODEL, modelId)
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
   * Load saved model and check on mount
   */
  useEffect(() => {
    const savedModelId = loadString(STORAGE_KEY_SELECTED_MODEL)
    if (savedModelId && isMountedRef.current) {
      // Load model ID from storage and check if it exists
      checkModelExists(savedModelId).catch((error) => {
        if (isMountedRef.current) {
          console.error("[useAiChat] Error checking saved model:", error)
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount - checkModelExists is stable

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

  // Sort models by size and move selected model to top
  const sortedModels = useMemo(() => {
    return sortModels(AVAILABLE_MODELS, selectedModelId)
  }, [selectedModelId])

  // Get selected model name
  const selectedModelName = useMemo(() => {
    if (!selectedModelId) return null
    const model = AVAILABLE_MODELS.find((m) => m.id === selectedModelId)
    return model?.name || null
  }, [selectedModelId])

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
    selectedModelId,
    selectedModelName,
    useContextHistory,
    setUseContextHistory,
    model: modelRef.current,
    sortedModels,
  }
}
