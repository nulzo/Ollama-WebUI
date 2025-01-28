import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';

interface ThinkBlockProps {
  children: React.ReactNode;
}

const ThinkBlock: React.FC<ThinkBlockProps> = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="my-6 rounded-lg border bg-muted/30"
    >
      <div className="flex items-center gap-2 px-4 py-2 border-b bg-muted/50">
        <Brain className="w-4 h-4" />
        <span className="text-sm font-medium">Thinking Process</span>
      </div>
      <div className="p-4 prose-sm">{children}</div>
    </motion.div>
  );
};

export default ThinkBlock;