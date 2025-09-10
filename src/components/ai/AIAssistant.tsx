import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAIAssistant } from '@/hooks/useAIAssistant';
import { 
  Brain, 
  Send, 
  Mic, 
  MicOff, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  TrendingUp,
  BookOpen,
  Heart,
  Activity,
  MessageCircle,
  Download,
  Loader
} from 'lucide-react';

const AIAssistant: React.FC = () => {
  const {
    queryHistory,
    isProcessing,
    currentAnalysis,
    recommendations,
    userProfile,
    processQuery,
    generatePersonalizedRecommendations,
    updateUserProfile,
    loadSavedData,
    exportData,
    stats
  } = useAIAssistant();

  const [currentQuestion, setCurrentQuestion] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadSavedData();
    generatePersonalizedRecommendations();
  }, [loadSavedData, generatePersonalizedRecommendations]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [queryHistory]);

  // معالجة إرسال السؤال
  const handleSubmitQuestion = async () => {
    if (!currentQuestion.trim() || isProcessing) return;

    try {
      await processQuery(currentQuestion);
      setCurrentQuestion('');
    } catch (error) {
      console.error('Error submitting question:', error);
    }
  };

  // تفعيل التسجيل الصوتي (محاكاة)
  const toggleVoiceRecording = () => {
    setIsListening(!isListening);
    
    if (!isListening) {
      // محاكاة التسجيل الصوتي
      setTimeout(() => {
        setCurrentQuestion('أشعر بألم في الظهر، ما الذي يمكنني فعله؟');
        setIsListening(false);
      }, 3000);
    }
  };

  // تحديث أسبوع الحمل
  const handleWeekUpdate = (week: number) => {
    updateUserProfile({ currentWeek: week });
    generatePersonalizedRecommendations();
  };

  // أسئلة سريعة مقترحة
  const suggestedQuestions = [
    'ما هي الأعراض الطبيعية في أسبوعي الحالي؟',
    'ما الأطعمة المفيدة في الحمل؟',
    'ما التمارين الآمنة لمرحلتي؟',
    'متى يجب أن أراجع الطبيب؟',
    'كيف أتعامل مع غثيان الصباح؟'
  ];

  // تصنيف الأولوية حسب اللون
  const getPriorityColor = (priority: number) => {
    if (priority >= 8) return 'bg-red-500';
    if (priority >= 6) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  // تصنيف مستوى الخطورة
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'urgent': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'urgent': return <AlertTriangle className="w-4 h-4" />;
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'medium': return <Clock className="w-4 h-4" />;
      case 'low': return <CheckCircle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto p-4 space-y-4">
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Brain className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold">المساعد الذكي د.عثمان</h1>
              <p className="text-sm text-muted-foreground">
                مساعدك الشخصي للحمل والصحة - أسبوع {userProfile.currentWeek}
              </p>
            </div>
            <div className="flex-1" />
            <Button
              variant="outline"
              size="sm"
              onClick={exportData}
              className="hidden md:flex"
            >
              <Download className="w-4 h-4 mr-2" />
              تصدير البيانات
            </Button>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            <span className="hidden sm:inline">المحادثة</span>
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            <span className="hidden sm:inline">تحليل الأعراض</span>
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">التوصيات</span>
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">الإحصائيات</span>
          </TabsTrigger>
        </TabsList>

        {/* Chat Tab */}
        <TabsContent value="chat" className="space-y-4 mt-4">
          <Card className="flex-1">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">المحادثة الذكية</CardTitle>
                <Badge variant="outline">
                  {queryHistory.length} استفسار
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {/* Chat History */}
              <ScrollArea className="h-96 mb-4">
                <div className="space-y-4">
                  {queryHistory.length === 0 ? (
                    <div className="text-center py-8">
                      <Brain className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        مرحباً! أنا المساعد الذكي د.عثمان. اسأليني عن أي شيء متعلق بحملك
                      </p>
                    </div>
                  ) : (
                    queryHistory.map((query) => (
                      <div key={query.id} className="space-y-3">
                        {/* User Question */}
                        <div className="flex justify-end">
                          <div className="bg-primary text-primary-foreground rounded-lg p-3 max-w-[80%]">
                            <p className="text-sm">{query.question}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {new Date(query.timestamp).toLocaleTimeString('ar-SA')}
                            </p>
                          </div>
                        </div>

                        {/* AI Response */}
                        <div className="flex justify-start">
                          <div className="flex gap-3 max-w-[80%]">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src="/dr-osman-avatar.png" />
                              <AvatarFallback>
                                <Brain className="w-4 h-4" />
                              </AvatarFallback>
                            </Avatar>
                            <div className="bg-muted rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant={query.category === 'symptoms' ? 'destructive' : 'secondary'}>
                                  {query.category}
                                </Badge>
                                <Badge variant="outline">
                                  ثقة {Math.round(query.confidence * 100)}%
                                </Badge>
                              </div>
                              <p className="text-sm whitespace-pre-line">{query.response}</p>
                              
                              {query.followUp && query.followUp.length > 0 && (
                                <div className="mt-3 space-y-1">
                                  <p className="text-xs text-muted-foreground">أسئلة متابعة:</p>
                                  {query.followUp.map((followUp, index) => (
                                    <Button
                                      key={index}
                                      variant="ghost"
                                      size="sm"
                                      className="text-xs h-auto p-1 hover:bg-primary/10"
                                      onClick={() => setCurrentQuestion(followUp)}
                                    >
                                      {followUp}
                                    </Button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={chatEndRef} />
                </div>
              </ScrollArea>

              {/* Suggested Questions */}
              {queryHistory.length === 0 && (
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-3">أسئلة مقترحة:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {suggestedQuestions.map((question, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="text-right justify-start h-auto p-3"
                        onClick={() => setCurrentQuestion(question)}
                      >
                        {question}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Area */}
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Textarea
                    placeholder="اكتبي سؤالك هنا..."
                    value={currentQuestion}
                    onChange={(e) => setCurrentQuestion(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmitQuestion();
                      }
                    }}
                    className="min-h-[50px] resize-none"
                    disabled={isProcessing}
                  />
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={toggleVoiceRecording}
                      variant={isListening ? "destructive" : "outline"}
                      size="sm"
                      className="p-2"
                    >
                      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </Button>
                    <Button
                      onClick={handleSubmitQuestion}
                      disabled={!currentQuestion.trim() || isProcessing}
                      size="sm"
                      className="p-2"
                    >
                      {isProcessing ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
                
                {isListening && (
                  <Alert>
                    <Mic className="w-4 h-4" />
                    <AlertDescription>
                      🎙️ جاري التسجيل... تحدثي بوضوح
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analysis Tab */}
        <TabsContent value="analysis" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                تحليل الأعراض الحالي
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentAnalysis ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={getSeverityColor(currentAnalysis.severity)}
                      className="flex items-center gap-1"
                    >
                      {getSeverityIcon(currentAnalysis.severity)}
                      {currentAnalysis.severity}
                    </Badge>
                    <h3 className="font-semibold">{currentAnalysis.symptom}</h3>
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">التوصيات:</h4>
                    <ul className="space-y-1">
                      {currentAnalysis.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {currentAnalysis.doctorConsult && (
                    <Alert variant="destructive">
                      <AlertTriangle className="w-4 h-4" />
                      <AlertDescription>
                        ⚠️ يُنصح بمراجعة الطبيب لهذا العرض
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">مستوى الإلحاح:</span>
                    <div className="flex gap-1">
                      {Array.from({ length: 10 }, (_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 rounded-full ${
                            i < currentAnalysis.urgencyLevel
                              ? currentAnalysis.urgencyLevel > 7
                                ? 'bg-red-500'
                                : currentAnalysis.urgencyLevel > 4
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                              : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium">
                      {currentAnalysis.urgencyLevel}/10
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    لا يوجد تحليل أعراض حالي. اسألي عن أي عرض تشعرين به
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                التوصيات المخصصة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendations.length > 0 ? (
                  recommendations.map((rec) => (
                    <div key={rec.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary">{rec.type}</Badge>
                            <div className={`w-2 h-2 rounded-full ${getPriorityColor(rec.priority)}`} />
                            <span className="text-xs text-muted-foreground">
                              أولوية {rec.priority}/10
                            </span>
                          </div>
                          <h4 className="font-medium mb-1">{rec.title}</h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            {rec.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            بناءً على: {rec.basedon}
                          </p>
                        </div>
                        <Button size="sm" variant="outline">
                          {rec.type === 'article' ? (
                            <BookOpen className="w-4 h-4" />
                          ) : (
                            <Heart className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Sparkles className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      لا توجد توصيات متاحة حالياً. استخدمي المساعد الذكي لتلقي توصيات مخصصة
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="stats" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  إحصائيات الاستخدام
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>إجمالي الاستفسارات</span>
                  <Badge variant="secondary">{stats.totalQueries}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>متوسط الثقة</span>
                  <Badge variant="outline">
                    {Math.round(stats.averageConfidence * 100)}%
                  </Badge>
                </div>
                <Separator />
                <div className="space-y-2">
                  <p className="font-medium text-sm">التوزيع حسب الفئة:</p>
                  {Object.entries(stats.byCategory).map(([category, count]) => (
                    <div key={category} className="flex justify-between text-sm">
                      <span>{category}</span>
                      <span>{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>الملف الشخصي</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">أسبوع الحمل الحالي</label>
                  <Input
                    type="number"
                    min="4"
                    max="40"
                    value={userProfile.currentWeek}
                    onChange={(e) => handleWeekUpdate(parseInt(e.target.value) || 4)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">مرات الحمل السابقة</label>
                  <Input
                    type="number"
                    min="0"
                    max="10"
                    value={userProfile.previousPregnancies}
                    onChange={(e) => updateUserProfile({ 
                      previousPregnancies: parseInt(e.target.value) || 0 
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">لغة المحتوى</label>
                  <Badge variant="outline">{userProfile.preferences.language}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIAssistant;