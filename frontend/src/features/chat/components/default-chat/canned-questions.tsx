import { Button } from "@/components/ui/button";
import { Brain, Lightbulb, Sparkles, Coffee } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CannedQuestionsProps {
  theme: string;
  onQuestionClick: (question: string) => void;
  onThemeChange: (theme: string) => void;
}

const themeIcons = {
  creative: {
    icon: Sparkles,
    label: "Creative",
  },
  inspirational: {
    icon: Lightbulb,
    label: "Inspirational",
  },
  analytical: {
    icon: Brain,
    label: "Analytical",
  },
  casual: {
    icon: Coffee,
    label: "Casual",
  },
};

const exampleQuestions: Record<string, string[]> = {
  creative: ["Write a short story about a dragon", "Design a unique superhero", "Invent a new musical instrument"],
  inspirational: ["Share a motivational quote", "How can I achieve my goals?", "Tell me about overcoming challenges"],
  analytical: ["Explain quantum computing", "Analyze market trends", "Compare different algorithms"],
  casual: ["How's your day going?", "What's your favorite hobby?", "Tell me a fun fact"],
};

export default function CannedQuestions({ theme, onQuestionClick, onThemeChange }: CannedQuestionsProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-center gap-3">
        {Object.entries(themeIcons).map(([key, { icon: ThemeIcon, label }]) => (
          <motion.div
            key={key}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              size="sm"
              onClick={() => onThemeChange(key)}
              className={`
                relative group flex flex-col items-center gap-2 p-3 h-auto shadow-none
                transition-all duration-200 bg-background hover:bg-background hover:text-primary
                ${theme === key ? "text-primary stroke-2" : "text-muted-foreground"}
              `}
            >
              <ThemeIcon className="size-3" />
              {/* <span className="text-[10px] font-medium opacity-80">{label}</span> */}
            </Button>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 justify-center min-h-[40px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={theme}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-wrap gap-2 justify-center"
          >
            {exampleQuestions[theme].map((question) => (
              <Button
                key={question}
                variant="outline"
                size="sm"
                onClick={() => onQuestionClick(question)}
                className="rounded-full hover:bg-secondary hover:text-secondary-foreground transition-colors"
              >
                {question}
              </Button>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}