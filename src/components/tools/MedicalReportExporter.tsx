import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePregnancyTracking } from '@/hooks/usePregnancyTracking';
import { useReminders } from '@/hooks/useReminders';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, 
  Download, 
  Printer, 
  Calendar, 
  User, 
  Heart,
  Weight,
  Camera,
  Pill
} from 'lucide-react';

interface ReportData {
  pregnancyInfo: any;
  appointments: any[];
  medications: any[];
  weightEntries: any[];
  bellyPhotos: any[];
  generalReminders: any[];
}

export const MedicalReportExporter: React.FC = () => {
  const { pregnancyInfo, currentWeek, dueDate, getTrimesterInfo } = usePregnancyTracking();
  const { reminders } = useReminders();
  const { toast } = useToast();
  
  const [reportType, setReportType] = useState<'full' | 'summary' | 'appointments' | 'weight'>('full');
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'trimester' | 'all'>('month');

  // تجميع البيانات حسب النوع
  const getReportData = (): ReportData => {
    const appointments = reminders.filter(r => r.type === 'appointment' || r.type === 'medical');
    const medications = reminders.filter(r => r.type === 'medication');
    const generalReminders = reminders.filter(r => r.type === 'exercise');
    
    return {
      pregnancyInfo,
      appointments,
      medications,
      weightEntries: [], // سيتم ربطها بـ hook الوزن لاحقاً
      bellyPhotos: [], // سيتم ربطها بـ hook الصور لاحقاً
      generalReminders
    };
  };

  // إنشاء التقرير كـ HTML
  const generateHTMLReport = (data: ReportData): string => {
    const trimesterInfo = getTrimesterInfo();
    const currentDate = new Date().toLocaleDateString('ar');
    
    return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>التقرير الطبي للحمل</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #e91e63;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #e91e63;
            margin: 0;
            font-size: 2.5em;
        }
        .header p {
            color: #666;
            margin: 10px 0 0 0;
        }
        .section {
            margin-bottom: 30px;
        }
        .section h2 {
            color: #333;
            border-bottom: 2px solid #f0f0f0;
            padding-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }
        .info-card {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            border-right: 4px solid #e91e63;
        }
        .info-card h3 {
            margin: 0 0 10px 0;
            color: #e91e63;
            font-size: 1.1em;
        }
        .info-card p {
            margin: 5px 0;
            color: #555;
        }
        .appointment-list {
            list-style: none;
            padding: 0;
        }
        .appointment-item {
            background: #fff;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 10px;
            border-right: 4px solid #4caf50;
        }
        .appointment-item h4 {
            margin: 0 0 5px 0;
            color: #4caf50;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            color: #666;
            font-size: 0.9em;
        }
        .progress-bar {
            background: #e0e0e0;
            height: 20px;
            border-radius: 10px;
            overflow: hidden;
            margin: 10px 0;
        }
        .progress-fill {
            background: linear-gradient(90deg, #e91e63, #ff6b9d);
            height: 100%;
            transition: width 0.3s ease;
        }
        @media print {
            body { background: white; }
            .container { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🤰 التقرير الطبي للحمل</h1>
            <p>تاريخ التقرير: ${currentDate}</p>
        </div>

        ${reportType === 'full' || reportType === 'summary' ? `
        <div class="section">
            <h2>📊 معلومات الحمل الأساسية</h2>
            <div class="info-grid">
                <div class="info-card">
                    <h3>الأسبوع الحالي</h3>
                    <p><strong>${currentWeek}</strong> أسبوع</p>
                </div>
                <div class="info-card">
                    <h3>الثلث الحالي</h3>
                    <p><strong>${trimesterInfo.name}</strong></p>
                    <p>${trimesterInfo.description}</p>
                </div>
                <div class="info-card">
                    <h3>تاريخ الولادة المتوقع</h3>
                    <p><strong>${new Date(dueDate).toLocaleDateString('ar')}</strong></p>
                </div>
                <div class="info-card">
                    <h3>تقدم الحمل</h3>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${(currentWeek / 40) * 100}%"></div>
                    </div>
                    <p><strong>${Math.round((currentWeek / 40) * 100)}%</strong> مكتمل</p>
                </div>
            </div>
        </div>
        ` : ''}

        ${(reportType === 'full' || reportType === 'appointments') && data.appointments.length > 0 ? `
        <div class="section">
            <h2>🏥 المواعيد الطبية والتذكيرات</h2>
            <ul class="appointment-list">
                ${data.appointments.map(appointment => `
                <li class="appointment-item">
                    <h4>${appointment.title}</h4>
                    <p><strong>التاريخ:</strong> ${new Date(appointment.date).toLocaleDateString('ar')}</p>
                    <p><strong>الوقت:</strong> ${appointment.time}</p>
                    ${appointment.description ? `<p><strong>الوصف:</strong> ${appointment.description}</p>` : ''}
                </li>
                `).join('')}
            </ul>
        </div>
        ` : ''}

        ${data.medications.length > 0 ? `
        <div class="section">
            <h2>💊 الأدوية والمكملات</h2>
            <ul class="appointment-list">
                ${data.medications.map(med => `
                <li class="appointment-item">
                    <h4>${med.title}</h4>
                    <p><strong>الجرعة:</strong> ${med.time}</p>
                    ${med.description ? `<p><strong>تعليمات:</strong> ${med.description}</p>` : ''}
                </li>
                `).join('')}
            </ul>
        </div>
        ` : ''}

        <div class="footer">
            <p>تم إنشاء هذا التقرير بواسطة تطبيق مرافق الحمل</p>
            <p>يرجى مراجعة طبيبك المختص لأي استفسارات طبية</p>
        </div>
    </div>
</body>
</html>
    `;
  };

  // طباعة التقرير
  const printReport = () => {
    const data = getReportData();
    const htmlContent = generateHTMLReport(data);
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);

      toast({
        title: "جاري الطباعة 🖨️",
        description: "تم فتح نافذة الطباعة"
      });
    }
  };

  // تحميل التقرير كـ HTML
  const downloadReport = () => {
    const data = getReportData();
    const htmlContent = generateHTMLReport(data);
    
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `تقرير-الحمل-الأسبوع-${currentWeek}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);

    toast({
      title: "تم تحميل التقرير ✅",
      description: "تم حفظ التقرير في مجلد التحميل"
    });
  };

  // إنشاء ملخص سريع
  const generateQuickSummary = () => {
    const summary = {
      week: currentWeek,
      trimester: getTrimesterInfo().name,
      daysUntilDue: Math.ceil((new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
      appointmentsCount: reminders.filter(r => r.type === 'appointment').length,
      medicationsCount: reminders.filter(r => r.type === 'medication').length
    };

    const text = `
📱 ملخص سريع للحمل

🗓️ الأسبوع الحالي: ${summary.week}
🤰 الثلث: ${summary.trimester}
⏰ أيام متبقية للولادة: ${summary.daysUntilDue}
🏥 المواعيد الطبية: ${summary.appointmentsCount}
💊 الأدوية اليومية: ${summary.medicationsCount}

تم إنشاؤه من تطبيق مرافق الحمل
    `.trim();

    if (navigator.share) {
      navigator.share({
        title: 'ملخص الحمل',
        text: text
      });
    } else {
      navigator.clipboard.writeText(text);
      toast({
        title: "تم النسخ ✅",
        description: "تم نسخ الملخص إلى الحافظة"
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            تصدير التقارير الطبية
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">نوع التقرير</label>
              <Select value={reportType} onValueChange={setReportType as any}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">تقرير شامل</SelectItem>
                  <SelectItem value="summary">ملخص سريع</SelectItem>
                  <SelectItem value="appointments">المواعيد فقط</SelectItem>
                  <SelectItem value="weight">الوزن فقط</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">الفترة الزمنية</label>
              <Select value={dateRange} onValueChange={setDateRange as any}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">الأسبوع الحالي</SelectItem>
                  <SelectItem value="month">الشهر الحالي</SelectItem>
                  <SelectItem value="trimester">الثلث الحالي</SelectItem>
                  <SelectItem value="all">كامل فترة الحمل</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={printReport} variant="outline" className="flex-1">
              <Printer className="h-4 w-4 mr-2" />
              طباعة التقرير
            </Button>
            
            <Button onClick={downloadReport} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              تحميل HTML
            </Button>
            
            <Button onClick={generateQuickSummary} variant="secondary" className="flex-1">
              <Heart className="h-4 w-4 mr-2" />
              ملخص سريع
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* معاينة التقرير */}
      <Card>
        <CardHeader>
          <CardTitle>معاينة التقرير</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">التقرير الطبي للحمل</h3>
              <Badge variant="secondary">الأسبوع {currentWeek}</Badge>
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <Calendar className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">المواعيد</p>
                <p className="text-2xl font-bold text-primary">
                  {reminders.filter(r => r.type === 'appointment').length}
                </p>
              </div>
              
              <div>
                <Pill className="h-8 w-8 mx-auto mb-2 text-secondary" />
                <p className="text-sm font-medium">الأدوية</p>
                <p className="text-2xl font-bold text-secondary">
                  {reminders.filter(r => r.type === 'medication').length}
                </p>
              </div>
              
              <div>
                <Weight className="h-8 w-8 mx-auto mb-2 text-success" />
                <p className="text-sm font-medium">قياسات الوزن</p>
                <p className="text-2xl font-bold text-success">0</p>
              </div>
              
              <div>
                <Camera className="h-8 w-8 mx-auto mb-2 text-warning" />
                <p className="text-sm font-medium">صور البطن</p>
                <p className="text-2xl font-bold text-warning">0</p>
              </div>
            </div>
            
            <div className="text-center text-sm text-muted-foreground">
              سيتم تضمين جميع البيانات المحفوظة في التقرير النهائي
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};