import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ChatContainer } from './chat-container';
import { ChatInput } from './chat-input';
import { useChatMutation } from '../hooks/use-chat-mutation';
import { useStreaming } from '../hooks/use-streaming';
import { useConversation } from '../api/get-conversation';
import { Loader2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export function ChatPage() {
  const { id: conversationId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [input, setInput] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const isNewChat = useMemo(() => !conversationId, [conversationId]);
  
  // Get conversation details if we have an ID
  const { data: conversation, isLoading: isLoadingConversation, error } = useConversation({
    conversation_id: conversationId || '',
    // Only fetch if not a new chat
    ...(isNewChat ? { skip: true } : {})
  });
  
  // Set up chat mutation
  const { handleSubmit, isLoading: isSendingMessage } = useChatMutation(conversationId);
  
  // Get streaming state
  const { 
    isGenerating, 
    conversationId: streamingConversationId,
    isTyping,
    setTypingSpeed
  } = useStreaming();
  
  // Set typing speed based on device performance
  useEffect(() => {
    // Adjust typing speed based on device performance
    // Higher values = faster typing
    const isHighPerformanceDevice = window.navigator.hardwareConcurrency > 4;
    setTypingSpeed(isHighPerformanceDevice ? 15 : 8);
  }, [setTypingSpeed]);
  
  // Handle image upload
  const handleImageUpload = (imageData: string[]) => {
    setImages(prev => [...prev, ...imageData]);
  };
  
  // Handle image removal
  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };
  
  // Handle form submission
  const onSubmit = () => {
    if (!input.trim() || isGenerating) return;
    
    handleSubmit(input, images);
    setInput('');
    setImages([]);
  };
  
  // If we're on a non-existent conversation, redirect to new chat
  useEffect(() => {
    // Only redirect if:
    // 1. We're not on a new chat page
    // 2. We're not still loading
    // 3. We have an error or no conversation data
    // 4. We have a valid conversationId (to prevent unnecessary redirects)
    if (
      !isNewChat && 
      !isLoadingConversation && 
      (!conversation || error) && 
      conversationId?.trim()
    ) {
      navigate('/chat');
    }
  }, [conversation, isLoadingConversation, isNewChat, navigate, error, conversationId]);
  
  // Handle navigation to new conversation after creation
  useEffect(() => {
    if (isNewChat && streamingConversationId) {
      navigate(`/chat/${streamingConversationId}`, { replace: true });
    }
  }, [isNewChat, streamingConversationId, navigate]);
  
  // Show loading state while fetching conversation
  if (!isNewChat && isLoadingConversation) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  return (
    <motion.div 
      className="flex flex-col h-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {isNewChat ? (
            <motion.div 
              key="new-chat"
              className="flex flex-col items-center justify-center h-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="max-w-md text-center mb-8">
                <h1 className="text-2xl font-bold mb-2">Start a new chat</h1>
                <p className="text-muted-foreground">
                  Send a message to start a conversation with the AI assistant
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="existing-chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChatContainer conversation_id={conversationId || ''} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <ChatInput
        input={input}
        setInput={setInput}
        onSubmit={onSubmit}
        isGenerating={isGenerating}
        position={isNewChat ? 'center' : 'bottom'}
        placeholder={isNewChat ? 'Send a message to start a new chat' : 'Send a message...'}
        onImageUpload={handleImageUpload}
        onRemoveImage={handleRemoveImage}
        uploadedImages={images}
      />
    </motion.div>
  );
} 