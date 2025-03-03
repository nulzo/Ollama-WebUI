import { Button } from "@/components/ui/button";
import { Brain, Lightbulb, Sparkles, Coffee } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSettings } from "@/features/settings/api/get-settings";
import { usePrompts } from "@/features/chat/api/get-default-prompts";
import { useEffect, useState } from "react";

type ThemeType = 'casual' | 'creative' | 'inspirational' | 'analytical';

interface CannedQuestionsProps {
  theme: ThemeType;
  onQuestionClick: (question: string) => void;
  onThemeChange: (theme: ThemeType) => void;
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

// Default static questions as fallback
const defaultQuestions: Record<ThemeType, string[]> = {
  creative: ["Write a short story about a dragon", "Design a unique superhero", "Invent a new musical instrument"],
  inspirational: ["Share a motivational quote", "How can I achieve my goals?", "Tell me about overcoming challenges"],
  analytical: ["Explain quantum computing", "Analyze market trends", "Compare different algorithms"],
  casual: ["How's your day going?", "What's your favorite hobby?", "Tell me a fun fact"],
};

export default function CannedQuestions({ theme, onQuestionClick, onThemeChange }: CannedQuestionsProps) {
  const { data: settingsData, isLoading: isLoadingSettings } = useSettings();
  const useLlmGenerated = settingsData?.settings?.prompt_settings?.use_llm_generated || false;
  const promptModel = settingsData?.settings?.prompt_settings?.model || "llama3.2:3b";
  
  // Debug settings
  console.log("Settings data:", settingsData);
  console.log("Use LLM generated:", useLlmGenerated);
  console.log("Prompt model:", promptModel);
  
  const [questions, setQuestions] = useState<string[]>(defaultQuestions[theme]);
  
  const { data: promptsData, isLoading, error } = usePrompts({
    style: theme,
    model: promptModel,
    queryConfig: {
      enabled: useLlmGenerated && !isLoadingSettings,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  });
  
  // Debug prompts data
  console.log("Prompts data:", promptsData);
  console.log("Is loading:", isLoading);
  console.log("Error:", error);
  
  useEffect(() => {
    if (useLlmGenerated && promptsData?.prompts && promptsData.prompts.length > 0) {
      console.log("Using LLM-generated prompts:", promptsData.prompts);
      // Extract questions from LLM-generated prompts
      const generatedQuestions = promptsData.prompts.map(prompt => prompt.prompt);
      setQuestions(generatedQuestions);
    } else {
      console.log("Using default questions for theme:", theme);
      // Fallback to default questions
      setQuestions(defaultQuestions[theme]);
    }
  }, [theme, promptsData, useLlmGenerated]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap justify-center gap-2 min-h-[40px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={theme}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-wrap justify-center gap-2"
          >
            {isLoading ? (
              <div className="text-muted-foreground text-sm">Loading prompts...</div>
            ) : error ? (
              <div className="text-red-500 text-sm">Error loading prompts</div>
            ) : (
              questions.map((question) => (
                <Button
                  key={question}
                  variant="outline"
                  size="sm"
                  onClick={() => onQuestionClick(question)}
                  className="hover:bg-secondary rounded-full hover:text-secondary-foreground transition-colors"
                >
                  {question}
                </Button>
              ))
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex justify-center items-center gap-3">
        {(Object.entries(themeIcons) as [ThemeType, { icon: any, label: string }][]).map(([key, { icon: ThemeIcon, label }]) => (
          <motion.div
            key={key}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onThemeChange(key)}
              className={`
                relative group flex flex-col items-center gap-2 p-3 h-auto shadow-none
                transition-all duration-200 hover:text-primary
                ${theme === key ? "text-primary stroke-2 bg-secondary" : "text-muted-foreground"}
              `}
            >
              <ThemeIcon className="size-3" />
              {/* <span className="opacity-80 font-medium text-[10px]">{label}</span> */}
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}