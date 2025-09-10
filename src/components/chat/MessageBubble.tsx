import { Card, CardContent } from "@/components/ui/card";
import { Message } from "@/types";

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble = ({ message }: MessageBubbleProps) => {
  return (
    <div
      className={`flex ${message.sender === 'user' ? 'justify-start' : 'justify-end'} animate-fade-in`}
    >
      <Card 
        className={`max-w-[80%] shadow-card ${
          message.sender === 'user' 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-background'
        }`}
      >
        <CardContent className="p-3">
          <p className="text-sm leading-relaxed whitespace-pre-line">
            {message.text}
          </p>
          <p className={`text-xs mt-2 ${
            message.sender === 'user' 
              ? 'text-primary-foreground/70' 
              : 'text-muted-foreground'
          }`}>
            {message.timestamp}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default MessageBubble;