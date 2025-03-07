import { Button } from "@/components/ui/button";
import { Brain, Lightbulb, Sparkles, Coffee } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSettings } from "@/features/settings/api/get-settings";
import { usePrompts } from "@/features/chat/api/get-default-prompts";
import { useEffect, useState } from "react";
import { Prompt } from "@/features/chat/types/conversation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useQueryClient } from "@tanstack/react-query";

type ThemeType = 'casual' | 'creative' | 'inspirational' | 'analytical';

interface CannedQuestionsProps {
  theme: ThemeType;
  onQuestionClick: (question: string) => void;
  onThemeChange: (theme: ThemeType) => void;
}

// Prompt button component with tooltip
const PromptButton = ({ prompt, onSelect }: { prompt: Prompt, onSelect: (prompt: string) => void }) => {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSelect(prompt.prompt)}
            className="hover:bg-secondary rounded-full hover:text-secondary-foreground transition-colors"
          >
            {prompt.simple_prompt}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <p className="text-sm">{prompt.prompt}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

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

// Default static questions as fallback with simple prompts
const defaultQuestions: Record<ThemeType, Prompt[]> = {
  creative: [
    { title: "Creative Writing", prompt: "Write a short story about a dragon", simple_prompt: "Dragon story", style: "creative" },
    { title: "Superhero Design", prompt: "Design a unique superhero", simple_prompt: "New superhero", style: "creative" },
    { title: "Musical Innovation", prompt: "Invent a new musical instrument", simple_prompt: "New instrument", style: "creative" }
  ],
  inspirational: [
    { title: "Motivational Quote", prompt: "Share a motivational quote", simple_prompt: "Motivational quote", style: "inspirational" },
    { title: "Goal Achievement", prompt: "How can I achieve my goals?", simple_prompt: "Achieve goals", style: "inspirational" },
    { title: "Overcoming Challenges", prompt: "Tell me about overcoming challenges", simple_prompt: "Overcome challenges", style: "inspirational" }
  ],
  analytical: [
    { title: "Quantum Computing", prompt: "Explain quantum computing", simple_prompt: "Quantum computing", style: "analytical" },
    { title: "Market Analysis", prompt: "Analyze market trends", simple_prompt: "Market trends", style: "analytical" },
    { title: "Algorithm Comparison", prompt: "Compare different algorithms", simple_prompt: "Compare algorithms", style: "analytical" }
  ],
  casual: [
    { title: "Daily Check-in", prompt: "How's your day going?", simple_prompt: "Your day", style: "casual" },
    { title: "Hobby Discussion", prompt: "What's your favorite hobby?", simple_prompt: "Favorite hobby", style: "casual" },
    { title: "Fun Facts", prompt: "Tell me a fun fact", simple_prompt: "Fun fact", style: "casual" }
  ],
};

export default function CannedQuestions({ theme, onQuestionClick, onThemeChange }: CannedQuestionsProps) {
  const queryClient = useQueryClient();
  const { data: settingsData, isLoading: isLoadingSettings, refetch: refetchSettings } = useSettings();
  const useLlmGenerated = settingsData?.settings?.prompt_settings?.use_llm_generated || false;
  const promptModel = settingsData?.settings?.prompt_settings?.model || "llama3.2:3b";
  
  // Force refetch settings when component mounts
  useEffect(() => {
    console.log("CannedQuestions mounted, refetching settings");
    // Force refetch settings from server
    refetchSettings();
    // Also invalidate the settings cache to ensure fresh data
    queryClient.invalidateQueries({ queryKey: ['settings'] });
  }, [refetchSettings, queryClient]);
  
  // Debug settings
  console.log("Settings data:", settingsData);
  console.log("Use LLM generated:", useLlmGenerated);
  console.log("Prompt model from settings:", promptModel);
  
  const [prompts, setPrompts] = useState<Prompt[]>(defaultQuestions[theme]);
  
  // Ensure we're using the correct model from settings
  const modelToUse = promptModel;
  console.log("Model to use for prompts:", modelToUse);
  
  // Force refetch when promptModel changes
  const queryKey = ['prompts', theme, modelToUse];
  
  console.log("About to call usePrompts with:", { theme, model: modelToUse, queryKey });
  const { data: promptsData, isLoading, error, refetch } = usePrompts({
    style: theme,
    model: modelToUse,
    queryConfig: {
      enabled: !isLoadingSettings && !!modelToUse, // Only enable when settings are loaded and model is available
      retry: 2,
      staleTime: 0, // Always refetch to ensure we have the latest data
    },
  });
  
  // Force refetch prompts when model changes
  useEffect(() => {
    if (modelToUse) {
      console.log("Model changed to:", modelToUse);
      console.log("Forcing refetch of prompts with new model");
      // Invalidate prompts cache
      queryClient.invalidateQueries({ queryKey: queryKey });
      // Refetch prompts with new model
      refetch();
    }
  }, [modelToUse, refetch, queryClient, queryKey]);
  
  // Debug prompts data
  console.log("Prompts data:", promptsData);
  console.log("Is loading:", isLoading);
  console.log("Error:", error);
  console.log("Provider:", promptsData?.metadata?.provider);
  console.log("Model used:", promptsData?.metadata?.model);
  
  useEffect(() => {
    console.log("useEffect triggered with:", { theme, promptsData });
    if (promptsData?.prompts && promptsData.prompts.length > 0) {
      console.log("Using API-provided prompts:", promptsData.prompts);
      setPrompts(promptsData.prompts);
    } else {
      console.log("Using default questions for theme:", theme);
      // Fallback to default questions
      setPrompts(defaultQuestions[theme]);
    }
  }, [theme, promptsData]);

  // Ensure we always have prompts to display
  const displayPrompts = prompts.length > 0 ? prompts : defaultQuestions[theme];
  console.log("Final display prompts:", displayPrompts);

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
              displayPrompts.map((prompt, index) => (
                <PromptButton key={index} prompt={prompt} onSelect={onQuestionClick} />
              ))
            ) : (
              displayPrompts.map((prompt, index) => (
                <PromptButton key={index} prompt={prompt} onSelect={onQuestionClick} />
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