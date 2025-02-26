import { StreamChunk } from '@/types/api';

export type StreamingStatus = 'idle' | 'waiting' | 'streaming' | 'error' | 'complete';

export interface StreamingState {
  status: StreamingStatus;
  content: string;
  error: string | null;
  conversationId: string | null;
  messageId: string | null;
  isTyping: boolean;
  typingSpeed: number;
  contentHeight: number;
}

/**
 * StreamingService manages the state of streaming responses from the API.
 * It uses a pub/sub pattern to notify subscribers of state changes.
 * Enhanced with smooth typing animation and better error handling.
 */
class StreamingService {
  private state: StreamingState = {
    status: 'idle',
    content: '',
    error: null,
    conversationId: null,
    messageId: null,
    isTyping: false,
    typingSpeed: 10, // Characters per frame (adjustable for different models)
    contentHeight: 0,
  };
  
  private listeners: Set<(state: StreamingState) => void> = new Set();
  private abortController: AbortController | null = null;
  private pendingContent: string = '';
  private animationFrameId: number | null = null;
  private contentHeightEstimator: HTMLDivElement | null = null;
  
  constructor() {
    // Set up event listeners for streaming events
    window.addEventListener('message-sent', this.handleMessageSent as EventListener);
    window.addEventListener('message-chunk', this.handleMessageChunk as EventListener);
    window.addEventListener('message-done', this.handleMessageDone as EventListener);
    window.addEventListener('message-cancelled', this.handleMessageCancelled as EventListener);
    window.addEventListener('chat-error', this.handleChatError as EventListener);
    window.addEventListener('conversation-created', this.handleConversationCreated as EventListener);
    window.addEventListener('message-created', this.handleMessageCreated as EventListener);
    
    // Create a hidden div to estimate content height
    this.createHeightEstimator();
  }
  
  private createHeightEstimator() {
    // Create a hidden div to estimate content height
    if (typeof document !== 'undefined') {
      this.contentHeightEstimator = document.createElement('div');
      this.contentHeightEstimator.style.position = 'absolute';
      this.contentHeightEstimator.style.visibility = 'hidden';
      this.contentHeightEstimator.style.left = '-9999px';
      this.contentHeightEstimator.style.width = '700px'; // Approximate width of message container
      this.contentHeightEstimator.style.fontFamily = 'inherit';
      this.contentHeightEstimator.style.fontSize = 'inherit';
      this.contentHeightEstimator.style.lineHeight = 'inherit';
      this.contentHeightEstimator.className = 'prose prose-sm';
      document.body.appendChild(this.contentHeightEstimator);
    }
  }
  
  private estimateContentHeight(content: string): number {
    if (!this.contentHeightEstimator) return 0;
    
    // Set the content and measure the height
    this.contentHeightEstimator.innerHTML = content;
    return this.contentHeightEstimator.offsetHeight;
  }
  
  private handleMessageSent = (event: CustomEvent) => {
    this.cancelAnimation();
    this.pendingContent = '';
    
    this.setState({
      status: 'waiting',
      content: '',
      error: null,
      conversationId: this.state.conversationId,
      messageId: null,
      isTyping: false,
      typingSpeed: this.state.typingSpeed,
      contentHeight: 0,
    });
  };
  
  private handleMessageChunk = (event: CustomEvent) => {
    const { message } = event.detail;
    
    // Only update if we're in a valid state for receiving chunks
    if (this.state.status === 'waiting' || this.state.status === 'streaming') {
      // Add new content to pending buffer
      this.pendingContent += (message.content || '');
      
      // Estimate the final content height to reduce layout shifts
      const fullContent = this.state.content + this.pendingContent;
      const estimatedHeight = this.estimateContentHeight(fullContent);
      
      // Start or continue the smooth typing animation
      if (!this.animationFrameId) {
        this.setState({
          ...this.state,
          status: 'streaming',
          isTyping: true,
          contentHeight: Math.max(this.state.contentHeight, estimatedHeight),
        });
        this.animateTyping();
      } else {
        // Just update the height estimate without triggering a full state update
        this.state.contentHeight = Math.max(this.state.contentHeight, estimatedHeight);
      }
    }
  };
  
