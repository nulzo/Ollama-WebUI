import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ArrowDown, Loader2 } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

import { Button } from '@/components/ui/button'
import { Message } from '@/features/chat/components/message'
import { useMessages } from '@/features/chat/api/get-messages'
import { useStreaming } from '@/features/chat/hooks/use-streaming'
import { useChatMutation } from '@/features/chat/hooks/use-chat-mutation'

export function ChatContainer({ conversation_id }: { conversation_id: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [isAtBottom, setIsAtBottom] = useState(true)
  const [isNearTop, setIsNearTop] = useState(false)
  const [hasInitiallyScrolled, setHasInitiallyScrolled] = useState(false)
  const prevMessagesLengthRef = useRef(0)
  const isLoadingMoreRef = useRef(false)
  
  // Get streaming state
  const { isGenerating, content: streamingContent, isWaiting } = useStreaming()
  
  // Get chat mutation for cancel functionality
  const { handleCancel } = useChatMutation(conversation_id)
  
  // Get messages
  const {
    messages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingMessages
  } = useMessages({
    conversation_id,
  })
  
  // Scroll handling functions
  const scrollToBottom = useCallback(() => {
    const container = containerRef.current
    if (!container) return
    
    // With flex-column-reverse, scrolling to bottom means setting scrollTop to 0
    container.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
    
    setIsAtBottom(true)
  }, [])
  
  const scrollToTop = useCallback(() => {
    const container = containerRef.current
    if (!container) return
    
    // With flex-column-reverse, scrolling to top means setting scrollTop to scrollHeight - clientHeight
    container.scrollTo({
      top: container.scrollHeight - container.clientHeight,
      behavior: 'smooth'
    })
    
    setIsAtBottom(false)
    setIsNearTop(true)
  }, [])
  
  const checkScrollPosition = useCallback(() => {
    const container = containerRef.current
    if (!container) return
    
    // With flex-column-reverse, scrollTop of 0 means we're at the bottom
    const atBottom = container.scrollTop < 100
    const nearTop = container.scrollHeight - container.scrollTop - container.clientHeight < 100
    
    setIsAtBottom(atBottom)
    setIsNearTop(nearTop)
  }, [])
  
  // Set up scroll listener
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    
    const handleScroll = () => {
      checkScrollPosition()
    }
    
    container.addEventListener('scroll', handleScroll)
    
    // Initial check
    checkScrollPosition()
    
    return () => {
      container.removeEventListener('scroll', handleScroll)
    }
  }, [checkScrollPosition])
  
  // Auto-scroll to bottom when new messages arrive if user is already at bottom
  useEffect(() => {
    if (isAtBottom && !isFetchingNextPage) {
      scrollToBottom()
    }
  }, [messages?.length, isAtBottom, isFetchingNextPage, scrollToBottom])
  
  // Load more messages when user scrolls to top
  useEffect(() => {
    if (isNearTop && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [hasNextPage, isFetchingNextPage, isNearTop, fetchNextPage])
  
  // Track when we're loading more messages to preserve scroll position
  useEffect(() => {
    isLoadingMoreRef.current = isFetchingNextPage
  }, [isFetchingNextPage])
  
  // Preserve scroll position when loading more messages
  useEffect(() => {
    if (!messages) return
    
    const container = containerRef.current
    if (!container) return
    
    // If we have more messages than before and we were loading more
    if (messages.length > prevMessagesLengthRef.current && isLoadingMoreRef.current) {
      // Calculate how many new messages were added
      const newMessagesCount = messages.length - prevMessagesLengthRef.current
      
      // Get an estimate of the height of the new messages
      const avgMessageHeight = 100 // Rough estimate in pixels
      const additionalScrollHeight = newMessagesCount * avgMessageHeight
      
      // Adjust scroll position to account for new messages
      container.scrollTop += additionalScrollHeight
    }
    
    // Update the previous length reference
    prevMessagesLengthRef.current = messages.length
  }, [messages?.length])
  
  // Update scroll button visibility
  useEffect(() => {
    if (containerRef.current) {
      setShowScrollButton(!isAtBottom)
    }
  }, [isAtBottom, messages])
  
  // Mark as initially scrolled after first render
  useEffect(() => {
    if (!hasInitiallyScrolled) {
      setHasInitiallyScrolled(true)
      scrollToBottom()
    }
  }, [hasInitiallyScrolled, scrollToBottom])
  
  const handleScrollToBottom = useCallback(() => {
    scrollToBottom()
  }, [scrollToBottom])
  
  const allMessages = useMemo(() => {
    const result = messages || []
    
    // Add placeholder assistant message when generating
    if (isGenerating) {
      // Find the last user message to get model information
      const lastUserMessage = [...result].reverse().find(msg => msg.role === 'user')
      
      // Create a placeholder assistant message
      const placeholderMessage = {
        id: 'placeholder',
        role: 'assistant',
        content: streamingContent || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        model: lastUserMessage?.model,
        name: lastUserMessage?.name || 'Assistant',
        conversation_uuid: conversation_id,
        has_images: false
      }
      
      result.push(placeholderMessage)
    }
    
    return result
  }, [messages, isGenerating, streamingContent, conversation_id])

  return (
    <div
      ref={containerRef}
      className="flex flex-col-reverse h-full overflow-y-auto overflow-x-hidden"
      data-testid="chat-container"
      style={{ 
        scrollBehavior: isGenerating || isFetchingNextPage ? 'auto' : 'smooth'
      }}
    >
      <div className="flex flex-col min-h-full">
        <div className="flex flex-col">
          {allMessages.map((message, index) => (
            <Message 
              key={message.id} 
              message={message} 
              isTyping={
                isGenerating &&
                index === allMessages.length - 1 &&
                message.role === 'assistant' &&
                !isWaiting
              }
              isWaiting={
                isGenerating &&
                index === allMessages.length - 1 &&
                message.role === 'assistant' &&
                isWaiting
              }
              isLoading={false}
            />
          ))}

          {isLoadingMessages && (
            <div className="flex justify-center items-center p-4">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          )}

          {hasNextPage && !isLoadingMessages && (
            <div className="flex justify-center p-2">
              <Button
                variant="outline"
                size="sm"
                onClick={scrollToTop}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Load More"
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showScrollButton && (
          <motion.div
            className="absolute bottom-24 right-8 z-10"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            <Button
              size="icon"
              className="h-8 w-8 rounded-full shadow-md"
              onClick={handleScrollToBottom}
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute top-0 right-0 p-2">
        <AnimatePresence>
          {isGenerating && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              className="bg-background"
            >
              Cancel
            </Button>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}