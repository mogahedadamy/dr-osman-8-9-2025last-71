import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Code2, Key, ExternalLink } from "lucide-react";

const APIKeyInstructions = () => {
  return (
    <Card className="mx-4 mb-4 shadow-card border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Key className="w-5 h-5 text-primary" />
            تعليمات إضافة API Keys
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            للمطورين
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Alert>
          <Code2 className="h-4 w-4" />
          <AlertDescription>
            لتفعيل الدردشة، يرجى إضافة API keys في ملف:
            <code className="bg-muted px-2 py-1 rounded text-sm mx-1">
              src/services/aiService.ts
            </code>
          </AlertDescription>
        </Alert>

        <div className="space-y-3 text-sm">
          <div className="bg-muted/50 p-3 rounded-lg">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              🤖 ChatGPT API Key
            </h4>
            <p className="text-muted-foreground mb-2">
              احصل على المفتاح من منصة OpenAI
            </p>
            <div className="flex items-center gap-2 text-xs">
              <ExternalLink className="w-3 h-3" />
              <span className="text-primary">platform.openai.com</span>
            </div>
          </div>

          <div className="bg-muted/50 p-3 rounded-lg">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              🧠 DeepSeek API Key
            </h4>
            <p className="text-muted-foreground mb-2">
              احصل على المفتاح من منصة DeepSeek
            </p>
            <div className="flex items-center gap-2 text-xs">
              <ExternalLink className="w-3 h-3" />
              <span className="text-primary">platform.deepseek.com</span>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 dark:bg-orange-950/20 p-3 rounded-lg border border-orange-200 dark:border-orange-800">
          <p className="text-orange-800 dark:text-orange-300 text-xs">
            ⚠️ هذا للتجربة فقط - لا تستخدم هذا في الإنتاج
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default APIKeyInstructions;