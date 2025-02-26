import React, { useEffect, useState, useRef, useCallback } from 'react';
import MarkdownRenderer from '@/features/markdown/components/markdown';

interface AnimatedTextProps {
  text: string;
  isTyping: boolean;
  typingSpeed?: number;
  className?: string;
}

/**
 * AnimatedText component that renders text with a typing animation
 * Similar to ChatGPT's streaming text effect
 */
const AnimatedText: React.FC<AnimatedTextProps> = ({
  text,
  isTyping,
  typingSpeed = 10,
  className = '',
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const animationRef = useRef<number | null>(null);
  const textRef = useRef<string>('');
  const lastUpdateTimeRef = useRef<number>(0);
  const charsPerFrameRef = useRef<number>(1);
  const contentTypeRef = useRef<'text' | 'code' | 'list'>('text');
  
  // Update the ref when text changes to avoid closure issues
  useEffect(() => {
    textRef.current = text;
  }, [text]);
  
  // Reset displayed text when input text changes completely
  useEffect(() => {
    if (!text.startsWith(displayedText) && !text.endsWith(displayedText)) {
      setDisplayedText('');
      setIsComplete(false);
    }
  }, [text, displayedText]);
  
  // Detect content type to adjust typing speed
  const detectContentType = useCallback((content: string): 'text' | 'code' | 'list' => {
    if (content.includes('```') || content.includes('`')) {
      return 'code';
    } else if (content.includes('\n- ') || content.includes('\n1. ')) {
      return 'list';
    }
    return 'text';
  }, []);
  
  const animate = useCallback((timestamp: number) => {
    // Calculate time since last update
    const timeDelta = timestamp - lastUpdateTimeRef.current;
    
    // Only update if enough time has passed (throttle updates for performance)
    if (timeDelta < 16) { // ~60fps
      animationRef.current = requestAnimationFrame(animate);
      return;
    }
    
    lastUpdateTimeRef.current = timestamp;
    
    // Skip if we're already showing the full text
    if (displayedText === textRef.current) {
      setIsComplete(true);
      return;
    }
    
    // Dynamically adjust typing speed based on content
    const remainingText = textRef.current.slice(displayedText.length);
    
    // Detect content type
    contentTypeRef.current = detectContentType(remainingText);
    
    // Adjust typing speed based on content type
    if (contentTypeRef.current === 'code') {
      // Code blocks should appear faster
      charsPerFrameRef.current = Math.max(3, Math.floor(typingSpeed * 2));
    } else if (contentTypeRef.current === 'list') {
      // Lists should appear at medium speed
      charsPerFrameRef.current = Math.max(2, Math.floor(typingSpeed * 1.5));
    } else if (remainingText.includes('\n')) {
      // Newlines should appear faster
      charsPerFrameRef.current = Math.max(2, Math.floor(typingSpeed * 1.2));
    } else {
      charsPerFrameRef.current = typingSpeed;
    }
    
    // Special handling for code blocks - try to complete them faster
    if (remainingText.startsWith('```') && remainingText.includes('\n')) {
      // Find the end of the code block declaration line
      const endOfFirstLine = remainingText.indexOf('\n');
      if (endOfFirstLine > 0) {
        // Show the entire first line of a code block at once
        const nextChunkEnd = displayedText.length + endOfFirstLine + 1;
        setDisplayedText(textRef.current.slice(0, nextChunkEnd));
        animationRef.current = requestAnimationFrame(animate);
        return;
      }
    }
    
    // Only update if we have more text to show
    if (displayedText.length < textRef.current.length) {
      const nextChunkEnd = Math.min(
        displayedText.length + charsPerFrameRef.current,
        textRef.current.length
      );
      const nextText = textRef.current.slice(0, nextChunkEnd);
      
      setDisplayedText(nextText);
      
      // Continue animation if not complete
      if (nextText !== textRef.current) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsComplete(true);
      }
    } else {
      setIsComplete(true);
    }
  }, [displayedText, typingSpeed, detectContentType]);
  
  // Handle typing animation
  useEffect(() => {
    if (!isTyping) {
      // If not typing, show the full text immediately
      setDisplayedText(text);
      setIsComplete(true);
      return;
    }
    
    if (displayedText === text) {
      setIsComplete(true);
      return;
    }
    
    setIsComplete(false);
    
    // Start animation
    animationRef.current = requestAnimationFrame(animate);
    
    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [text, displayedText, isTyping, animate]);
  
  return (
    <div className={className}>
      <MarkdownRenderer markdown={displayedText} />
      {isTyping && !isComplete && (
        <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-0.5" />
      )}
    </div>
  );
};

export default AnimatedText;