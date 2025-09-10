import { AIModel } from "@/services/aiService";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import TouchFeedback from "@/components/mobile/TouchFeedback";
import { Badge } from "@/components/ui/badge";

interface ModelSelectorProps {
  selectedModel: AIModel;
  onModelChange: (model: AIModel) => void;
}

const ModelSelector = ({ selectedModel, onModelChange }: ModelSelectorProps) => {
  return (
    <Card className="mx-4 mb-4 shadow-card border-border">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">🤖 اختر النموذج</h3>
          <Badge variant="outline" className="text-xs">
            للتجربة
          </Badge>
        </div>
        
        <div className="flex gap-2">
          <TouchFeedback>
            <Button
              variant={selectedModel === 'chatgpt' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onModelChange('chatgpt')}
              className="flex-1 touch-target"
            >
              <span className="mr-2">🔥</span>
              ChatGPT
            </Button>
          </TouchFeedback>
          
          <TouchFeedback>
            <Button
              variant={selectedModel === 'deepseek' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onModelChange('deepseek')}
              className="flex-1 touch-target"
            >
              <span className="mr-2">🧠</span>
              DeepSeek
            </Button>
          </TouchFeedback>
        </div>
        
        <div className="mt-2 text-xs text-muted-foreground text-center">
          النموذج المختار: <span className="font-medium text-primary">
            {selectedModel === 'chatgpt' ? 'ChatGPT' : 'DeepSeek'}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ModelSelector;