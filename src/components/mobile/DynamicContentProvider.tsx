// مزود المحتوى الديناميكي للتطبيق
import React, { createContext, useContext, useEffect, useState } from 'react';
import { DynamicContent, ContentCategory } from '@/types/cms';
import { useDynamicContent } from '@/hooks/useDynamicContent';

interface DynamicContentContextType {
  articles: DynamicContent[];
  videos: DynamicContent[];
  tips: DynamicContent[];
  encyclopedia: DynamicContent[];
  categories: ContentCategory[];
  loading: boolean;
  error: string | null;
  refreshContent: () => void;
  searchContent: (query: string, type?: string) => Promise<DynamicContent[]>;
  getContentById: (id: string) => Promise<DynamicContent | null>;
}

const DynamicContentContext = createContext<DynamicContentContextType | undefined>(undefined);

interface DynamicContentProviderProps {
  children: React.ReactNode;
}

export function DynamicContentProvider({ children }: DynamicContentProviderProps) {
  const {
    content,
    categories,
    loading,
    error,
    loadContent,
    searchContent,
    getContentById
  } = useDynamicContent({
    autoSync: true,
    syncInterval: 30 // مزامنة كل 30 دقيقة
  });

  // تصنيف المحتوى حسب النوع
  const articles = content.filter(item => item.type === 'article');
  const videos = content.filter(item => item.type === 'video');
  const tips = content.filter(item => item.type === 'tip');
  const encyclopedia = content.filter(item => item.type === 'encyclopedia');

  const contextValue: DynamicContentContextType = {
    articles,
    videos,
    tips,
    encyclopedia,
    categories,
    loading,
    error,
    refreshContent: loadContent,
    searchContent: async (query: string, type?: string) => {
      return await searchContent(query);
    },
    getContentById
  };

  return (
    <DynamicContentContext.Provider value={contextValue}>
      {children}
    </DynamicContentContext.Provider>
  );
}

export function useDynamicContentContext() {
  const context = useContext(DynamicContentContext);
  if (context === undefined) {
    throw new Error('useDynamicContentContext must be used within a DynamicContentProvider');
  }
  return context;
}