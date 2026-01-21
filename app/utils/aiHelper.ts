import { llama } from "@react-native-ai/llama"
import { generateText } from "ai"

export interface PromptOptions {
  /**
   * Array of messages for conversation context
   * Only used if useContextHistory is true
   */
  messages?: Array<{
    role: "user" | "assistant"
    content: string
  }>
}

/**
 * Helper function to interact with an AI model
 * @param modelId - The ID of the model to use (e.g., "bartowski/Llama-3.2-3B-Instruct-GGUF/Llama-3.2-3B-Instruct-Q3_K_L.gguf")
 * @param prompt - The prompt/question to send to the AI
 * @param options - Optional configuration for the prompt
 * @returns Promise<string> - The AI's response text
 * @throws Error if model is not downloaded/prepared or if AI request fails
 *
 * @example
 * ```typescript
 * // Simple prompt
 * const response = await promptAI("model-id", "What is React Native?")
 *
 * // With conversation context
 * const response = await promptAI("model-id", "", {
 *   useContextHistory: true,
 *   messages: [
 *     { role: "user", content: "Hello" },
 *     { role: "assistant", content: "Hi there!" },
 *     { role: "user", content: "What is React?" }
 *   ]
 * })
 * ```
 */
export const promptAI = async (
  modelId: string,
  prompt: string,
  options?: PromptOptions,
): Promise<string> => {
  try {
    // Create model instance
    const model = llama.languageModel(modelId)

    // Check if model is downloaded
    const isDownloaded = await model.isDownloaded()
    if (!isDownloaded) {
      throw new Error(`Model ${modelId} is not downloaded. Please download it first.`)
    }

    // Prepare model if not already prepared
    // Note: prepare() is idempotent, safe to call multiple times
    try {
      await model.prepare()
    } catch (error) {
      // If prepare fails, model might already be prepared or there's an issue
      console.warn("[aiHelper] Model prepare warning:", error)
    }

    // Prepare parameters
    const params = options?.messages
      ? {
          model,
          messages: options.messages,
        }
      : {
          model,
          prompt,
        }

    // Generate full text response (non-streaming)
    // generateText returns full text immediately without streaming
    const { text } = await generateText(params)

    return text
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error("[aiHelper] Error prompting AI:", error)
    throw new Error(`Failed to get AI response: ${errorMessage}`)
  }
}

/**
 * Helper function to check if a model is ready to use
 * @param modelId - The ID of the model to check
 * @returns Promise<boolean> - True if model is downloaded and ready, false otherwise
 */
export const isModelReady = async (modelId: string): Promise<boolean> => {
  try {
    const model = llama.languageModel(modelId)
    const isDownloaded = await model.isDownloaded()
    return isDownloaded
  } catch (error) {
    console.error("[aiHelper] Error checking model readiness:", error)
    return false
  }
}

/**
 * Helper function to ensure model is ready before use
 * Will download and prepare model if needed
 * @param modelId - The ID of the model to ensure
 * @param onProgress - Optional callback for download progress (0-100)
 * @returns Promise<void>
 * @throws Error if model setup fails
 */
export const ensureModelReady = async (
  modelId: string,
  onProgress?: (progress: number) => void,
): Promise<void> => {
  try {
    const model = llama.languageModel(modelId)

    // Check if already downloaded
    const isDownloaded = await model.isDownloaded()
    if (!isDownloaded) {
      // Download model
      await model.download((event: any) => {
        if (event && typeof event.percentage === "number" && onProgress) {
          onProgress(event.percentage)
        }
      })
    }

    // Prepare model
    await model.prepare()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error("[aiHelper] Error ensuring model ready:", error)
    throw new Error(`Failed to setup model: ${errorMessage}`)
  }
}
