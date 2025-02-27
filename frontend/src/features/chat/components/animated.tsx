import MarkdownRenderer from '@/features/markdown/components/markdown';
import React, { useEffect, useState, useRef } from 'react';

interface AnimatedTextProps {
  text: string;
  delayPerChar?: number;
}

const AnimatedText: React.FC<AnimatedTextProps> = ({ text, delayPerChar = 20 }) => {
  // Track the "stable" portion of text that's already been rendered
  const [stableText, setStableText] = useState('');
  const timeoutRef = useRef<number | null>(null);
  
  useEffect(() => {
    if (!text) return;

    // If this is a completely new message, reset stable text
    if (!text.startsWith(stableText)) {
      setStableText('');
    }

    // After a delay, mark the current text as stable
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = window.setTimeout(() => {
      setStableText(text);
      timeoutRef.current = null;
    }, 100); // Short delay before considering text "stable"

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [text, stableText]);

  // The new chunk is whatever text comes after our stable text
  const newChunk = text.slice(stableText.length);

  // Use React.memo to prevent unnecessary re-renders of the markdown content
  const MemoizedMarkdown = React.memo(({ content }: { content: string }) => (
    <MarkdownRenderer markdown={content} />
  ));

  return (
    <div className="relative">
      {/* Render the stable text with memoization */}
      <MemoizedMarkdown content={stableText} />
      
      {/* Animate in the new chunk */}
      {newChunk.split("").map((char, index) => (
        <span
          key={`${stableText.length}-${index}`}
          className="inline-block opacity-0 animate-violent-slam"
          style={{
            animationDelay: `${index * delayPerChar}ms`,
            ...(char === " " ? { width: "0.25em" } : {}),
          }}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </div>
  );
};

// Export as memoized component to prevent unnecessary re-renders
export default React.memo(AnimatedText);