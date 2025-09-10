import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useHealthTracking } from '@/hooks/useHealthTracking';
import {
  Activity,
  Heart,
  Baby,
  AlertTriangle,
  Plus,
  Calendar,
  TrendingUp,
  TrendingDown,
  Weight,
  Download,
  Trash2,
  Clock,
  MapPin,
  User,
  FileText
} from 'lucide-react';

const HealthTracker: React.FC = () => {
  const {
    weightEntries,
    bpEntries,
    movementEntries,
    symptomEntries,
    appointments,
    currentWeek,
    addWeightEntry,
    addBloodPressureEntry,
    addBabyMovementEntry,
    addSymptomEntry,
    addAppointment,
    deleteEntry,
    setCurrentWeek,
    exportHealthData,
    getHealthMetrics,
    generateWeeklyReport,
    getStats
  } = useHealthTracking();

  const [activeTab, setActiveTab] = useState('overview');
  const [showAddForm, setShowAddForm] = useState<string | null>(null);

  // بيانات النماذج
  const [weightForm, setWeightForm] = useState({ weight: '', notes: '' });
  const [bpForm, setBpForm] = useState({ systolic: '', diastolic: '', notes: '' });
  const [movementForm, setMovementForm] = useState({
    movements: '',
    timeSpent: '',
    intensity: 'متوسط' as 'خفيف' | 'متوسط' | 'قوي',
    notes: ''
  });
  const [symptomForm, setSymptomForm] = useState({
    symptom: '',
    severity: '3' as '1' | '2' | '3' | '4' | '5',
    triggers: '',
    relief: '',
    notes: ''
  });
  const [appointmentForm, setAppointmentForm] = useState({
    date: '',
    time: '',
    type: 'فحص روتيني' as 'فحص روتيني' | 'فحص طارئ' | 'سونار' | 'تحاليل' | 'أخرى',
    doctorName: '',
    location: '',
    notes: ''
  });

  const metrics = getHealthMetrics();
  const weeklyReport = generateWeeklyReport(currentWeek);
  const stats = getStats();

  // إضافة مدخل جديد
  const handleAddEntry = (type: string) => {
    try {
      switch (type) {
        case 'weight':
          if (weightForm.weight) {
            addWeightEntry(parseFloat(weightForm.weight), weightForm.notes || undefined);
            setWeightForm({ weight: '', notes: '' });
            setShowAddForm(null);
          }
          break;
        case 'bp':
          if (bpForm.systolic && bpForm.diastolic) {
            addBloodPressureEntry(
              parseInt(bpForm.systolic),
              parseInt(bpForm.diastolic),
              bpForm.notes || undefined
            );
            setBpForm({ systolic: '', diastolic: '', notes: '' });
            setShowAddForm(null);
          }
          break;
        case 'movement':
          if (movementForm.movements && movementForm.timeSpent) {
            addBabyMovementEntry(
              parseInt(movementForm.movements),
              parseInt(movementForm.timeSpent),
              movementForm.intensity,
              movementForm.notes || undefined
            );
            setMovementForm({ movements: '', timeSpent: '', intensity: 'متوسط', notes: '' });
            setShowAddForm(null);
          }
          break;
        case 'symptom':
          if (symptomForm.symptom) {
            addSymptomEntry(
              symptomForm.symptom,
              parseInt(symptomForm.severity) as 1 | 2 | 3 | 4 | 5,
              symptomForm.triggers ? symptomForm.triggers.split(',').map(t => t.trim()) : undefined,
              symptomForm.relief ? symptomForm.relief.split(',').map(r => r.trim()) : undefined,
              symptomForm.notes || undefined
            );
            setSymptomForm({ symptom: '', severity: '3', triggers: '', relief: '', notes: '' });
            setShowAddForm(null);
          }
          break;
        case 'appointment':
          if (appointmentForm.date && appointmentForm.time && appointmentForm.doctorName) {
            addAppointment(
              appointmentForm.date,
              appointmentForm.time,
              appointmentForm.type,
              appointmentForm.doctorName,
              appointmentForm.location,
              appointmentForm.notes || undefined
            );
            setAppointmentForm({
              date: '',
              time: '',
              type: 'فحص روتيني',
              doctorName: '',
              location: '',
              notes: ''
            });
            setShowAddForm(null);
          }
          break;
      }
    } catch (error) {
      console.error('Error adding entry:', error);
    }
  };

  // تحديد لون المقياس
  const getMetricColor = (type: string, value: any) => {
    switch (type) {
      case 'bp':
        if (value.systolic >= 140 || value.diastolic >= 90) return 'text-red-500';
        if (value.systolic >= 130 || value.diastolic >= 85) return 'text-yellow-500';
        return 'text-green-500';
      case 'movement':
        if (value === 'ناقص') return 'text-red-500';
        if (value === 'ثابت') return 'text-yellow-500';
        return 'text-green-500';
      case 'weight':
        if (value > 15) return 'text-red-500';
        if (value > 12) return 'text-yellow-500';
        return 'text-green-500';
      default:
        return 'text-primary';
    }
  };

  return (
    <div className="flex flex-col h-full max-w-6xl mx-auto p-4 space-y-4">
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Activity className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">متتبع الصحة والحمل</CardTitle>
                <p className="text-sm text-muted-foreground">
                  تتبع شامل لصحتك وصحة جنينك - الأسبوع {currentWeek}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="week-select" className="text-sm">الأسبوع:</Label>
                <Select 
                  value={currentWeek.toString()} 
                  onValueChange={(value) => setCurrentWeek(parseInt(value))}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 37 }, (_, i) => i + 4).map(week => (
                      <SelectItem key={week} value={week.toString()}>
                        {week}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={exportHealthData}
                className="hidden md:flex"
              >
                <Download className="w-4 h-4 mr-2" />
                تصدير
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Metrics Overview */}
      {metrics.riskFactors.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription>
            تحذيرات صحية: {metrics.riskFactors.join('، ')}
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Weight className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">زيادة الوزن</p>
                <p className={`text-lg font-bold ${getMetricColor('weight', metrics.weightGain)}`}>
                  {metrics.weightGain > 0 ? '+' : ''}{metrics.weightGain.toFixed(1)} كغ
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">ضغط الدم</p>
                <p className={`text-lg font-bold ${getMetricColor('bp', metrics.averageBP)}`}>
                  {metrics.averageBP.systolic || '--'}/{metrics.averageBP.diastolic || '--'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Baby className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">حركة الجنين</p>
                <div className={`flex items-center gap-1 ${getMetricColor('movement', metrics.movementTrend)}`}>
                  {metrics.movementTrend === 'زائد' ? <TrendingUp className="w-4 h-4" /> :
                   metrics.movementTrend === 'ناقص' ? <TrendingDown className="w-4 h-4" /> :
                   <Activity className="w-4 h-4" />}
                  <span className="font-bold">{metrics.movementTrend}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">المواعيد القادمة</p>
                <p className="text-lg font-bold">
                  {metrics.upcomingAppointments.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="weight">الوزن</TabsTrigger>
          <TabsTrigger value="vitals">المؤشرات</TabsTrigger>
          <TabsTrigger value="baby">الجنين</TabsTrigger>
          <TabsTrigger value="appointments">المواعيد</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>التقرير الأسبوعي - الأسبوع {currentWeek}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">تغيير الوزن</p>
                    <p className="font-bold">{weeklyReport.weightChange.toFixed(1)} كغ</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">حركة الجنين</p>
                    <p className="font-bold">{weeklyReport.movementCount} حركة</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">ضغط الدم</p>
                    <p className="font-bold">
                      {weeklyReport.avgBP.systolic || '--'}/{weeklyReport.avgBP.diastolic || '--'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">الأعراض</p>
                    <p className="font-bold">{weeklyReport.symptomsCount}</p>
                  </div>
                </div>

                {weeklyReport.topSymptoms.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">الأعراض الشائعة:</p>
                    <div className="flex flex-wrap gap-1">
                      {weeklyReport.topSymptoms.map((symptom, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {symptom}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {weeklyReport.recommendations.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">التوصيات:</p>
                    <ul className="text-xs space-y-1">
                      {weeklyReport.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {weeklyReport.alerts.length > 0 && (
                  <Alert variant="destructive">
                    <AlertTriangle className="w-4 h-4" />
                    <AlertDescription className="text-xs">
                      {weeklyReport.alerts.join('، ')}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>إحصائيات الاستخدام</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">إجمالي المدخلات</p>
                    <p className="text-2xl font-bold">{stats.totalEntries}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">أيام متتالية</p>
                    <p className="text-2xl font-bold">{stats.streakDays}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">مدخلات هذا الأسبوع:</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>الوزن</span>
                      <Badge variant="outline">{stats.entriesThisWeek.weight}</Badge>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>ضغط الدم</span>
                      <Badge variant="outline">{stats.entriesThisWeek.bp}</Badge>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>حركة الجنين</span>
                      <Badge variant="outline">{stats.entriesThisWeek.movement}</Badge>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>الأعراض</span>
                      <Badge variant="outline">{stats.entriesThisWeek.symptoms}</Badge>
                    </div>
                  </div>
                </div>

                {metrics.lastAppointment && (
                  <div>
                    <p className="text-sm font-medium mb-2">آخر موعد طبي:</p>
                    <div className="bg-muted/50 p-3 rounded-lg text-xs">
                      <p className="font-medium">{metrics.lastAppointment.type}</p>
                      <p className="text-muted-foreground">
                        {metrics.lastAppointment.doctorName} - {metrics.lastAppointment.date}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Weight Tab */}
        <TabsContent value="weight" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">تتبع الوزن</h3>
            <Button
              onClick={() => setShowAddForm(showAddForm === 'weight' ? null : 'weight')}
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              إضافة قياس
            </Button>
          </div>

          {showAddForm === 'weight' && (
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="weight">الوزن (كغ)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      placeholder="65.5"
                      value={weightForm.weight}
                      onChange={(e) => setWeightForm(prev => ({ ...prev, weight: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="weight-notes">ملاحظات</Label>
                    <Input
                      id="weight-notes"
                      placeholder="ملاحظات اختيارية"
                      value={weightForm.notes}
                      onChange={(e) => setWeightForm(prev => ({ ...prev, notes: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button onClick={() => handleAddEntry('weight')} size="sm">
                    حفظ
                  </Button>
                  <Button variant="ghost" onClick={() => setShowAddForm(null)} size="sm">
                    إلغاء
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">سجل الوزن</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {weightEntries.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      لا توجد قياسات وزن مسجلة
                    </div>
                  ) : (
                    weightEntries.map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium">{entry.weight} كغ</p>
                          <p className="text-xs text-muted-foreground">
                            {entry.date} - الأسبوع {entry.week}
                          </p>
                          {entry.notes && (
                            <p className="text-xs text-muted-foreground mt-1">{entry.notes}</p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteEntry('weight', entry.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vitals Tab */}
        <TabsContent value="vitals" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">المؤشرات الحيوية</h3>
            <Button
              onClick={() => setShowAddForm(showAddForm === 'bp' ? null : 'bp')}
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              إضافة قياس
            </Button>
          </div>

          {showAddForm === 'bp' && (
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="systolic">الضغط الانقباضي</Label>
                    <Input
                      id="systolic"
                      type="number"
                      placeholder="120"
                      value={bpForm.systolic}
                      onChange={(e) => setBpForm(prev => ({ ...prev, systolic: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="diastolic">الضغط الانبساطي</Label>
                    <Input
                      id="diastolic"
                      type="number"
                      placeholder="80"
                      value={bpForm.diastolic}
                      onChange={(e) => setBpForm(prev => ({ ...prev, diastolic: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="bp-notes">ملاحظات</Label>
                    <Input
                      id="bp-notes"
                      placeholder="ملاحظات اختيارية"
                      value={bpForm.notes}
                      onChange={(e) => setBpForm(prev => ({ ...prev, notes: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button onClick={() => handleAddEntry('bp')} size="sm">
                    حفظ
                  </Button>
                  <Button variant="ghost" onClick={() => setShowAddForm(null)} size="sm">
                    إلغاء
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">سجل ضغط الدم</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {bpEntries.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        لا توجد قياسات ضغط دم مسجلة
                      </div>
                    ) : (
                      bpEntries.map((entry) => (
                        <div key={entry.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div>
                            <p className={`font-medium ${getMetricColor('bp', entry)}`}>
                              {entry.systolic}/{entry.diastolic}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {entry.date} - الأسبوع {entry.week}
                            </p>
                            {entry.notes && (
                              <p className="text-xs text-muted-foreground mt-1">{entry.notes}</p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteEntry('bp', entry.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base">الأعراض</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddForm(showAddForm === 'symptom' ? null : 'symptom')}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    إضافة
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {showAddForm === 'symptom' && (
                  <div className="space-y-3 mb-4 p-3 bg-muted/50 rounded-lg">
                    <div>
                      <Label htmlFor="symptom">العرض</Label>
                      <Input
                        id="symptom"
                        placeholder="مثل: صداع، غثيان، ألم ظهر"
                        value={symptomForm.symptom}
                        onChange={(e) => setSymptomForm(prev => ({ ...prev, symptom: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="severity">الشدة (1-5)</Label>
                      <Select
                        value={symptomForm.severity}
                        onValueChange={(value: '1' | '2' | '3' | '4' | '5') => 
                          setSymptomForm(prev => ({ ...prev, severity: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 - خفيف جداً</SelectItem>
                          <SelectItem value="2">2 - خفيف</SelectItem>
                          <SelectItem value="3">3 - متوسط</SelectItem>
                          <SelectItem value="4">4 - شديد</SelectItem>
                          <SelectItem value="5">5 - شديد جداً</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="symptom-notes">ملاحظات</Label>
                      <Input
                        id="symptom-notes"
                        placeholder="ملاحظات إضافية"
                        value={symptomForm.notes}
                        onChange={(e) => setSymptomForm(prev => ({ ...prev, notes: e.target.value }))}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => handleAddEntry('symptom')} size="sm">
                        حفظ
                      </Button>
                      <Button variant="ghost" onClick={() => setShowAddForm(null)} size="sm">
                        إلغاء
                      </Button>
                    </div>
                  </div>
                )}

                <ScrollArea className="h-48">
                  <div className="space-y-2">
                    {symptomEntries.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        لا توجد أعراض مسجلة
                      </div>
                    ) : (
                      symptomEntries.map((entry) => (
                        <div key={entry.id} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{entry.symptom}</span>
                              <Badge
                                variant={entry.severity >= 4 ? 'destructive' : entry.severity >= 3 ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {entry.severity}/5
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {entry.date} - الأسبوع {entry.week}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteEntry('symptom', entry.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Baby Tab */}
        <TabsContent value="baby" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">تتبع الجنين</h3>
            <Button
              onClick={() => setShowAddForm(showAddForm === 'movement' ? null : 'movement')}
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              تسجيل حركة
            </Button>
          </div>

          {showAddForm === 'movement' && (
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="movements">عدد الحركات</Label>
                    <Input
                      id="movements"
                      type="number"
                      placeholder="10"
                      value={movementForm.movements}
                      onChange={(e) => setMovementForm(prev => ({ ...prev, movements: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="timeSpent">المدة (دقائق)</Label>
                    <Input
                      id="timeSpent"
                      type="number"
                      placeholder="60"
                      value={movementForm.timeSpent}
                      onChange={(e) => setMovementForm(prev => ({ ...prev, timeSpent: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="intensity">الشدة</Label>
                    <Select
                      value={movementForm.intensity}
                      onValueChange={(value: 'خفيف' | 'متوسط' | 'قوي') => 
                        setMovementForm(prev => ({ ...prev, intensity: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="خفيف">خفيف</SelectItem>
                        <SelectItem value="متوسط">متوسط</SelectItem>
                        <SelectItem value="قوي">قوي</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="mt-4">
                  <Label htmlFor="movement-notes">ملاحظات</Label>
                  <Textarea
                    id="movement-notes"
                    placeholder="ملاحظات حول حركة الجنين"
                    value={movementForm.notes}
                    onChange={(e) => setMovementForm(prev => ({ ...prev, notes: e.target.value }))}
                  />
                </div>
                <div className="flex gap-2 mt-4">
                  <Button onClick={() => handleAddEntry('movement')} size="sm">
                    حفظ
                  </Button>
                  <Button variant="ghost" onClick={() => setShowAddForm(null)} size="sm">
                    إلغاء
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">سجل حركة الجنين</CardTitle>
              {currentWeek >= 28 && (
                <Alert>
                  <Baby className="w-4 h-4" />
                  <AlertDescription className="text-xs">
                    من الأسبوع 28، يُنصح بتسجيل 10 حركات خلال ساعتين يومياً
                  </AlertDescription>
                </Alert>
              )}
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {movementEntries.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      لا توجد حركات مسجلة للجنين
                    </div>
                  ) : (
                    movementEntries.map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{entry.movements} حركة</span>
                            <Badge variant="secondary" className="text-xs">
                              {entry.intensity}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {entry.date} {entry.time} - {entry.timeSpent} دقيقة - الأسبوع {entry.week}
                          </p>
                          {entry.notes && (
                            <p className="text-xs text-muted-foreground mt-1">{entry.notes}</p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteEntry('movement', entry.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appointments Tab */}
        <TabsContent value="appointments" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">المواعيد الطبية</h3>
            <Button
              onClick={() => setShowAddForm(showAddForm === 'appointment' ? null : 'appointment')}
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              إضافة موعد
            </Button>
          </div>

          {showAddForm === 'appointment' && (
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="apt-date">التاريخ</Label>
                    <Input
                      id="apt-date"
                      type="date"
                      value={appointmentForm.date}
                      onChange={(e) => setAppointmentForm(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="apt-time">الوقت</Label>
                    <Input
                      id="apt-time"
                      type="time"
                      value={appointmentForm.time}
                      onChange={(e) => setAppointmentForm(prev => ({ ...prev, time: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="apt-type">نوع الموعد</Label>
                    <Select
                      value={appointmentForm.type}
                      onValueChange={(value: typeof appointmentForm.type) => 
                        setAppointmentForm(prev => ({ ...prev, type: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="فحص روتيني">فحص روتيني</SelectItem>
                        <SelectItem value="فحص طارئ">فحص طارئ</SelectItem>
                        <SelectItem value="سونار">سونار</SelectItem>
                        <SelectItem value="تحاليل">تحاليل</SelectItem>
                        <SelectItem value="أخرى">أخرى</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="doctor">اسم الطبيب</Label>
                    <Input
                      id="doctor"
                      placeholder="د. محمد أحمد"
                      value={appointmentForm.doctorName}
                      onChange={(e) => setAppointmentForm(prev => ({ ...prev, doctorName: e.target.value }))}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="location">المكان</Label>
                    <Input
                      id="location"
                      placeholder="عيادة النساء والولادة - الطابق الثاني"
                      value={appointmentForm.location}
                      onChange={(e) => setAppointmentForm(prev => ({ ...prev, location: e.target.value }))}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="apt-notes">ملاحظات</Label>
                    <Textarea
                      id="apt-notes"
                      placeholder="ملاحظات حول الموعد"
                      value={appointmentForm.notes}
                      onChange={(e) => setAppointmentForm(prev => ({ ...prev, notes: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button onClick={() => handleAddEntry('appointment')} size="sm">
                    حفظ
                  </Button>
                  <Button variant="ghost" onClick={() => setShowAddForm(null)} size="sm">
                    إلغاء
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  المواعيد القادمة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {metrics.upcomingAppointments.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        لا توجد مواعيد قادمة
                      </div>
                    ) : (
                      metrics.upcomingAppointments.map((appointment) => (
                        <div key={appointment.id} className="p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline">{appointment.type}</Badge>
                                <span className="text-xs text-muted-foreground">
                                  الأسبوع {appointment.week}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Clock className="w-3 h-3" />
                                <span>{appointment.date} - {appointment.time}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <User className="w-3 h-3" />
                                <span>{appointment.doctorName}</span>
                              </div>
                              {appointment.location && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <MapPin className="w-3 h-3" />
                                  <span>{appointment.location}</span>
                                </div>
                              )}
                              {appointment.notes && (
                                <p className="text-xs text-muted-foreground mt-2">
                                  {appointment.notes}
                                </p>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteEntry('appointment', appointment.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  سجل المواعيد
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {appointments.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        لا توجد مواعيد مسجلة
                      </div>
                    ) : (
                      appointments.map((appointment) => {
                        const isPast = new Date(appointment.date + ' ' + appointment.time) < new Date();
                        return (
                          <div key={appointment.id} className={`p-3 rounded-lg ${isPast ? 'bg-muted/30' : 'bg-muted/50'}`}>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant={isPast ? "secondary" : "outline"}>
                                    {appointment.type}
                                  </Badge>
                                  {isPast && (
                                    <Badge variant="secondary" className="text-xs">
                                      منتهي
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <Clock className="w-3 h-3" />
                                  <span>{appointment.date} - {appointment.time}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <User className="w-3 h-3" />
                                  <span>{appointment.doctorName}</span>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteEntry('appointment', appointment.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HealthTracker;