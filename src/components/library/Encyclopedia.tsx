import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { encyclopediaData, alphabetIndex, searchEncyclopedia, getEntriesByLetter } from '@/data/encyclopediaData';

const Encyclopedia = () => {
  const [selectedLetter, setSelectedLetter] = useState<string>('أ');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  
  // تحديث النتائج عند تغيير الحرف المحدد
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(getEntriesByLetter(selectedLetter));
    }
  }, [selectedLetter]);

  // تحميل البيانات الأولية عند بدء التطبيق
  useEffect(() => {
    setSearchResults(getEntriesByLetter(selectedLetter));
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      setSearchResults(searchEncyclopedia(query));
    } else {
      setSearchResults(getEntriesByLetter(selectedLetter));
    }
  };

  const handleLetterClick = (letter: string) => {
    setSelectedLetter(letter);
    setSearchQuery('');
    setSearchResults(getEntriesByLetter(letter));
  };

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  const getUrgencyIcon = (level: string) => {
    switch (level) {
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'medium': return <Info className="w-4 h-4" />;
      default: return <CheckCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">موسوعة الحمل A-Z</h2>
        <p className="text-muted-foreground">دليل شامل للمصطلحات والأعراض الطبية</p>
      </div>

      {/* البحث */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="ابحث في الموسوعة..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* الفهرس الأبجدي */}
      <div className="grid grid-cols-7 gap-2">
        {alphabetIndex.map((letter) => (
          <Button
            key={letter}
            variant={selectedLetter === letter ? "default" : "outline"}
            size="sm"
            onClick={() => handleLetterClick(letter)}
            className="text-lg"
          >
            {letter}
          </Button>
        ))}
      </div>

      {/* النتائج */}
      <div className="space-y-4">
        {searchResults.length > 0 ? (
          searchResults.map((entry) => (
            <Card key={entry.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {entry.title}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge className={getUrgencyColor(entry.urgencyLevel)}>
                      {getUrgencyIcon(entry.urgencyLevel)}
                      <span className="mr-1">
                        {entry.urgencyLevel === 'high' ? 'عاجل' : 
                         entry.urgencyLevel === 'medium' ? 'متوسط' : 'عادي'}
                      </span>
                    </Badge>
                    <Badge variant="secondary">{entry.category}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">{entry.definition}</p>
                
                {entry.symptoms && entry.symptoms.length > 0 && (
                  <div className="mb-3">
                    <h4 className="font-medium text-sm mb-2">الأعراض:</h4>
                    <ul className="text-sm space-y-1">
                      {entry.symptoms.map((symptom, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          {symptom}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="bg-accent/50 p-3 rounded-md mt-3">
                  <h4 className="font-medium text-sm mb-1">متى تطلبي المساعدة:</h4>
                  <p className="text-sm">{entry.whenToSeek}</p>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">📖</div>
            <h3 className="text-lg font-semibold mb-2">لا توجد نتائج</h3>
            <p className="text-muted-foreground">جربي كلمات بحث أخرى أو اختاري حرف مختلف</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Encyclopedia;