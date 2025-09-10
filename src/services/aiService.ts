// AI Service for DeepSeek and ChatGPT integration
// Add your API keys here for testing

const DEEPSEEK_API_KEY = "sk-e79d88026ad14100b29d864db63a193e"; // Add your DeepSeek API key here
const OPENAI_API_KEY = ""; // Add your OpenAI API key here

export type AIModel = 'deepseek' | 'chatgpt';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

class AIService {
  async sendMessage(message: string, model: AIModel = 'chatgpt', conversationHistory: ChatMessage[] = []): Promise<string> {
    try {
      if (model === 'deepseek') {
        return await this.callDeepSeek(message, conversationHistory);
      } else {
        return await this.callChatGPT(message, conversationHistory);
      }
    } catch (error) {
      console.error('AI Service Error:', error);
      return 'عذراً، حدث خطأ في الاتصال بالخدمة. يرجى المحاولة مرة أخرى.';
    }
  }

  private async callDeepSeek(message: string, history: ChatMessage[]): Promise<string> {
    if (!DEEPSEEK_API_KEY) {
      return 'يرجى إضافة مفتاح DeepSeek API في ملف aiService.ts';
    }

    const messages = [
      {
        role: 'system' as const,
        content: `أنت مساعد ذكي متخصص في الحمل والولادة. اسمك "Dr. Osman". أجب بالعربية دائماً وقدم نصائح طبية عامة مع التأكيد على ضرورة استشارة الطبيب للحالات الخاصة. كن ودوداً ومفيداً ومختصراً.

قواعد مهمة:
- أجب فقط بالعربية
- قدم نصائح طبية عامة وليس تشخيصاً نهائياً
- شجع دائماً على استشارة الطبيب المختص
- استخدم الرموز التعبيرية بشكل مناسب
- كن مختصراً ومفيداً (200 كلمة كحد أقصى)`
      },
      ...history,
      {
        role: 'user' as const,
        content: message
      }
    ];

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 seconds timeout

    try {
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages,
          temperature: 0.3, // Lower temperature for faster, more focused responses
          max_tokens: 400,   // Reduced tokens for faster response
          top_p: 0.8,       // More focused responses
          stream: false
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || 'لم أتمكن من الحصول على رد مناسب.';
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('انتهت مهلة الاستجابة. يرجى المحاولة مرة أخرى.');
      }
      throw error;
    }
  }

  private async callChatGPT(message: string, history: ChatMessage[]): Promise<string> {
    if (!OPENAI_API_KEY) {
      return 'يرجى إضافة مفتاح OpenAI API في ملف aiService.ts';
    }

    const messages = [
      {
        role: 'system' as const,
        content: `أنت مساعد ذكي متخصص في الحمل والولادة. اسمك "Dr. Osman". أجب بالعربية دائماً وقدم نصائح طبية عامة مع التأكيد على ضرورة استشارة الطبيب للحالات الخاصة. كن ودوداً ومفيداً.

قواعد مهمة:
- أجب فقط بالعربية
- قدم نصائح طبية عامة وليس تشخيصاً نهائياً
- شجع دائماً على استشارة الطبيب المختص
- استخدم الرموز التعبيرية بشكل مناسب
- كن مختصراً ومفيداً`
      },
      ...history,
      {
        role: 'user' as const,
        content: message
      }
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages,
        temperature: 0.7,
        max_tokens: 1000,
        stream: false
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'لم أتمكن من الحصول على رد مناسب.';
  }
}

export const aiService = new AIService();