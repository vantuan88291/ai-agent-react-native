import { useCallback, useRef, useState, useEffect, useMemo } from "react"
import { FlatList, Keyboard, Platform } from "react-native"

import { Message, getMessagesKey } from "@/screens/ai/hooks/models"
import { load, save } from "@/utils/storage"

const SCROLL_DEBOUNCE_MS = 100

export const createMessage = (text: string, isUser: boolean): Message => ({
  id: `${Date.now()}-${Math.random()}`,
  text,
  isUser,
  timestamp: new Date(),
  includeInContext: true,
  remainTokens: 0,
})

interface UseMessagesOptions {
  conversationId?: string | null
  onMessagesChange?: (messages: Message[]) => void
}

export const useMessages = (options: UseMessagesOptions = {}) => {
  const { conversationId, onMessagesChange } = options

  const [messagesState, setMessagesState] = useState<Message[]>([])

  const msgRef = useRef<Message[]>([])
  const listRef = useRef<FlatList<Message>>(null)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isMountedRef = useRef<boolean>(true)
  const prevConversationIdRef = useRef<string | null | undefined>(undefined)
  const onMessagesChangeRef = useRef(onMessagesChange)
  const conversationIdRef = useRef(conversationId)

  // Keep refs in sync
  useEffect(() => {
    onMessagesChangeRef.current = onMessagesChange
  }, [onMessagesChange])

  useEffect(() => {
    conversationIdRef.current = conversationId
  }, [conversationId])

  // Custom setMessages that syncs msgRef immediately
  const setMessages = useCallback((updater: React.SetStateAction<Message[]>) => {
    setMessagesState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater
      msgRef.current = next
      return next
    })
  }, [])

  const messages = messagesState

  const scrollToBottomDebounced = useCallback(() => {
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current)
    scrollTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        listRef.current?.scrollToOffset({ offset: 0, animated: true })
      }
    }, SCROLL_DEBOUNCE_MS)
  }, [])

  const scrollToBottom = useCallback(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true })
  }, [])

  /**
   * Save messages to storage - uses refs to maintain stable reference
   */
  const saveMessages = useCallback(() => {
    const currentConvId = conversationIdRef.current
    if (!currentConvId || !msgRef.current?.length) return

    const storageKey = getMessagesKey(currentConvId)
    save(
      storageKey,
      [...msgRef.current]
        .map((m) => ({ ...m, includeInContext: m?.includeInContext !== false }))
        .reverse(),
    )

    // Notify parent about changes (for updating conversation meta)
    onMessagesChangeRef.current?.(msgRef.current)
  }, []) // Empty deps - uses refs for latest values

  /**
   * Update a specific message by ID
   */
  const updateMessage = useCallback(
    (messageId: string, updater: (msg: Message) => Message) => {
      setMessages((prev) => prev.map((msg) => (msg.id === messageId ? updater(msg) : msg)))
    },
    [setMessages],
  )

  /**
   * Add messages to the beginning (newest first for inverted list)
   */
  const prependMessages = useCallback(
    (...newMessages: Message[]) => {
      setMessages((prev) => [...newMessages, ...prev])
    },
    [setMessages],
  )

  /**
   * Calculate total tokens from context messages
   */
  const totalToken = useMemo(() => {
    return messages
      .filter((item) => item.includeInContext)
      .map((item) => item.text)
      .join("").length
  }, [messages])

  /**
   * Get remaining tokens from the last message
   */
  const remainTokens = useMemo(() => {
    return messages?.[messages?.length - 1]?.remainTokens
  }, [messages])

  /**
   * Load messages when conversationId changes
   */
  useEffect(() => {
    isMountedRef.current = true

    // Save previous conversation messages before switching
    if (prevConversationIdRef.current && prevConversationIdRef.current !== conversationId) {
      const prevKey = getMessagesKey(prevConversationIdRef.current)
      if (msgRef.current?.length) {
        save(
          prevKey,
          [...msgRef.current]
            .map((m) => ({ ...m, includeInContext: m?.includeInContext !== false }))
            .reverse(),
        )
      }
    }

    // Load messages for new conversation
    if (conversationId) {
      const storageKey = getMessagesKey(conversationId)
      const listMsg = load<Message[]>(storageKey) || []
      if (listMsg?.length) {
        // Storage is chronological; state is newest-first
        setMessages(
          [...listMsg]
            .map((m) => ({ ...m, includeInContext: m?.includeInContext !== false }))
            .reverse(),
        )
      } else {
        setMessages([])
      }
    } else {
      setMessages([])
    }

    prevConversationIdRef.current = conversationId

    // Keyboard listener for auto-scroll
    function onKeyboardDidShow() {
      setTimeout(() => {
        scrollToBottomDebounced()
      }, 500)
    }

    const showSubscription = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      onKeyboardDidShow,
    )

    return () => {
      showSubscription.remove()

      // Persist messages on unmount
      if (conversationId && msgRef.current?.length) {
        const storageKey = getMessagesKey(conversationId)
        save(
          storageKey,
          [...msgRef.current]
            .map((m) => ({ ...m, includeInContext: m?.includeInContext !== false }))
            .reverse(),
        )
      }

      msgRef.current = []
      isMountedRef.current = false

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
        scrollTimeoutRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId])

  return {
    messages,
    setMessages,
    listRef,
    msgRef,
    isMountedRef,
    updateMessage,
    prependMessages,
    scrollToBottom,
    scrollToBottomDebounced,
    saveMessages,
    totalToken,
    remainTokens,
  }
}
