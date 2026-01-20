export interface Message {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
}

export type ModelLoadingState = "idle" | "downloading" | "preparing"
export type ModelStatus = "not_setup" | "downloading" | "preparing" | "ready"

export interface ModelInfo {
  id: string
  name: string
  size: string
}

export const AVAILABLE_MODELS: ModelInfo[] = [
  // TinyGemma3 - Smallest models
  {
    id: "ggml-org/tinygemma3-GGUF/tinygemma3-Q8_0.gguf",
    name: "tinygemma3-Q8_0.gguf",
    size: "47.2 MB",
  },
  // Falcon-H1-Tiny-90M models
  {
    id: "tiiuae/Falcon-H1-Tiny-90M-Instruct-GGUF/Falcon-H1-Tiny-90M-Instruct-Q3_K.gguf",
    name: "Falcon-H1-Tiny-90M-Instruct-Q3_K.gguf",
    size: "49.7 MB",
  },
  {
    id: "tiiuae/Falcon-H1-Tiny-90M-Instruct-GGUF/Falcon-H1-Tiny-90M-Instruct-Q3_K_M.gguf",
    name: "Falcon-H1-Tiny-90M-Instruct-Q3_K_M.gguf",
    size: "49.7 MB",
  },
  {
    id: "tiiuae/Falcon-H1-Tiny-90M-Instruct-GGUF/Falcon-H1-Tiny-90M-Instruct-Q3_K_L.gguf",
    name: "Falcon-H1-Tiny-90M-Instruct-Q3_K_L.gguf",
    size: "51.8 MB",
  },
  {
    id: "tiiuae/Falcon-H1-Tiny-90M-Instruct-GGUF/Falcon-H1-Tiny-90M-Instruct-IQ4_XS.gguf",
    name: "Falcon-H1-Tiny-90M-Instruct-IQ4_XS.gguf",
    size: "55.3 MB",
  },
  {
    id: "tiiuae/Falcon-H1-Tiny-90M-Instruct-GGUF/Falcon-H1-Tiny-90M-Instruct-Q4_0.gguf",
    name: "Falcon-H1-Tiny-90M-Instruct-Q4_0.gguf",
    size: "57.2 MB",
  },
  {
    id: "tiiuae/Falcon-H1-Tiny-90M-Instruct-GGUF/Falcon-H1-Tiny-90M-Instruct-Q4_K_S.gguf",
    name: "Falcon-H1-Tiny-90M-Instruct-Q4_K_S.gguf",
    size: "57.4 MB",
  },
  {
    id: "tiiuae/Falcon-H1-Tiny-90M-Instruct-GGUF/Falcon-H1-Tiny-90M-Instruct-IQ4_NL.gguf",
    name: "Falcon-H1-Tiny-90M-Instruct-IQ4_NL.gguf",
    size: "57.5 MB",
  },
  {
    id: "tiiuae/Falcon-H1-Tiny-90M-Instruct-GGUF/Falcon-H1-Tiny-90M-Instruct-Q4_K.gguf",
    name: "Falcon-H1-Tiny-90M-Instruct-Q4_K.gguf",
    size: "58.6 MB",
  },
  {
    id: "tiiuae/Falcon-H1-Tiny-90M-Instruct-GGUF/Falcon-H1-Tiny-90M-Instruct-Q4_K_M.gguf",
    name: "Falcon-H1-Tiny-90M-Instruct-Q4_K_M.gguf",
    size: "58.6 MB",
  },
  {
    id: "tiiuae/Falcon-H1-Tiny-90M-Instruct-GGUF/Falcon-H1-Tiny-90M-Instruct-Q4_1.gguf",
    name: "Falcon-H1-Tiny-90M-Instruct-Q4_1.gguf",
    size: "61.8 MB",
  },
  {
    id: "tiiuae/Falcon-H1-Tiny-90M-Instruct-GGUF/Falcon-H1-Tiny-90M-Instruct-Q5_0.gguf",
    name: "Falcon-H1-Tiny-90M-Instruct-Q5_0.gguf",
    size: "66.5 MB",
  },
  {
    id: "tiiuae/Falcon-H1-Tiny-90M-Instruct-GGUF/Falcon-H1-Tiny-90M-Instruct-Q5_K_S.gguf",
    name: "Falcon-H1-Tiny-90M-Instruct-Q5_K_S.gguf",
    size: "66.5 MB",
  },
  {
    id: "tiiuae/Falcon-H1-Tiny-90M-Instruct-GGUF/Falcon-H1-Tiny-90M-Instruct-Q5_K.gguf",
    name: "Falcon-H1-Tiny-90M-Instruct-Q5_K.gguf",
    size: "67.2 MB",
  },
  {
    id: "tiiuae/Falcon-H1-Tiny-90M-Instruct-GGUF/Falcon-H1-Tiny-90M-Instruct-Q5_K_M.gguf",
    name: "Falcon-H1-Tiny-90M-Instruct-Q5_K_M.gguf",
    size: "67.2 MB",
  },
  {
    id: "tiiuae/Falcon-H1-Tiny-90M-Instruct-GGUF/Falcon-H1-Tiny-90M-Instruct-Q5_1.gguf",
    name: "Falcon-H1-Tiny-90M-Instruct-Q5_1.gguf",
    size: "71.1 MB",
  },
  {
    id: "tiiuae/Falcon-H1-Tiny-90M-Instruct-GGUF/Falcon-H1-Tiny-90M-Instruct-Q6_K.gguf",
    name: "Falcon-H1-Tiny-90M-Instruct-Q6_K.gguf",
    size: "76.3 MB",
  },
  {
    id: "tiiuae/Falcon-H1-Tiny-90M-Instruct-GGUF/Falcon-H1-Tiny-90M-Instruct-Q8_0.gguf",
    name: "Falcon-H1-Tiny-90M-Instruct-Q8_0.gguf",
    size: "98.4 MB",
  },
  // TinyMistral-248M models
  {
    id: "M4-ai/TinyMistral-248M-v2-Instruct-GGUF/TinyMistral-248M-v2-Instruct.Q2_K.gguf",
    name: "TinyMistral-248M-v2-Instruct.Q2_K.gguf",
    size: "105 MB",
  },
  {
    id: "M4-ai/TinyMistral-248M-v2-Instruct-GGUF/TinyMistral-248M-v2-Instruct.Q3_K_M.gguf",
    name: "TinyMistral-248M-v2-Instruct.Q3_K_M.gguf",
    size: "129 MB",
  },
  {
    id: "M4-ai/TinyMistral-248M-v2-Instruct-GGUF/TinyMistral-248M-v2-Instruct.Q4_K_M.gguf",
    name: "TinyMistral-248M-v2-Instruct.Q4_K_M.gguf",
    size: "156 MB",
  },
  {
    id: "M4-ai/TinyMistral-248M-v2-Instruct-GGUF/TinyMistral-248M-v2-Instruct.Q5_K_M.gguf",
    name: "TinyMistral-248M-v2-Instruct.Q5_K_M.gguf",
    size: "179 MB",
  },
  {
    id: "tiiuae/Falcon-H1-Tiny-90M-Instruct-GGUF/Falcon-H1-Tiny-90M-Instruct-BF16.gguf",
    name: "Falcon-H1-Tiny-90M-Instruct-BF16.gguf",
    size: "184 MB",
  },
  {
    id: "M4-ai/TinyMistral-248M-v2-Instruct-GGUF/TinyMistral-248M-v2-Instruct.Q6_K.gguf",
    name: "TinyMistral-248M-v2-Instruct.Q6_K.gguf",
    size: "204 MB",
  },
  {
    id: "M4-ai/TinyMistral-248M-v2-Instruct-GGUF/TinyMistral-248M-v2-Instruct.Q8_0.gguf",
    name: "TinyMistral-248M-v2-Instruct.Q8_0.gguf",
    size: "264 MB",
  },
  // TinyLlama-1.1B models
  {
    id: "TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF/tinyllama-1.1b-chat-v1.0.Q2_K.gguf",
    name: "tinyllama-1.1b-chat-v1.0.Q2_K.gguf",
    size: "483 MB",
  },
  {
    id: "TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF/tinyllama-1.1b-chat-v1.0.Q3_K_S.gguf",
    name: "tinyllama-1.1b-chat-v1.0.Q3_K_S.gguf",
    size: "500 MB",
  },
  {
    id: "TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF/tinyllama-1.1b-chat-v1.0.Q3_K_M.gguf",
    name: "tinyllama-1.1b-chat-v1.0.Q3_K_M.gguf",
    size: "551 MB",
  },
  {
    id: "TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF/tinyllama-1.1b-chat-v1.0.Q3_K_L.gguf",
    name: "tinyllama-1.1b-chat-v1.0.Q3_K_L.gguf",
    size: "593 MB",
  },
  {
    id: "TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF/tinyllama-1.1b-chat-v1.0.Q4_0.gguf",
    name: "tinyllama-1.1b-chat-v1.0.Q4_0.gguf",
    size: "638 MB",
  },
  {
    id: "TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF/tinyllama-1.1b-chat-v1.0.Q4_K_S.gguf",
    name: "tinyllama-1.1b-chat-v1.0.Q4_K_S.gguf",
    size: "644 MB",
  },
  {
    id: "TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf",
    name: "tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf",
    size: "669 MB",
  },
  {
    id: "TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF/tinyllama-1.1b-chat-v1.0.Q5_0.gguf",
    name: "tinyllama-1.1b-chat-v1.0.Q5_0.gguf",
    size: "767 MB",
  },
  {
    id: "TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF/tinyllama-1.1b-chat-v1.0.Q5_K_S.gguf",
    name: "tinyllama-1.1b-chat-v1.0.Q5_K_S.gguf",
    size: "767 MB",
  },
  {
    id: "TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF/tinyllama-1.1b-chat-v1.0.Q5_K_M.gguf",
    name: "tinyllama-1.1b-chat-v1.0.Q5_K_M.gguf",
    size: "783 MB",
  },
  {
    id: "TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF/tinyllama-1.1b-chat-v1.0.Q6_K.gguf",
    name: "tinyllama-1.1b-chat-v1.0.Q6_K.gguf",
    size: "904 MB",
  },
  {
    id: "TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF/tinyllama-1.1b-chat-v1.0.Q8_0.gguf",
    name: "tinyllama-1.1b-chat-v1.0.Q8_0.gguf",
    size: "1.17 GB",
  },
  // Llama-3.2-3B models
  {
    id: "bartowski/Llama-3.2-3B-Instruct-GGUF/Llama-3.2-3B-Instruct-IQ3_M.gguf",
    name: "Llama-3.2-3B-Instruct-IQ3_M.gguf",
    size: "1.6GB",
  },
  {
    id: "Qwen/Qwen2.5-3B-Instruct-GGUF/qwen2.5-3b-instruct-q3_k_m.gguf",
    name: "qwen2.5-3b-instruct-q3_k_m.gguf",
    size: "1.72GB",
  },
  {
    id: "bartowski/Llama-3.2-3B-Instruct-GGUF/Llama-3.2-3B-Instruct-Q3_K_L.gguf",
    name: "Llama-3.2-3B-Instruct-Q3_K_L.gguf",
    size: "1.82GB",
  },
  {
    id: "bartowski/Llama-3.2-3B-Instruct-GGUF/Llama-3.2-3B-Instruct-IQ4_XS.gguf",
    name: "Llama-3.2-3B-Instruct-IQ4_XS.gguf",
    size: "1.83GB",
  },
  {
    id: "mradermacher/DeepSeek-R1-Distill-Qwen-7B-Uncensored-i1-GGUF/DeepSeek-R1-Distill-Qwen-7B-Uncensored.i1-IQ1_S.gguf",
    name: "DeepSeek-R1-Distill-Qwen-7B-Uncensored.i1-IQ1_S.gguf",
    size: "1.9GB",
  },
  {
    id: "bartowski/Llama-3.2-3B-Instruct-GGUF/Llama-3.2-3B-Instruct-Q3_K_XL.gguf",
    name: "Llama-3.2-3B-Instruct-Q3_K_XL.gguf",
    size: "1.91GB",
  },
  {
    id: "bartowski/Llama-3.2-3B-Instruct-GGUF/Llama-3.2-3B-Instruct-Q4_0.gguf",
    name: "Llama-3.2-3B-Instruct-Q4_0.gguf",
    size: "1.92GB",
  },
  {
    id: "bartowski/Llama-3.2-3B-Instruct-GGUF/Llama-3.2-3B-Instruct-Q4_0_4_4.gguf",
    name: "Llama-3.2-3B-Instruct-Q4_0_4_4.gguf",
    size: "1.92GB",
  },
  {
    id: "bartowski/Llama-3.2-3B-Instruct-GGUF/Llama-3.2-3B-Instruct-Q4_0_4_8.gguf",
    name: "Llama-3.2-3B-Instruct-Q4_0_4_8.gguf",
    size: "1.92GB",
  },
  {
    id: "bartowski/Llama-3.2-3B-Instruct-GGUF/Llama-3.2-3B-Instruct-Q4_0_8_8.gguf",
    name: "Llama-3.2-3B-Instruct-Q4_0_8_8.gguf",
    size: "1.92GB",
  },
  {
    id: "ggml-org/SmolLM3-3B-GGUF/SmolLM3-Q4_K_M.gguf",
    name: "SmolLM3-Q4_K_M.gguf",
    size: "1.92GB",
  },
  {
    id: "bartowski/Llama-3.2-3B-Instruct-GGUF/Llama-3.2-3B-Instruct-Q4_K_S.gguf",
    name: "Llama-3.2-3B-Instruct-Q4_K_S.gguf",
    size: "1.93GB",
  },
  {
    id: "bartowski/Llama-3.2-3B-Instruct-GGUF/Llama-3.2-3B-Instruct-Q4_K_M.gguf",
    name: "Llama-3.2-3B-Instruct-Q4_K_M.gguf",
    size: "2.02GB",
  },
  {
    id: "bartowski/Llama-3.2-3B-Instruct-GGUF/Llama-3.2-3B-Instruct-Q4_K_L.gguf",
    name: "Llama-3.2-3B-Instruct-Q4_K_L.gguf",
    size: "2.11GB",
  },
  {
    id: "bartowski/Llama-3.2-3B-Instruct-GGUF/Llama-3.2-3B-Instruct-Q5_K_S.gguf",
    name: "Llama-3.2-3B-Instruct-Q5_K_S.gguf",
    size: "2.27GB",
  },
  {
    id: "bartowski/Llama-3.2-3B-Instruct-GGUF/Llama-3.2-3B-Instruct-Q5_K_M.gguf",
    name: "Llama-3.2-3B-Instruct-Q5_K_M.gguf",
    size: "2.32GB",
  },
  {
    id: "microsoft/Phi-3-mini-4k-instruct-gguf/Phi-3-mini-4k-instruct-q4.gguf",
    name: "Phi-3-mini-4k-instruct-q4.gguf",
    size: "2.39GB",
  },
  {
    id: "bartowski/Llama-3.2-3B-Instruct-GGUF/Llama-3.2-3B-Instruct-Q5_K_L.gguf",
    name: "Llama-3.2-3B-Instruct-Q5_K_L.gguf",
    size: "2.42GB",
  },
  {
    id: "bartowski/Llama-3.2-3B-Instruct-GGUF/Llama-3.2-3B-Instruct-Q6_K.gguf",
    name: "Llama-3.2-3B-Instruct-Q6_K.gguf",
    size: "2.64GB",
  },
  {
    id: "bartowski/Llama-3.2-3B-Instruct-GGUF/Llama-3.2-3B-Instruct-Q6_K_L.gguf",
    name: "Llama-3.2-3B-Instruct-Q6_K_L.gguf",
    size: "2.74GB",
  },
  {
    id: "bartowski/Llama-3.2-3B-Instruct-GGUF/Llama-3.2-3B-Instruct-Q8_0.gguf",
    name: "Llama-3.2-3B-Instruct-Q8_0.gguf",
    size: "3.42GB",
  },
  // DeepSeek-R1-0528-Qwen3-8B models
  {
    id: "unsloth/DeepSeek-R1-0528-Qwen3-8B-GGUF/DeepSeek-R1-0528-Qwen3-8B-UD-IQ1_S.gguf",
    name: "DeepSeek-R1-0528-Qwen3-8B-UD-IQ1_S.gguf",
    size: "2.27GB",
  },
  {
    id: "unsloth/DeepSeek-R1-0528-Qwen3-8B-GGUF/DeepSeek-R1-0528-Qwen3-8B-UD-IQ1_M.gguf",
    name: "DeepSeek-R1-0528-Qwen3-8B-UD-IQ1_M.gguf",
    size: "2.39GB",
  },
  {
    id: "unsloth/DeepSeek-R1-0528-Qwen3-8B-GGUF/DeepSeek-R1-0528-Qwen3-8B-UD-IQ2_XXS.gguf",
    name: "DeepSeek-R1-0528-Qwen3-8B-UD-IQ2_XXS.gguf",
    size: "2.6GB",
  },
  {
    id: "unsloth/DeepSeek-R1-0528-Qwen3-8B-GGUF/DeepSeek-R1-0528-Qwen3-8B-UD-IQ2_M.gguf",
    name: "DeepSeek-R1-0528-Qwen3-8B-UD-IQ2_M.gguf",
    size: "3.11GB",
  },
  {
    id: "unsloth/DeepSeek-R1-0528-Qwen3-8B-GGUF/DeepSeek-R1-0528-Qwen3-8B-Q2_K.gguf",
    name: "DeepSeek-R1-0528-Qwen3-8B-Q2_K.gguf",
    size: "3.28GB",
  },
  {
    id: "unsloth/DeepSeek-R1-0528-Qwen3-8B-GGUF/DeepSeek-R1-0528-Qwen3-8B-UD-IQ3_XXS.gguf",
    name: "DeepSeek-R1-0528-Qwen3-8B-UD-IQ3_XXS.gguf",
    size: "3.41GB",
  },
  {
    id: "unsloth/DeepSeek-R1-0528-Qwen3-8B-GGUF/DeepSeek-R1-0528-Qwen3-8B-Q2_K_L.gguf",
    name: "DeepSeek-R1-0528-Qwen3-8B-Q2_K_L.gguf",
    size: "3.43GB",
  },
  {
    id: "unsloth/DeepSeek-R1-0528-Qwen3-8B-GGUF/DeepSeek-R1-0528-Qwen3-8B-UD-Q2_K_XL.gguf",
    name: "DeepSeek-R1-0528-Qwen3-8B-UD-Q2_K_XL.gguf",
    size: "3.5GB",
  },
  {
    id: "unsloth/DeepSeek-R1-0528-Qwen3-8B-GGUF/DeepSeek-R1-0528-Qwen3-8B-Q3_K_S.gguf",
    name: "DeepSeek-R1-0528-Qwen3-8B-Q3_K_S.gguf",
    size: "3.77GB",
  },
  {
    id: "unsloth/DeepSeek-R1-0528-Qwen3-8B-GGUF/DeepSeek-R1-0528-Qwen3-8B-Q3_K_M.gguf",
    name: "DeepSeek-R1-0528-Qwen3-8B-Q3_K_M.gguf",
    size: "4.12GB",
  },
  {
    id: "unsloth/DeepSeek-R1-0528-Qwen3-8B-GGUF/DeepSeek-R1-0528-Qwen3-8B-UD-Q3_K_XL.gguf",
    name: "DeepSeek-R1-0528-Qwen3-8B-UD-Q3_K_XL.gguf",
    size: "4.31GB",
  },
  {
    id: "unsloth/DeepSeek-R1-0528-Qwen3-8B-GGUF/DeepSeek-R1-0528-Qwen3-8B-IQ4_XS.gguf",
    name: "DeepSeek-R1-0528-Qwen3-8B-IQ4_XS.gguf",
    size: "4.58GB",
  },
  {
    id: "unsloth/DeepSeek-R1-0528-Qwen3-8B-GGUF/DeepSeek-R1-0528-Qwen3-8B-IQ4_NL.gguf",
    name: "DeepSeek-R1-0528-Qwen3-8B-IQ4_NL.gguf",
    size: "4.79GB",
  },
  {
    id: "unsloth/DeepSeek-R1-0528-Qwen3-8B-GGUF/DeepSeek-R1-0528-Qwen3-8B-Q4_0.gguf",
    name: "DeepSeek-R1-0528-Qwen3-8B-Q4_0.gguf",
    size: "4.79GB",
  },
  {
    id: "unsloth/DeepSeek-R1-0528-Qwen3-8B-GGUF/DeepSeek-R1-0528-Qwen3-8B-Q4_K_S.gguf",
    name: "DeepSeek-R1-0528-Qwen3-8B-Q4_K_S.gguf",
    size: "4.8GB",
  },
  {
    id: "unsloth/DeepSeek-R1-0528-Qwen3-8B-GGUF/DeepSeek-R1-0528-Qwen3-8B-Q4_K_M.gguf",
    name: "DeepSeek-R1-0528-Qwen3-8B-Q4_K_M.gguf",
    size: "5.03GB",
  },
  {
    id: "unsloth/DeepSeek-R1-0528-Qwen3-8B-GGUF/DeepSeek-R1-0528-Qwen3-8B-UD-Q4_K_XL.gguf",
    name: "DeepSeek-R1-0528-Qwen3-8B-UD-Q4_K_XL.gguf",
    size: "5.12GB",
  },
  {
    id: "unsloth/DeepSeek-R1-0528-Qwen3-8B-GGUF/DeepSeek-R1-0528-Qwen3-8B-Q4_1.gguf",
    name: "DeepSeek-R1-0528-Qwen3-8B-Q4_1.gguf",
    size: "5.25GB",
  },
  {
    id: "unsloth/DeepSeek-R1-0528-Qwen3-8B-GGUF/DeepSeek-R1-0528-Qwen3-8B-Q5_K_S.gguf",
    name: "DeepSeek-R1-0528-Qwen3-8B-Q5_K_S.gguf",
    size: "5.72GB",
  },
  {
    id: "unsloth/DeepSeek-R1-0528-Qwen3-8B-GGUF/DeepSeek-R1-0528-Qwen3-8B-Q5_K_M.gguf",
    name: "DeepSeek-R1-0528-Qwen3-8B-Q5_K_M.gguf",
    size: "5.85GB",
  },
  {
    id: "unsloth/DeepSeek-R1-0528-Qwen3-8B-GGUF/DeepSeek-R1-0528-Qwen3-8B-UD-Q5_K_XL.gguf",
    name: "DeepSeek-R1-0528-Qwen3-8B-UD-Q5_K_XL.gguf",
    size: "5.88GB",
  },
  {
    id: "unsloth/DeepSeek-R1-0528-Qwen3-8B-GGUF/DeepSeek-R1-0528-Qwen3-8B-Q6_K.gguf",
    name: "DeepSeek-R1-0528-Qwen3-8B-Q6_K.gguf",
    size: "6.73GB",
  },
  {
    id: "unsloth/DeepSeek-R1-0528-Qwen3-8B-GGUF/DeepSeek-R1-0528-Qwen3-8B-Q8_0.gguf",
    name: "DeepSeek-R1-0528-Qwen3-8B-Q8_0.gguf",
    size: "8.71GB",
  },
  // oh-dcft-v3.1-gpt-4o-mini models
  {
    id: "mradermacher/oh-dcft-v3.1-gpt-4o-mini-GGUF/oh-dcft-v3.1-gpt-4o-mini.Q2_K.gguf",
    name: "oh-dcft-v3.1-gpt-4o-mini.Q2_K.gguf",
    size: "3.18GB",
  },
  {
    id: "mradermacher/oh-dcft-v3.1-gpt-4o-mini-GGUF/oh-dcft-v3.1-gpt-4o-mini.Q3_K_S.gguf",
    name: "oh-dcft-v3.1-gpt-4o-mini.Q3_K_S.gguf",
    size: "3.66GB",
  },
  {
    id: "mradermacher/oh-dcft-v3.1-gpt-4o-mini-GGUF/oh-dcft-v3.1-gpt-4o-mini.Q3_K_M.gguf",
    name: "oh-dcft-v3.1-gpt-4o-mini.Q3_K_M.gguf",
    size: "4.02GB",
  },
  {
    id: "mradermacher/oh-dcft-v3.1-gpt-4o-mini-GGUF/oh-dcft-v3.1-gpt-4o-mini.Q3_K_L.gguf",
    name: "oh-dcft-v3.1-gpt-4o-mini.Q3_K_L.gguf",
    size: "4.32GB",
  },
  {
    id: "mradermacher/oh-dcft-v3.1-gpt-4o-mini-GGUF/oh-dcft-v3.1-gpt-4o-mini.IQ4_XS.gguf",
    name: "oh-dcft-v3.1-gpt-4o-mini.IQ4_XS.gguf",
    size: "4.48GB",
  },
  {
    id: "mradermacher/oh-dcft-v3.1-gpt-4o-mini-GGUF/oh-dcft-v3.1-gpt-4o-mini.Q4_0_4_4.gguf",
    name: "oh-dcft-v3.1-gpt-4o-mini.Q4_0_4_4.gguf",
    size: "4.66GB",
  },
  {
    id: "mradermacher/oh-dcft-v3.1-gpt-4o-mini-GGUF/oh-dcft-v3.1-gpt-4o-mini.Q4_K_S.gguf",
    name: "oh-dcft-v3.1-gpt-4o-mini.Q4_K_S.gguf",
    size: "4.69GB",
  },
  {
    id: "mradermacher/oh-dcft-v3.1-gpt-4o-mini-GGUF/oh-dcft-v3.1-gpt-4o-mini.Q4_K_M.gguf",
    name: "oh-dcft-v3.1-gpt-4o-mini.Q4_K_M.gguf",
    size: "4.92GB",
  },
  {
    id: "mradermacher/oh-dcft-v3.1-gpt-4o-mini-GGUF/oh-dcft-v3.1-gpt-4o-mini.Q5_K_S.gguf",
    name: "oh-dcft-v3.1-gpt-4o-mini.Q5_K_S.gguf",
    size: "5.6GB",
  },
  {
    id: "mradermacher/oh-dcft-v3.1-gpt-4o-mini-GGUF/oh-dcft-v3.1-gpt-4o-mini.Q5_K_M.gguf",
    name: "oh-dcft-v3.1-gpt-4o-mini.Q5_K_M.gguf",
    size: "5.73GB",
  },
  {
    id: "mradermacher/oh-dcft-v3.1-gpt-4o-mini-GGUF/oh-dcft-v3.1-gpt-4o-mini.Q6_K.gguf",
    name: "oh-dcft-v3.1-gpt-4o-mini.Q6_K.gguf",
    size: "6.6GB",
  },
]
