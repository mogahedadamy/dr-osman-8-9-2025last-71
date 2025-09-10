import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Search, Filter, Mic, Star, Clock, TrendingUp, 
  ArrowUpDown, Bookmark, X, Save, Play, BookOpen, 
  Stethoscope, MessageCircle, ChevronDown, ChevronRight 
} from "lucide-react";
import { useAdvancedSearch, SearchFilters, SearchResult } from '@/hooks/useAdvancedSearch';
import { AnimatedList, AnimatedListItem, FadeIn } from '@/components/mobile/AnimatedPage';
import TouchFeedback from '@/components/mobile/TouchFeedback';

interface AdvancedSearchProps {
  onSelectResult?: (result: SearchResult) => void;
  isOpen: boolean;
  onClose: () => void;
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({ onSelectResult, isOpen, onClose }) => {
  const {
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    searchResults,
    isSearching,
    searchHistory,
    savedSearches,
    performSearch,
    saveSearch,
    loadSavedSearch,
    startVoiceSearch,
    clearFilters,
    getSearchSuggestions
  } = useAdvancedSearch();

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [saveSearchName, setSaveSearchName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const handleSearch = (query: string) => {
    performSearch(query);
    setShowSuggestions(false);
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (value.trim()) {
      setSuggestions(getSearchSuggestions(value));
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'article': return <BookOpen className="w-4 h-4" />;
      case 'video': return <Play className="w-4 h-4" />;
      case 'encyclopedia': return <Stethoscope className="w-4 h-4" />;
      case 'tip': return <MessageCircle className="w-4 h-4" />;
      default: return <Search className="w-4 h-4" />;
    }
  };

  const getResultTypeLabel = (type: string) => {
    switch (type) {
      case 'article': return 'مقال';
      case 'video': return 'فيديو';
      case 'encyclopedia': return 'موسوعة';
      case 'tip': return 'نصيحة';
      default: return 'نتيجة';
    }
  };

  const categories = [
    'الكل', 'تمارين', 'تغذية', 'ولادة', 'نمو الطفل', 
    'صحة', 'نصائح', 'استعداد', 'فحوصات طبية', 'طوارئ الحمل'
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-xl font-bold text-center">
            البحث المتقدم في المحتوى التعليمي
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 p-4">
          {/* شريط البحث الرئيسي */}
          <div className="relative">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="ابحث في المقالات، الفيديوهات، الموسوعة..."
                  value={searchQuery}
                  onChange={handleInputChange}
                  onFocus={() => searchQuery && setShowSuggestions(true)}
                  className="pr-10"
                />
                
                {/* اقتراحات البحث */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full right-0 left-0 mt-2 bg-background border rounded-lg shadow-lg z-10">
                    {suggestions.map((suggestion, index) => (
                      <TouchFeedback key={index}>
                        <button
                          onClick={() => {
                            setSearchQuery(suggestion);
                            handleSearch(suggestion);
                          }}
                          className="w-full text-right px-4 py-2 hover:bg-accent text-sm border-b last:border-b-0"
                        >
                          {suggestion}
                        </button>
                      </TouchFeedback>
                    ))}
                  </div>
                )}
              </div>
              
              <TouchFeedback>
                <Button
                  onClick={startVoiceSearch}
                  variant="outline"
                  size="icon"
                  className="shrink-0"
                >
                  <Mic className="w-4 h-4" />
                </Button>
              </TouchFeedback>
              
              <TouchFeedback>
                <Button
                  onClick={() => handleSearch(searchQuery)}
                  disabled={isSearching}
                  className="shrink-0"
                >
                  {isSearching ? "جاري البحث..." : "بحث"}
                </Button>
              </TouchFeedback>
            </div>
          </div>

          {/* الفلاتر السريعة */}
          <div className="flex flex-wrap gap-2">
            <TouchFeedback>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="w-3 h-3" />
                فلاتر متقدمة
                {showAdvancedFilters ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              </Button>
            </TouchFeedback>
            
            {Object.entries(filters).some(([key, value]) => 
              key !== 'contentType' && key !== 'category' && key !== 'sortBy' && 
              (value !== 'all' && value !== 'الكل' && value !== false && 
               (Array.isArray(value) ? value.length > 0 : true))
            ) && (
              <TouchFeedback>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700"
                >
                  <X className="w-3 h-3" />
                  إزالة الفلاتر
                </Button>
              </TouchFeedback>
            )}
          </div>

          {/* الفلاتر المتقدمة */}
          {showAdvancedFilters && (
            <FadeIn>
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">فلاتر البحث المتقدمة</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* نوع المحتوى */}
                    <div className="space-y-2">
                      <Label>نوع المحتوى</Label>
                      <Select
                        value={filters.contentType}
                        onValueChange={(value) => handleFilterChange('contentType', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">جميع الأنواع</SelectItem>
                          <SelectItem value="articles">المقالات</SelectItem>
                          <SelectItem value="videos">الفيديوهات</SelectItem>
                          <SelectItem value="encyclopedia">الموسوعة الطبية</SelectItem>
                          <SelectItem value="tips">نصائح د.عثمان</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* الفئة */}
                    <div className="space-y-2">
                      <Label>الفئة</Label>
                      <Select
                        value={filters.category}
                        onValueChange={(value) => handleFilterChange('category', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* وقت القراءة */}
                    <div className="space-y-2">
                      <Label>وقت القراءة</Label>
                      <Select
                        value={filters.readTime}
                        onValueChange={(value) => handleFilterChange('readTime', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">جميع الأوقات</SelectItem>
                          <SelectItem value="short">قصير (أقل من 5 دقائق)</SelectItem>
                          <SelectItem value="medium">متوسط (5-15 دقيقة)</SelectItem>
                          <SelectItem value="long">طويل (أكثر من 15 دقيقة)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* الإلحاح (للموسوعة) */}
                    {(filters.contentType === 'all' || filters.contentType === 'encyclopedia') && (
                      <div className="space-y-2">
                        <Label>مستوى الإلحاح</Label>
                        <Select
                          value={filters.urgency}
                          onValueChange={(value) => handleFilterChange('urgency', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">جميع المستويات</SelectItem>
                            <SelectItem value="low">عادي</SelectItem>
                            <SelectItem value="medium">متوسط</SelectItem>
                            <SelectItem value="high">عاجل</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* ترتيب النتائج */}
                    <div className="space-y-2">
                      <Label>ترتيب النتائج</Label>
                      <Select
                        value={filters.sortBy}
                        onValueChange={(value) => handleFilterChange('sortBy', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="relevance">حسب الصلة</SelectItem>
                          <SelectItem value="rating">حسب التقييم</SelectItem>
                          <SelectItem value="popularity">حسب الشعبية</SelectItem>
                          <SelectItem value="date">حسب التاريخ</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* خيارات إضافية */}
                  <Separator />
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox
                        id="personalExperience"
                        checked={filters.hasPersonalExperience}
                        onCheckedChange={(checked) => handleFilterChange('hasPersonalExperience', checked)}
                      />
                      <Label htmlFor="personalExperience">
                        عرض التجارب الشخصية فقط (نصائح د.عثمان)
                      </Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          )}

          {/* عمليات البحث المحفوظة والتاريخ */}
          {(searchHistory.length > 0 || savedSearches.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* تاريخ البحث */}
              {searchHistory.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">عمليات بحث سابقة</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {searchHistory.slice(0, 5).map((query, index) => (
                        <TouchFeedback key={index}>
                          <button
                            onClick={() => handleSearch(query)}
                            className="w-full text-right text-sm px-3 py-2 rounded-md hover:bg-accent border"
                          >
                            {query}
                          </button>
                        </TouchFeedback>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* البحث المحفوظ */}
              {savedSearches.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">عمليات بحث محفوظة</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {savedSearches.map((saved, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                          <TouchFeedback>
                            <button
                              onClick={() => loadSavedSearch(saved)}
                              className="flex-1 text-right text-sm font-medium"
                            >
                              {saved.name}
                            </button>
                          </TouchFeedback>
                          <Badge variant="secondary" className="text-xs">
                            {saved.query}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* نتائج البحث */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                نتائج البحث ({searchResults.length})
              </h3>
              
              {searchQuery && (
                <div className="flex gap-2">
                  <TouchFeedback>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowSaveDialog(true)}
                      className="flex items-center gap-2"
                    >
                      <Save className="w-3 h-3" />
                      حفظ البحث
                    </Button>
                  </TouchFeedback>
                </div>
              )}
            </div>

            {searchResults.length > 0 ? (
              <AnimatedList className="space-y-3">
                {searchResults.map((result, index) => (
                  <AnimatedListItem key={result.id}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <TouchFeedback>
                        <CardContent 
                          className="p-4"
                          onClick={() => onSelectResult?.(result)}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2">
                                {getResultIcon(result.type)}
                                <Badge variant="secondary" className="text-xs">
                                  {getResultTypeLabel(result.type)}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {result.category}
                                </Badge>
                                {result.week && (
                                  <Badge variant="outline" className="text-xs">
                                    الأسبوع {result.week}
                                  </Badge>
                                )}
                              </div>
                              
                              <h4 className="font-semibold text-sm leading-tight">
                                {result.title}
                              </h4>
                              
                              {result.summary && (
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                  {result.summary}
                                </p>
                              )}
                              
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                {result.readTime && (
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {result.readTime}
                                  </div>
                                )}
                                {result.rating && (
                                  <div className="flex items-center gap-1">
                                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                    {result.rating.toFixed(1)}
                                  </div>
                                )}
                                {result.views && (
                                  <div className="flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3" />
                                    {result.views.toLocaleString()} مشاهدة
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <Badge 
                                variant="outline" 
                                className="text-xs"
                              >
                                {result.relevanceScore.toFixed(1)}%
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </TouchFeedback>
                    </Card>
                  </AnimatedListItem>
                ))}
              </AnimatedList>
            ) : searchQuery ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold mb-2">لا توجد نتائج</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  جربي كلمات بحث أخرى أو تعديل الفلاتر
                </p>
                <TouchFeedback>
                  <Button variant="outline" onClick={clearFilters}>
                    إزالة جميع الفلاتر
                  </Button>
                </TouchFeedback>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-lg font-semibold mb-2">ابدأي البحث</h3>
                <p className="text-sm text-muted-foreground">
                  استخدمي شريط البحث أعلاه للعثور على المحتوى المطلوب
                </p>
              </div>
            )}
          </div>
        </div>

        {/* حوار حفظ البحث */}
        <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>حفظ عملية البحث</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="searchName">اسم البحث المحفوظ</Label>
                <Input
                  id="searchName"
                  value={saveSearchName}
                  onChange={(e) => setSaveSearchName(e.target.value)}
                  placeholder="مثال: بحث تمارين الحمل"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    if (saveSearchName.trim()) {
                      saveSearch(saveSearchName.trim());
                      setSaveSearchName('');
                      setShowSaveDialog(false);
                    }
                  }}
                  disabled={!saveSearchName.trim()}
                >
                  حفظ
                </Button>
                <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                  إلغاء
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
};

export default AdvancedSearch;