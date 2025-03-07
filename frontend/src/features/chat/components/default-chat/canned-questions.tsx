import { Button } from "@/components/ui/button";
import { Brain, Lightbulb, Sparkles, Coffee, RotateCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSettings } from "@/features/settings/api/get-settings";
import { usePrompts } from "@/features/chat/api/get-default-prompts";
import { useEffect, useState, useRef } from "react";
import { Prompt } from "@/features/chat/types/conversation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

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

// Skeleton loader for prompt buttons
const PromptButtonSkeleton = () => {
  return (
    <div className="animate-pulse">
      <Skeleton className="opacity-70 rounded-full w-24 h-8" />
    </div>
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
  const { data: settingsData, isLoading: isLoadingSettings } = useSettings();
  
  // The correct path might be different - check all possible paths
  const promptSettings = 
    // Try different possible paths to find prompt_settings
    settingsData?.settings?.prompt_settings || 
    (settingsData as any)?.data?.settings?.prompt_settings || 
    (settingsData as any)?.data?.prompt_settings ||
    (settingsData as any)?.prompt_settings || 
    {};
  
  // Ensure use_llm_generated is treated as a boolean
  let useLlmGenerated = false;
  if ((promptSettings as any).use_llm_generated !== undefined) {
    if (typeof (promptSettings as any).use_llm_generated === 'string') {
      useLlmGenerated = (promptSettings as any).use_llm_generated.toLowerCase() === 'true';
    } else {
      useLlmGenerated = Boolean((promptSettings as any).use_llm_generated);
    }
  }
  
  const promptModel = (promptSettings as any).model || "llama3.2:3b";
  
  // Track previous model to prevent unnecessary refetches
  const prevModelRef = useRef(promptModel);
  const prevThemeRef = useRef(theme);
  
  const [prompts, setPrompts] = useState<Prompt[]>(defaultQuestions[theme]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Only fetch prompts if LLM generation is enabled
  const shouldFetchPrompts = useLlmGenerated && !isLoadingSettings && !!promptModel;
  
  // Use the API to get prompts when LLM generation is enabled
  const { data: promptsData, isLoading, refetch } = usePrompts({
    style: theme,
    model: promptModel,
    queryConfig: {
      enabled: shouldFetchPrompts,
      retry: 1,
      staleTime: 5 * 60 * 1000, // Cache for 5 minutes
      gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    },
  });
  
  // Force a refetch when shouldFetchPrompts changes from false to true
  const prevShouldFetchRef = useRef(shouldFetchPrompts);
  useEffect(() => {
    // Only refetch if shouldFetchPrompts changed from false to true
    // and we haven't already fetched data
    if (shouldFetchPrompts && !prevShouldFetchRef.current && !promptsData) {
      refetch();
    }
    prevShouldFetchRef.current = shouldFetchPrompts;
  }, [shouldFetchPrompts, refetch, promptsData]);

  // Update prompts when theme or data changes
  useEffect(() => {
    // Only update if theme changed or we have new data
    const themeChanged = theme !== prevThemeRef.current;
    const modelChanged = promptModel !== prevModelRef.current;
    
    // Update refs
    prevThemeRef.current = theme;
    prevModelRef.current = promptModel;
    
    // If theme changed, immediately update with default questions
    if (themeChanged) {
      setPrompts(defaultQuestions[theme]);
    }
    
    // If LLM generation is enabled and we have API data, use it
    if (shouldFetchPrompts && promptsData?.prompts && promptsData.prompts.length > 0) {
      // Limit to 3 prompts
      const limitedPrompts = promptsData.prompts.slice(0, 3);
      setPrompts(limitedPrompts);
    } else if (themeChanged || modelChanged) {
      // If no API data but theme or model changed, use defaults (limited to 3)
      setPrompts(defaultQuestions[theme].slice(0, 3));
    }
  }, [theme, promptsData, promptModel, shouldFetchPrompts]);

  // Handle manual refresh of prompts
  const handleRefresh = async () => {
    if (!shouldFetchPrompts) return;
    
    setIsRefreshing(true);
    try {
      // Invalidate the cache and refetch
      await queryClient.invalidateQueries({
        queryKey: ['prompts', theme, promptModel]
      });
      await refetch();
    } catch (error) {
      console.error('Failed to refresh prompts:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Ensure we always have prompts to display, limited to 3
  const displayPrompts = prompts.length > 0 ? prompts.slice(0, 3) : defaultQuestions[theme].slice(0, 3);
  const isShowingLoading = (isLoading || isRefreshing) && shouldFetchPrompts;

  return (
    <div className="space-y-3">
      <div className="relative flex flex-wrap justify-center gap-2 min-h-[40px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${theme}-${isShowingLoading ? 'loading' : 'loaded'}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-wrap justify-center gap-2"
          >
            {isShowingLoading ? (
              // Skeleton loaders that look like the canned questions
              <>
                <motion.div initial={{ x: -5 }} animate={{ x: 0 }} transition={{ duration: 0.3 }}>
                  <PromptButtonSkeleton />
                </motion.div>
                <motion.div initial={{ x: -5 }} animate={{ x: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
                  <PromptButtonSkeleton />
                </motion.div>
                <motion.div initial={{ x: -5 }} animate={{ x: 0 }} transition={{ duration: 0.3, delay: 0.2 }}>
                  <PromptButtonSkeleton />
                </motion.div>
              </>
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
        
        {/* Improved refresh button */}
        {shouldFetchPrompts && (
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <TooltipProvider>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant={isRefreshing ? "secondary" : "ghost"}
                    onClick={handleRefresh}
                    disabled={isShowingLoading}
                    className={`
                      relative group flex flex-col items-center gap-2 p-3 h-auto shadow-none
                      transition-all duration-200 hover:text-primary
                      ${isRefreshing ? "text-primary bg-secondary" : "text-muted-foreground"}
                    `}
                  >
                    <RotateCw className={`size-3 ${isRefreshing ? 'animate-spin text-primary' : ''}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p className="text-sm">Generate new prompts</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </motion.div>
        )}
      </div>
    </div>
  );
}