import { useState } from 'react';
import { Message } from '@/types';
import { aiService, AIModel } from '@/services/aiService';

const initialMessages: Message[] = [
  {
    id: 1,
    text: "مرحباً بك! 🌟\n\nأنا مساعدك الذكي في رحلة الحمل، هنا لمساعدتك على مدار 24 ساعة.\n\nيمكنني مساعدتك في:\n• الإجابة على استفساراتك الطبية\n• تقديم نصائح للعناية بصحتك وصحة طفلك\n• متابعة تطور الحمل\n• تذكيرك بالمواعيد المهمة\n\nاختاري سؤالاً من الأسئلة أدناه أو اكتبي استفسارك مباشرة 💙",
    sender: 'bot',
    timestamp: new Date().toLocaleTimeString('ar-SA', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    })
  }
];

const quickQuestions = [
  "ما هي أعراض الحمل الطبيعية؟",
  "متى أحتاج لزيارة الطبيب؟",
  "ما الأطعمة المسموحة والممنوعة؟",
  "كيف أتعامل مع الغثيان؟"
];

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedModel, setSelectedModel] = useState<AIModel>('deepseek');
  const [responseProgress, setResponseProgress] = useState(0);

  const sendMessage = async (text?: string) => {
    const messageText = text || inputMessage;
    if (!messageText.trim()) return;

    console.log("💬 useChat: إرسال رسالة جديدة", { 
      messageText, 
      messageLength: messageText.length,
      totalMessages: messages.length,
      selectedModel
    });

    const newMessage: Message = {
      id: Date.now(),
      text: messageText,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString('ar-SA', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      })
    };
    
    setMessages(prev => [...prev, newMessage]);
    setInputMessage("");
    setIsTyping(true);
    setResponseProgress(0);

    // Progress simulation for better UX
    const progressInterval = setInterval(() => {
      setResponseProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 1500);
    
    try {
      // Prepare conversation history for AI
      const conversationHistory = messages.slice(1).map(msg => ({
        role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.text
      }));

      // Call AI service
      const aiResponse = await aiService.sendMessage(messageText, selectedModel, conversationHistory);
      
      clearInterval(progressInterval);
      setResponseProgress(100);
      
      const botResponse: Message = {
        id: Date.now() + 1,
        text: aiResponse,
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString('ar-SA', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        })
      };
      
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      clearInterval(progressInterval);
      console.error("خطأ في إرسال الرسالة:", error);
      
      const errorMessage = error.message?.includes('انتهت مهلة الاستجابة') 
        ? "انتهت مهلة الاستجابة ⏰ يرجى المحاولة مرة أخرى أو تقصير السؤال."
        : "عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى. 😔";
      
      const errorResponse: Message = {
        id: Date.now() + 1,
        text: errorMessage,
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString('ar-SA', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        })
      };
      
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
      setResponseProgress(0);
    }
  };

  const handleQuickQuestion = (question: string) => {
    console.log("❓ useChat: سؤال سريع", { question });
    sendMessage(question);
  };

  return {
    messages,
    inputMessage,
    setInputMessage,
    isTyping,
    quickQuestions,
    sendMessage,
    handleQuickQuestion,
    showQuickQuestions: messages.length <= 1,
    selectedModel,
    setSelectedModel,
    responseProgress
  };
};