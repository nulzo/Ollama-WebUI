import MarkdownRenderer from '@/features/markdown/components/markdown';
import React, { useEffect, useState } from 'react';

interface AnimatedTextProps {
  text: string;
  delayPerChar?: number;
}

const AnimatedText: React.FC<AnimatedTextProps> = ({ text, delayPerChar = 20 }) => {
  // Track the "stable" portion of text that's already been rendered
  const [stableText, setStableText] = useState('');
  
  useEffect(() => {
    if (!text) return;

    // If this is a completely new message, reset stable text
    if (!text.startsWith(stableText)) {
      setStableText('');
      return;
    }

    // After a delay, mark the current text as stable
    const timeout = setTimeout(() => {
      setStableText(text);
    }, 100); // Short delay before considering text "stable"

    return () => clearTimeout(timeout);
  }, [text]);

  // The new chunk is whatever text comes after our stable text
  const newChunk = text.slice(stableText.length);

  return (
    <div className="relative">
      {/* Render the stable text normally */}
      <MarkdownRenderer markdown={stableText} />
      
      {/* Animate in the new chunk */}
      {newChunk.split("").map((char, index) => (
        <span
          key={stableText.length + index}
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

export default AnimatedText;