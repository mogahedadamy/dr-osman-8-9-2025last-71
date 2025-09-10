import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Download, Trash2, HardDrive, Wifi, WifiOff, 
  FileText, Play, Stethoscope, MessageCircle, 
  Settings, Import, Upload, RefreshCw 
} from "lucide-react";
import { useOfflineContent, OfflineContent, StorageStats } from '@/hooks/useOfflineContent';
import { AnimatedList, AnimatedListItem, FadeIn } from '@/components/mobile/AnimatedPage';
import TouchFeedback from '@/components/mobile/TouchFeedback';

interface OfflineManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const OfflineManager: React.FC<OfflineManagerProps> = ({ isOpen, onClose }) => {
  const {
    offlineContent,
    storageStats,
    isDownloading,
    downloadProgress,
    removeOfflineContent,
    cleanupStorage,
    syncOfflineContent,
    exportOfflineContent,
    importOfflineContent,
    updateStorageStats,
    getOfflineContentByType,
    searchOfflineContent
  } = useOfflineContent();

  const [activeTab, setActiveTab] = useState<'content' | 'stats' | 'settings'>('content');
  const [searchQuery, setSearchQuery] = useState('');

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'article': return <FileText className="w-4 h-4" />;
      case 'video': return <Play className="w-4 h-4" />;
      case 'encyclopedia': return <Stethoscope className="w-4 h-4" />;
      case 'tip': return <MessageCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getContentTypeLabel = (type: string) => {
    switch (type) {
      case 'article': return 'مقال';
      case 'video': return 'فيديو';
      case 'encyclopedia': return 'موسوعة';
      case 'tip': return 'نصيحة';
      default: return 'محتوى';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 بايت';
    const k = 1024;
    const sizes = ['بايت', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStorageUsagePercentage = () => {
    return storageStats.totalSize > 0 
      ? (storageStats.usedSpace / storageStats.totalSize) * 100 
      : 0;
  };

  const filteredContent = searchQuery 
    ? searchOfflineContent(searchQuery)
    : offlineContent;

  const contentByType = {
    articles: getOfflineContentByType('article'),
    videos: getOfflineContentByType('video'),
    encyclopedia: getOfflineContentByType('encyclopedia'),
    tips: getOfflineContentByType('tip')
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      importOfflineContent(file);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-xl font-bold text-center">
            إدارة المحتوى أوفلاين
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {/* علامات التبويب */}
          <div className="flex border-b mb-4">
            <TouchFeedback>
              <Button
                variant={activeTab === 'content' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('content')}
                className="rounded-b-none"
              >
                <Download className="w-4 h-4 mr-2" />
                المحتوى المحفوظ
              </Button>
            </TouchFeedback>
            <TouchFeedback>
              <Button
                variant={activeTab === 'stats' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('stats')}
                className="rounded-b-none"
              >
                <HardDrive className="w-4 h-4 mr-2" />
                إحصائيات التخزين
              </Button>
            </TouchFeedback>
            <TouchFeedback>
              <Button
                variant={activeTab === 'settings' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('settings')}
                className="rounded-b-none"
              >
                <Settings className="w-4 h-4 mr-2" />
                الإعدادات
              </Button>
            </TouchFeedback>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4">
            {activeTab === 'content' && (
              <FadeIn>
                <div className="space-y-4">
                  {/* شريط البحث */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="البحث في المحتوى المحفوظ..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-md"
                    />
                    <TouchFeedback>
                      <Button
                        variant="outline"
                        onClick={syncOfflineContent}
                        disabled={isDownloading}
                      >
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    </TouchFeedback>
                  </div>

                  {/* قائمة المحتوى */}
                  {filteredContent.length > 0 ? (
                    <AnimatedList className="space-y-3">
                      {filteredContent.map((content) => (
                        <AnimatedListItem key={content.id}>
                          <Card>
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex-1 space-y-2">
                                  <div className="flex items-center gap-2">
                                    {getContentIcon(content.type)}
                                    <Badge variant="secondary" className="text-xs">
                                      {getContentTypeLabel(content.type)}
                                    </Badge>
                                  </div>
                                  <h4 className="font-medium text-sm">{content.title}</h4>
                                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <span>حُفظ: {new Date(content.downloadedAt).toLocaleDateString('ar')}</span>
                                    <span>الحجم: {formatFileSize(content.size)}</span>
                                    {content.lastAccessed && (
                                      <span>آخر قراءة: {new Date(content.lastAccessed).toLocaleDateString('ar')}</span>
                                    )}
                                  </div>
                                </div>
                                
                                <TouchFeedback>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removeOfflineContent(content.id)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </TouchFeedback>
                              </div>
                            </CardContent>
                          </Card>
                        </AnimatedListItem>
                      ))}
                    </AnimatedList>
                  ) : (
                    <div className="text-center py-16">
                      <WifiOff className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        {searchQuery ? "لا توجد نتائج" : "لا يوجد محتوى محفوظ"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {searchQuery 
                          ? "جرب كلمات بحث مختلفة"
                          : "احفظ المقالات والفيديوهات للقراءة بدون إنترنت"
                        }
                      </p>
                    </div>
                  )}
                </div>
              </FadeIn>
            )}

            {activeTab === 'stats' && (
              <FadeIn>
                <div className="space-y-6">
                  {/* إحصائيات التخزين العامة */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <HardDrive className="w-5 h-5" />
                        استخدام التخزين
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>مُستخدم: {formatFileSize(storageStats.usedSpace)}</span>
                          <span>متاح: {formatFileSize(storageStats.availableSpace)}</span>
                        </div>
                        <Progress value={getStorageUsagePercentage()} className="h-2" />
                        <div className="text-xs text-muted-foreground text-center">
                          {getStorageUsagePercentage().toFixed(1)}% من {formatFileSize(storageStats.totalSize)}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">{storageStats.itemCount}</div>
                          <div className="text-sm text-muted-foreground">عنصر محفوظ</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">
                            {storageStats.lastCleanup 
                              ? Math.floor((Date.now() - new Date(storageStats.lastCleanup).getTime()) / (1000 * 60 * 60 * 24))
                              : '--'
                            }
                          </div>
                          <div className="text-sm text-muted-foreground">يوم منذ آخر تنظيف</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* إحصائيات حسب النوع */}
                  <Card>
                    <CardHeader>
                      <CardTitle>المحتوى حسب النوع</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[
                          { type: 'article', label: 'المقالات', data: contentByType.articles },
                          { type: 'video', label: 'الفيديوهات', data: contentByType.videos },
                          { type: 'encyclopedia', label: 'الموسوعة', data: contentByType.encyclopedia },
                          { type: 'tip', label: 'النصائح', data: contentByType.tips }
                        ].map(({ type, label, data }) => (
                          <div key={type} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              {getContentIcon(type)}
                              <span className="font-medium">{label}</span>
                            </div>
                            <div className="text-right">
                              <div className="font-bold">{data.length}</div>
                              <div className="text-xs text-muted-foreground">
                                {formatFileSize(data.reduce((sum, item) => sum + item.size, 0))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </FadeIn>
            )}

            {activeTab === 'settings' && (
              <FadeIn>
                <div className="space-y-6">
                  {/* إدارة التخزين */}
                  <Card>
                    <CardHeader>
                      <CardTitle>إدارة التخزين</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <TouchFeedback>
                        <Button
                          variant="outline"
                          onClick={() => cleanupStorage(30)}
                          className="w-full justify-start"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          تنظيف المحتوى القديم (أكثر من 30 يوم)
                        </Button>
                      </TouchFeedback>
                      
                      <TouchFeedback>
                        <Button
                          variant="outline"
                          onClick={() => cleanupStorage(7)}
                          className="w-full justify-start"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          تنظيف المحتوى القديم (أكثر من 7 أيام)
                        </Button>
                      </TouchFeedback>

                      <TouchFeedback>
                        <Button
                          variant="outline"
                          onClick={updateStorageStats}
                          className="w-full justify-start"
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          تحديث إحصائيات التخزين
                        </Button>
                      </TouchFeedback>
                    </CardContent>
                  </Card>

                  {/* النسخ الاحتياطي والاستيراد */}
                  <Card>
                    <CardHeader>
                      <CardTitle>النسخ الاحتياطي والاستيراد</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <TouchFeedback>
                        <Button
                          variant="outline"
                          onClick={exportOfflineContent}
                          className="w-full justify-start"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          تصدير المحتوى المحفوظ
                        </Button>
                      </TouchFeedback>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium">
                          استيراد محتوى محفوظ:
                        </label>
                        <input
                          type="file"
                          accept=".json"
                          onChange={handleFileImport}
                          className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/80"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* معلومات النظام */}
                  <Card>
                    <CardHeader>
                      <CardTitle>معلومات النظام</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">حالة الاتصال:</span>
                          <div className="flex items-center gap-2">
                            {navigator.onLine ? (
                              <>
                                <Wifi className="w-4 h-4 text-green-600" />
                                <span className="text-green-600">متصل</span>
                              </>
                            ) : (
                              <>
                                <WifiOff className="w-4 h-4 text-red-600" />
                                <span className="text-red-600">غير متصل</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">المنصة:</span>
                          <span>{navigator.platform}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">إصدار التطبيق:</span>
                          <span>2.0.0</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </FadeIn>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OfflineManager;