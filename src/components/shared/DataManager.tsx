import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Download, Upload, RefreshCw, Trash2, Cloud, HardDrive } from 'lucide-react';
import { useDataManager } from '@/hooks/useDataManager';

export const DataManager: React.FC = () => {
  const { syncStatus, isExporting, isImporting, storageUsage, exportData, importData, stats } = useDataManager();
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">استخدام التخزين</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.storagePercentage}</div>
            <Progress value={storageUsage.percentage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">حالة المزامنة</CardTitle>
            <Cloud className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">آخر مزامنة: {stats.lastSync}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="backup" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="backup">النسخ الاحتياطي</TabsTrigger>
          <TabsTrigger value="sync">المزامنة</TabsTrigger>
        </TabsList>

        <TabsContent value="backup">
          <Card>
            <CardHeader>
              <CardTitle>إدارة البيانات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={() => exportData('json')} disabled={isExporting} className="w-full">
                <Download className="h-4 w-4 ml-2" />
                {isExporting ? 'جاري التصدير...' : 'تصدير البيانات'}
              </Button>
              
              <input type="file" ref={fileInputRef} accept=".json" style={{ display: 'none' }} />
              <Button onClick={() => fileInputRef.current?.click()} disabled={isImporting} variant="outline" className="w-full">
                <Upload className="h-4 w-4 ml-2" />
                {isImporting ? 'جاري الاستيراد...' : 'استيراد البيانات'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sync">
          <Card>
            <CardHeader>
              <CardTitle>المزامنة السحابية</CardTitle>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                <RefreshCw className="h-4 w-4 ml-2" />
                مزامنة الآن
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};