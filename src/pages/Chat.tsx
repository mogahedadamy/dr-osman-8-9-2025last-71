import MobileLayout from "@/components/layout/MobileLayout";
import MobileHeader from "@/components/layout/MobileHeader";
import MessageBubble from "@/components/chat/MessageBubble";
import ChatInput from "@/components/chat/ChatInput";
import QuickQuestions from "@/components/chat/QuickQuestions";
import QuickHelp from "@/components/shared/QuickHelp";
import { SmartLoading, ChatLoadingDots } from "@/components/shared/EnhancedLoadingStates";
import { AnimatedPage, AnimatedList, AnimatedListItem } from "@/components/mobile/AnimatedPage";
import TouchFeedback from "@/components/mobile/TouchFeedback";
import { LoadingDots } from "@/components/mobile/LoadingStates";
import { useChat } from "@/hooks/useChat";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";

const Chat = () => {
  const navigate = useNavigate();
  const {
    messages,
    inputMessage,
    setInputMessage,
    isTyping,
    quickQuestions,
    sendMessage,
    handleQuickQuestion,
    showQuickQuestions,
    responseProgress
  } = useChat();

  return (
    <MobileLayout>
      <AnimatedPage className="flex flex-col h-full">
        {/* Mobile Header */}
        <MobileHeader 
          title="المساعد الذكي"
          subtitle={isTyping ? "🟡 يكتب..." : "🟢 متصل"}
          showBackButton={true}
          onBack={() => navigate(-1)}
        />
        
        {/* Premium Access Banner */}
        <div className="px-4 pt-2">
          <TouchFeedback onClick={() => navigate('/premium-access')}>
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-xl p-4 mb-4 touch-target">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl">👑</span>
                  <div>
                    <p className="text-sm font-semibold text-primary">محتوى متميز متاح</p>
                    <p className="text-xs text-muted-foreground">احصلي على استشارات طبية متقدمة</p>
                  </div>
                </div>
                <div className="bg-primary text-primary-foreground text-xs px-4 py-2 rounded-full font-medium">
                  اشترك الآن
                </div>
              </div>
            </div>
          </TouchFeedback>
          
          {/* Quick Tip Banner */}
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-3 mb-4">
            <div className="flex items-start gap-2">
              <span className="text-lg">💡</span>
              <div>
                <p className="text-sm font-medium text-blue-800 dark:text-blue-300">نصيحة للحصول على ردود أسرع</p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  اطرحي أسئلة محددة وقصيرة للحصول على إجابات أسرع وأكثر دقة
                </p>
              </div>
            </div>
          </div>
        </div>


        {/* Messages Container */}
        <div className="flex-1 px-4 py-4 space-y-4 overflow-y-auto mobile-scroll">
          <AnimatedList>
            {messages.map((message, index) => (
              <AnimatedListItem key={message.id}>
                <MessageBubble message={message} />
              </AnimatedListItem>
            ))}
          </AnimatedList>
          
          {isTyping && (
            <div className="flex flex-col items-start gap-2">
              <div className="bg-card rounded-2xl px-4 py-3 shadow-card border border-border max-w-xs">
                <ChatLoadingDots />
              </div>
              <div className="w-full max-w-xs px-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>🤖 يفكر في الإجابة...</span>
                  <span>{Math.round(responseProgress)}%</span>
                </div>
                <Progress value={responseProgress} className="h-1" />
              </div>
            </div>
          )}
        </div>

        {/* Quick Questions */}
        <QuickQuestions 
          questions={quickQuestions}
          onQuestionSelect={handleQuickQuestion}
          visible={showQuickQuestions}
        />

        {/* Chat Input */}
        <ChatInput
          value={inputMessage}
          onChange={setInputMessage}
          onSend={sendMessage}
          onSendWithAttachments={(message, attachments) => {
            console.log("📎 Chat: رسالة مع مرفقات", { message, attachments });
            sendMessage(message);
          }}
        />

        {/* Quick Help */}
        <QuickHelp pageType="chat" />
      </AnimatedPage>
    </MobileLayout>
  );
};

export default Chat;