import { useState, useEffect, useMemo, useCallback } from "react"
import { llama } from "@react-native-ai/llama"

import {
  AVAILABLE_MODELS,
  ModelInfo,
  ConversationMeta,
  getConversationListKey,
  getMessagesKey,
  getLastConversationKey,
} from "@/screens/ai/hooks/models"
import { fetchAiModels } from "@/services/api"
import { load, remove, save } from "@/utils/storage"

const LIST_MODELS = "LIST_MODELS"
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

interface ApiModelData {
  id: number
  fieldId: string
  fieldName: string
  info1: string | null
}

interface ApiResponse {
  data: Array<{
    id: number
    attributes: {
      data: ApiModelData[]
    }
  }>
}

export const useModels = () => {
  const [models, setModels] = useState<ModelInfo[]>(AVAILABLE_MODELS)
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [downloadedModels, setDownloadedModels] = useState<Set<string>>(new Set())

  const loadModels = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true)
    }

    try {
      const response = await fetchAiModels()

      if (response?.ok && response.data) {
        const apiData = response.data as ApiResponse

        // Extract models from API response
        if (apiData.data && apiData.data.length > 0) {
          const apiModels = apiData.data[0].attributes?.data

          if (apiModels && apiModels.length > 0) {
            // Map API response to ModelInfo format
            const mappedModels: ModelInfo[] = apiModels.map((item) => ({
              id: item.fieldId,
              name: item.fieldName,
              size: item.info1 || "0 MB",
            }))

            save(LIST_MODELS, mappedModels)
            setModels(mappedModels)
            if (isRefresh) {
              setIsRefreshing(false)
            }
            return
          }
        }
      }

      // Fallback to AVAILABLE_MODELS if API fails or no data
      console.log("[useModels] API failed or no data, using fallback")
      setModels(AVAILABLE_MODELS)
    } catch (error) {
      console.error("[useModels] Error loading models:", error)
      // Fallback to AVAILABLE_MODELS on error
      setModels(AVAILABLE_MODELS)
    } finally {
      if (isRefresh) {
        setIsRefreshing(false)
      }
    }
  }, [])

  useEffect(() => {
    loadModels(false)
    // @ts-ignore
    const listCache: any[] = load(LIST_MODELS)
    if (listCache?.length) {
      setModels(listCache)
    }
  }, [loadModels])

  const sortedModels = useMemo(() => {
    const sorted = [...models].sort((a, b) => {
      const sizeA = parseSizeToBytes(a.size)
      const sizeB = parseSizeToBytes(b.size)
      return sortOrder === "asc" ? sizeA - sizeB : sizeB - sizeA
    })
    return sorted
  }, [models, sortOrder])

  const toggleSortOrder = useCallback(() => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
  }, [])

  const refresh = useCallback(() => {
    loadModels(true)
  }, [loadModels])

  const checkModelStatus = useCallback(async (modelId: string): Promise<boolean> => {
    try {
      const model = llama.languageModel(modelId)
      const isDownloaded = await model.isDownloaded()
      return isDownloaded
    } catch (error) {
      console.error(`[useModels] Error checking model ${modelId}:`, error)
      return false
    }
  }, [])

  const checkAllModels = useCallback(async () => {
    if (sortedModels.length === 0) return

    const statusPromises = sortedModels.map(async (model) => {
      const isDownloaded = await checkModelStatus(model.id)
      return { modelId: model.id, isDownloaded }
    })

    const results = await Promise.all(statusPromises)
    const downloadedSet = new Set<string>()

    results.forEach(({ modelId, isDownloaded }) => {
      if (isDownloaded) {
        downloadedSet.add(modelId)
      }
    })

    setDownloadedModels(downloadedSet)
  }, [sortedModels, checkModelStatus])

  useEffect(() => {
    if (sortedModels.length > 0) {
      checkAllModels()
    }
  }, [sortedModels, checkAllModels])

  const isModelDownloaded = useCallback(
    (modelId: string) => {
      return downloadedModels.has(modelId)
    },
    [downloadedModels],
  )

  const refreshDownloadStatus = useCallback(() => {
    checkAllModels()
  }, [checkAllModels])

  const removeModel = useCallback(
    async (modelId: string) => {
      try {
        const model = llama.languageModel(modelId)
        await model.remove()

        // Remove all conversations for this model
        try {
          // Load conversation list
          const listKey = getConversationListKey(modelId)
          const conversations = load<ConversationMeta[]>(listKey) || []

          // Remove all message keys for each conversation
          conversations.forEach((conv) => {
            remove(getMessagesKey(conv.id))
          })

          // Remove conversation list and last conversation keys
          remove(listKey)
          remove(getLastConversationKey(modelId))

          // Also try to remove legacy key (if exists from before migration)
          remove(modelId)
        } catch (error) {
          console.error(`[useModels] Error removing conversations for ${modelId}:`, error)
        }

        // Refresh download status after removal
        await checkAllModels()
      } catch (error) {
        console.error(`[useModels] Error removing model ${modelId}:`, error)
        throw error
      }
    },
    [checkAllModels],
  )

  // Calculate statistics
  const stats = useMemo(() => {
    const totalModels = sortedModels.length
    const downloadedCount = sortedModels.filter((model) => downloadedModels.has(model.id)).length

    // Calculate total size
    let totalSizeBytes = 0
    sortedModels.forEach((model) => {
      totalSizeBytes += parseSizeToBytes(model.size)
    })

    // Calculate downloaded size
    let downloadedSizeBytes = 0
    sortedModels.forEach((model) => {
      if (downloadedModels.has(model.id)) {
        downloadedSizeBytes += parseSizeToBytes(model.size)
      }
    })

    // Format sizes
    const formatSize = (bytes: number): string => {
      if (bytes >= 1024 * 1024 * 1024) {
        return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
      } else if (bytes >= 1024 * 1024) {
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
      } else if (bytes >= 1024) {
        return `${(bytes / 1024).toFixed(2)} KB`
      }
      return `${bytes} B`
    }

    return {
      totalModels,
      downloadedCount,
      totalSize: formatSize(totalSizeBytes),
      downloadedSize: formatSize(downloadedSizeBytes),
    }
  }, [sortedModels, downloadedModels])

  return {
    models: sortedModels,
    isLoading: false,
    isRefreshing,
    sortOrder,
    toggleSortOrder,
    refresh,
    isModelDownloaded,
    refreshDownloadStatus,
    removeModel,
    stats,
  }
}
