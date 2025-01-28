import React, { useState } from 'react';
import { ChevronDown, Brain, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ThinkBlockProps {
  children: React.ReactNode;
  isComplete?: boolean;
}

export const ThinkBlock: React.FC<ThinkBlockProps> = ({ children, isComplete = false }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="my-1 rounded-lg border bg-secondary/75 backdrop-blur-sm overflow-hidden">
      <button
        onClick={() => isComplete && setIsExpanded(!isExpanded)}
        className={cn(
          "sticky top-0 w-full flex items-center justify-between px-4 py-2.5",
          "bg-muted/50 border-b transition-colors duration-200 z-10",
          isComplete && "hover:bg-muted/70 cursor-pointer"
        )}
      >
        <div className="flex items-center gap-2">
          {isComplete ? (
            <Brain className="w-4 h-4 text-primary" />
          ) : (
            <Loader2 className="w-4 h-4 text-primary animate-spin" />
          )}
          <span className="text-sm font-medium">
            {isComplete ? "Reasoning complete" : "Reasoning in progress..."}
          </span>
        </div>
        {isComplete && (
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </motion.div>
        )}
      </button>

      <AnimatePresence initial={false}>
        {(isExpanded || !isComplete) && (
          <motion.div
            initial={false}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="max-h-72 text-sm text-muted-foreground overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent"
          >
            <div className="p-4 prose prose-sm max-w-none prose-pre:my-0">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};