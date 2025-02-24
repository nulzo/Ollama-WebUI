import { Button } from "@/components/ui/button";

interface CannedQuestionsProps {
  theme: string;
  onQuestionClick: (question: string) => void;
}

export default function CannedQuestions({ theme, onQuestionClick }: CannedQuestionsProps) {
  const questions = {
    creative: ["Boost creativity?", "Unique art ideas?", "Writing prompt?"],
    inspirational: ["Motivational quotes?", "Stay inspired daily?", "Inspiring figures?"],
    analytical: ["Machine learning basics?", "Data analysis principles?", "Scientific method?"],
    casual: ["Movie recommendation?", "Perfect coffee tips?", "Weekend activities?"],
  };

  return (
    <div className="flex flex-wrap justify-center gap-2">
      {(questions[theme as keyof typeof questions] || []).map((question, index) => (
        <Button
          key={index}
          variant="outline"
          size="sm"
          onClick={() => onQuestionClick(question)}
          className="text-xs bg-transparent border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors duration-200"
        >
          {question}
        </Button>
      ))}
    </div>
  );
}