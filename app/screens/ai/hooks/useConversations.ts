import { useCallback, useState, useEffect, useRef } from "react"

import {
  Message,
  ConversationMeta,
  getConversationListKey,
  getMessagesKey,
  getLastConversationKey,
} from "@/screens/ai/hooks/models"
import { promptAI } from "@/utils/aiHelper"
import { load, save, remove } from "@/utils/storage"

interface UseConversationsOptions {
  modelId?: string
}

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

export const useConversations = (options: UseConversationsOptions = {}) => {
  const { modelId } = options

  const [conversations, setConversations] = useState<ConversationMeta[]>([])
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const isMountedRef = useRef<boolean>(true)
  const conversationsRef = useRef<ConversationMeta[]>([])

  // Sync ref with state
  useEffect(() => {
    conversationsRef.current = conversations
  }, [conversations])

  /**
   * Load conversations list from storage
   */
  const loadConversations = useCallback(() => {
    if (!modelId) return

    const listKey = getConversationListKey(modelId)
    const list = load<ConversationMeta[]>(listKey) || []
    setConversations(list)
    conversationsRef.current = list

    // Load last active conversation
    const lastKey = getLastConversationKey(modelId)
    const lastId = load<string>(lastKey)

    if (lastId && list.find((c) => c.id === lastId)) {
      setActiveConversationId(lastId)
    } else if (list.length > 0) {
      // Use the most recent conversation
      const sorted = [...list].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      )
      setActiveConversationId(sorted[0].id)
    }
  }, [modelId])

  /**
   * Migrate legacy data (messages stored directly under modelId)
   */
  const migrateLegacyData = useCallback(async () => {
    if (!modelId) return false

    // Check if legacy messages exist
    const legacyMessages = load<Message[]>(modelId)
    if (!legacyMessages?.length) return false

    // Check if we already have conversations (already migrated)
    const listKey = getConversationListKey(modelId)
    const existingList = load<ConversationMeta[]>(listKey)
    if (existingList?.length) return false

    console.log("[useConversations] Migrating legacy data for model:", modelId)

    // Create new conversation from legacy data
    const conversationId = generateId()
    const now = new Date().toISOString()

    // Generate summary for title
    let title: string | null = "Chat 1"
    try {
      const summaryResult = await promptAI(modelId, "", {
        messages: [
          ...legacyMessages.slice(0, 5).map((msg) => ({
            role: msg.isUser ? ("user" as const) : ("assistant" as const),
            content: msg.text,
          })),
          {
            role: "user",
            content:
              "Give this conversation a short title (max 5 words), using the same language as the conversation. Only respond with the title, nothing else.",
          },
        ],
      })
      if (summaryResult) {
        title = summaryResult.slice(0, 50)
      }
    } catch (error) {
      console.error("[useConversations] Error generating title:", error)
    }

    const lastMessage = legacyMessages[legacyMessages.length - 1]
    const meta: ConversationMeta = {
      id: conversationId,
      modelId,
      title,
      createdAt: now,
      updatedAt: now,
      lastMessagePreview: lastMessage?.text?.slice(0, 100) || null,
    }

    // Save new conversation data
    const messagesKey = getMessagesKey(conversationId)
    save(messagesKey, legacyMessages)
    save(listKey, [meta])
    save(getLastConversationKey(modelId), conversationId)

    // Remove legacy data
    remove(modelId)

    // Update state
    if (isMountedRef.current) {
      conversationsRef.current = [meta]
      setConversations([meta])
      setActiveConversationId(conversationId)
    }

    return true
  }, [modelId])

  /**
   * Create a new conversation
   */
  const createConversation = useCallback(
    (initialTitle?: string): string | null => {
      if (!modelId) return null

      const conversationId = generateId()
      const now = new Date().toISOString()

      const meta: ConversationMeta = {
        id: conversationId,
        modelId,
        title: initialTitle || null,
        createdAt: now,
        updatedAt: now,
        lastMessagePreview: null,
      }

      const listKey = getConversationListKey(modelId)
      const updatedList = [meta, ...conversationsRef.current]

      save(listKey, updatedList)
      save(getLastConversationKey(modelId), conversationId)

      // Initialize empty messages
      save(getMessagesKey(conversationId), [])

      setConversations(updatedList)
      setActiveConversationId(conversationId)

      return conversationId
    },
    [modelId],
  )

  /**
   * Select/switch to a conversation
   */
  const selectConversation = useCallback(
    (conversationId: string) => {
      if (!modelId) return

      setActiveConversationId(conversationId)
      save(getLastConversationKey(modelId), conversationId)
    },
    [modelId],
  )

  /**
   * Delete a conversation
   */
  const deleteConversation = useCallback(
    (conversationId: string) => {
      if (!modelId) return

      // Remove messages
      remove(getMessagesKey(conversationId))

      // Remove from list
      const listKey = getConversationListKey(modelId)
      const updatedList = conversationsRef.current.filter((c) => c.id !== conversationId)
      save(listKey, updatedList)
      setConversations(updatedList)

      // If deleted active conversation, switch to another
      setActiveConversationId((currentActiveId) => {
        if (currentActiveId === conversationId) {
          if (updatedList.length > 0) {
            const sorted = [...updatedList].sort(
              (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
            )
            save(getLastConversationKey(modelId), sorted[0].id)
            return sorted[0].id
          } else {
            remove(getLastConversationKey(modelId))
            return null
          }
        }
        return currentActiveId
      })
    },
    [modelId],
  )

  /**
   * Update conversation metadata (e.g., after new message)
   * Uses ref to avoid dependency on conversations state - prevents infinite loops
   */
  const updateConversationMeta = useCallback(
    (
      conversationId: string,
      updates: Partial<
        Pick<ConversationMeta, "title" | "summary" | "lastMessagePreview" | "updatedAt">
      >,
    ) => {
      if (!modelId) return

      const listKey = getConversationListKey(modelId)
      const updatedList = conversationsRef.current.map((c) =>
        c.id === conversationId
          ? { ...c, ...updates, updatedAt: updates.updatedAt || new Date().toISOString() }
          : c,
      )

      save(listKey, updatedList)
      conversationsRef.current = updatedList
      setConversations(updatedList)
    },
    [modelId],
  )

  /**
   * Delete all conversations for a model (used when removing model)
   */
  const deleteAllConversations = useCallback(() => {
    if (!modelId) return

    // Delete all message keys
    conversationsRef.current.forEach((c) => {
      remove(getMessagesKey(c.id))
    })

    // Delete list and last conversation keys
    remove(getConversationListKey(modelId))
    remove(getLastConversationKey(modelId))

    conversationsRef.current = []
    setConversations([])
    setActiveConversationId(null)
  }, [modelId])

  /**
   * Get active conversation metadata
   */
  const activeConversation = conversations.find((c) => c.id === activeConversationId) || null

  /**
   * Initialize on mount
   */
  useEffect(() => {
    isMountedRef.current = true

    const init = async () => {
      if (!modelId) return

      // Try migration first
      const migrated = await migrateLegacyData()

      // If not migrated, load existing conversations
      if (!migrated) {
        loadConversations()
      }
    }

    init()

    return () => {
      isMountedRef.current = false
    }
  }, [modelId, migrateLegacyData, loadConversations])

  return {
    conversations,
    activeConversationId,
    activeConversation,
    createConversation,
    selectConversation,
    deleteConversation,
    updateConversationMeta,
    deleteAllConversations,
    loadConversations,
  }
}
