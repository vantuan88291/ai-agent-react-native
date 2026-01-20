import { useState, useEffect, useMemo, useCallback } from "react"

import { AVAILABLE_MODELS, ModelInfo } from "@/screens/ai/hooks/models"
import { fetchAiModels } from "@/services/api"

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
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  const loadModels = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true)
    } else {
      setIsLoading(true)
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

            setModels(mappedModels)
            if (isRefresh) {
              setIsRefreshing(false)
            } else {
              setIsLoading(false)
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
      } else {
        setIsLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    loadModels(false)
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

  return {
    models: sortedModels,
    isLoading,
    isRefreshing,
    sortOrder,
    toggleSortOrder,
    refresh,
  }
}
