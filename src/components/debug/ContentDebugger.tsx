// مكون بسيط لإظهار المحتوى الديناميكي فوراً
import React, { useEffect, useState } from 'react';
import { contentService } from '@/services/contentService';

export function ContentDebugger() {
  const [content, setContent] = useState<any[]>([]);
  
  useEffect(() => {
    const loadContent = async () => {
      try {
        const allContent = await contentService.getAllContent();
        console.log('🔍 All Content:', allContent);
        setContent(allContent);
      } catch (error) {
        console.error('Error loading content:', error);
      }
    };

    loadContent();

    // استمع للتحديثات
    const unsubscribe = contentService.onContentUpdate((action, updatedContent) => {
      console.log(`🔄 Content Updated: ${action}`, updatedContent);
      loadContent(); // إعادة تحميل كامل
    });

    return unsubscribe;
  }, []);

  if (content.length === 0) {
    return (
      <div className="p-4 bg-yellow-100 rounded-lg">
        <p>لا يوجد محتوى ديناميكي</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-green-100 rounded-lg">
      <h3 className="font-bold mb-2">المحتوى الديناميكي المتاح:</h3>
      {content.map((item, index) => (
        <div key={index} className="mb-2 p-2 bg-white rounded">
          <p><strong>{item.title}</strong></p>
          <p>النوع: {item.type} | الفئة: {item.category}</p>
          <p>منشور: {item.isPublished ? 'نعم' : 'لا'}</p>
        </div>
      ))}
    </div>
  );
}