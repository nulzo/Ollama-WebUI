import React from 'react';
import { useStreaming } from '../hooks/use-streaming';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const StreamingStatus: React.FC = () => {
  const { status, error } = useStreaming();
  
  return (
    <AnimatePresence mode="wait">
      {status !== 'idle' && status !== 'complete' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div className="bg-background border rounded-full shadow-lg px-4 py-2 flex items-center gap-2">
            {status === 'waiting' && (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="text-sm font-medium">Thinking...</span>
              </>
            )}
            
            {status === 'streaming' && (
              <>
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <span className="text-sm font-medium">Generating response...</span>
              </>
            )}
            
            {status === 'error' && (
              <>
                <AlertCircle className="w-4 h-4 text-destructive" />
                <span className="text-sm font-medium text-destructive">{error || 'An error occurred'}</span>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};