import { Button } from "@/components/ui/button";

interface QuickQuestionsProps {
  questions: string[];
  onQuestionSelect: (question: string) => void;
  visible?: boolean;
}

const QuickQuestions = ({ questions, onQuestionSelect, visible = true }: QuickQuestionsProps) => {
  if (!visible) return null;

  return (
    <div className="container mx-auto px-4 pb-4 animate-fade-in">
      <p className="text-sm text-muted-foreground mb-3 text-center">أسئلة شائعة:</p>
      <div className="space-y-2">
        {questions.map((question, index) => (
          <Button
            key={index}
            variant="outline"
            className="w-full text-right justify-start h-auto py-3 px-4 text-sm hover:bg-primary/5"
            onClick={() => onQuestionSelect(question)}
          >
            {question}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default QuickQuestions;