  private animateTyping = () => {
    if (this.pendingContent.length > 0) {
      // Calculate how many characters to add this frame
      const charsToAdd = Math.min(this.state.typingSpeed, this.pendingContent.length);
      const nextChunk = this.pendingContent.substring(0, charsToAdd);
      this.pendingContent = this.pendingContent.substring(charsToAdd);
      
      // Update the visible content
      const newContent = this.state.content + nextChunk;
      
      this.setState({
        ...this.state,
        content: newContent,
      });
      
      // Continue animation
      this.animationFrameId = requestAnimationFrame(this.animateTyping);
    } else if (this.state.status === 'streaming') {
      // No more pending content, but still streaming
      this.animationFrameId = requestAnimationFrame(this.animateTyping);
    } else {
      // Done streaming
      this.setState({
        ...this.state,
        isTyping: false,
      });
      this.animationFrameId = null;
    }
  };
  
  private cancelAnimation = () => {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  };
  
  private handleMessageDone = () => {
    // Only update if we're in a streaming state
    if (this.state.status === 'streaming' || this.state.status === 'waiting') {
      // Flush any remaining pending content immediately
      if (this.pendingContent.length > 0) {
        this.setState({
          ...this.state,
          content: this.state.content + this.pendingContent,
        });
        this.pendingContent = '';
      }
      
      // Cancel any ongoing animation
      this.cancelAnimation();
      
      this.setState({
        ...this.state,
        status: 'complete',
        isTyping: false,
      });
    }
  };
  
  private handleMessageCancelled = () => {
    // Cancel any ongoing animation
    this.cancelAnimation();
    
    // Flush any remaining pending content
    if (this.pendingContent.length > 0) {
      this.setState({
        ...this.state,
        content: this.state.content + this.pendingContent,
      });
      this.pendingContent = '';
    }
    
    this.setState({
      ...this.state,
      status: 'idle',
      isTyping: false,
    });
  };
  
  private handleChatError = (event: CustomEvent) => {
    const { error } = event.detail;
    
    // Cancel any ongoing animation
    this.cancelAnimation();
    
    this.setState({
      ...this.state,
      status: 'error',
      error: error || 'An unknown error occurred',
      isTyping: false,
    });
  };
  
  private handleConversationCreated = (event: CustomEvent) => {
    const { uuid } = event.detail;
    
    this.setState({
      ...this.state,
      conversationId: uuid,
    });
  };

  private handleMessageCreated = (event: CustomEvent) => {
    const { id } = event.detail;
    
    this.setState({
      ...this.state,
      messageId: id,
    });
  };
  
  private setState(newState: Partial<StreamingState>) {
    this.state = { ...this.state, ...newState };
    
    // Notify all listeners
    this.listeners.forEach(listener => {
      try {
        listener(this.state);
      } catch (error) {
        console.error('Error in streaming listener:', error);
      }
    });
  }
  
  /**
   * Subscribe to state changes
   * @param listener Function to call when state changes
   * @returns Unsubscribe function
   */
  public subscribe(listener: (state: StreamingState) => void) {
    this.listeners.add(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }
  
  /**
   * Reset the streaming state
   */
  public reset() {
    this.cancelAnimation();
    this.pendingContent = '';
    
    this.setState({
      status: 'idle',
      content: '',
      error: null,
      conversationId: null,
      messageId: null,
      isTyping: false,
      typingSpeed: 10,
      contentHeight: 0,
    });
  }
  
  /**
   * Set the typing speed (characters per frame)
   * @param speed Number of characters to add per animation frame
   */
  public setTypingSpeed(speed: number) {
    this.setState({
      typingSpeed: Math.max(1, Math.min(50, speed)), // Clamp between 1-50
    });
  }
  
  /**
   * Get the current state
   */
  public getState(): StreamingState {
    return { ...this.state };
  }

  /**
   * Set the abort controller for the current request
   */
  public setAbortController(controller: AbortController | null) {
    this.abortController = controller;
  }

  /**
   * Abort the current request
   */
  public abort() {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
      window.dispatchEvent(new CustomEvent('message-cancelled'));
    }
  }
  
  /**
   * Clean up event listeners and animations
   */
  public dispose() {
    this.cancelAnimation();
    window.removeEventListener('message-sent', this.handleMessageSent as EventListener);
    window.removeEventListener('message-chunk', this.handleMessageChunk as EventListener);
    window.removeEventListener('message-done', this.handleMessageDone as EventListener);
    window.removeEventListener('message-cancelled', this.handleMessageCancelled as EventListener);
    window.removeEventListener('chat-error', this.handleChatError as EventListener);
    window.removeEventListener('conversation-created', this.handleConversationCreated as EventListener);
    window.removeEventListener('message-created', this.handleMessageCreated as EventListener);
    
    // Remove the height estimator
    if (this.contentHeightEstimator && document.body.contains(this.contentHeightEstimator)) {
      document.body.removeChild(this.contentHeightEstimator);
    }
  }
}

// Create a singleton instance
export const streamingService = new StreamingService();