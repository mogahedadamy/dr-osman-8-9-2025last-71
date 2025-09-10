import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useHealthTracking } from '@/hooks/useHealthTracking';
import { Heart, Droplets, TrendingUp, AlertTriangle, CheckCircle, Clock, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface VitalRanges {
  systolic: { normal: number; elevated: number; high: number };
  diastolic: { normal: number; elevated: number; high: number };
  glucose: {
    fasting: { normal: number; elevated: number; high: number };
    postMeal: { normal: number; elevated: number; high: number };
    preMeal: { normal: number; elevated: number; high: number };
    random: { normal: number; elevated: number; high: number };
  };
}

const vitalRanges: VitalRanges = {
  systolic: { normal: 120, elevated: 130, high: 140 },
  diastolic: { normal: 80, elevated: 85, high: 90 },
  glucose: {
    fasting: { normal: 95, elevated: 100, high: 126 },
    postMeal: { normal: 120, elevated: 140, high: 200 },
    preMeal: { normal: 95, elevated: 100, high: 126 },
    random: { normal: 140, elevated: 180, high: 200 }
  }
};

const BloodPressureGlucoseTracker = () => {
  const { 
    bpEntries, 
    glucoseEntries, 
    addBloodPressureEntry, 
    addGlucoseEntry, 
    deleteEntry,
    currentWeek 
  } = useHealthTracking();

  const [activeTab, setActiveTab] = useState<'bp' | 'glucose'>('bp');
  
  // Blood Pressure Form State
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [bpNotes, setBpNotes] = useState('');

  // Glucose Form State
  const [glucose, setGlucose] = useState('');
  const [measurementType, setMeasurementType] = useState<'صائم' | 'بعد الوجبة' | 'قبل الوجبة' | 'عشوائي'>('صائم');
  const [glucoseNotes, setGlucoseNotes] = useState('');

  const getBPStatus = (systolic: number, diastolic: number) => {
    if (systolic >= vitalRanges.systolic.high || diastolic >= vitalRanges.diastolic.high) {
      return { status: 'high', text: 'مرتفع', color: 'destructive', icon: AlertTriangle };
    }
    if (systolic >= vitalRanges.systolic.elevated || diastolic >= vitalRanges.diastolic.elevated) {
      return { status: 'elevated', text: 'مرتفع نسبياً', color: 'secondary', icon: TrendingUp };
    }
    return { status: 'normal', text: 'طبيعي', color: 'default', icon: CheckCircle };
  };

  const getGlucoseStatus = (value: number, type: string) => {
    const ranges = vitalRanges.glucose[type as keyof typeof vitalRanges.glucose];
    if (value >= ranges.high) {
      return { status: 'high', text: 'مرتفع', color: 'destructive', icon: AlertTriangle };
    }
    if (value >= ranges.elevated) {
      return { status: 'elevated', text: 'مرتفع نسبياً', color: 'secondary', icon: TrendingUp };
    }
    return { status: 'normal', text: 'طبيعي', color: 'default', icon: CheckCircle };
  };

  const handleBPSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const systolicVal = parseFloat(systolic);
    const diastolicVal = parseFloat(diastolic);

    if (isNaN(systolicVal) || isNaN(diastolicVal) || systolicVal <= 0 || diastolicVal <= 0) {
      toast({
        title: "خطأ في الإدخال",
        description: "يرجى إدخال قيم صحيحة لضغط الدم",
        variant: "destructive"
      });
      return;
    }

    addBloodPressureEntry(systolicVal, diastolicVal, bpNotes);
    setSystolic('');
    setDiastolic('');
    setBpNotes('');
  };

  const handleGlucoseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const glucoseVal = parseFloat(glucose);

    if (isNaN(glucoseVal) || glucoseVal <= 0) {
      toast({
        title: "خطأ في الإدخال",
        description: "يرجى إدخال قيمة صحيحة للسكر",
        variant: "destructive"
      });
      return;
    }

    addGlucoseEntry(glucoseVal, measurementType, glucoseNotes);
    setGlucose('');
    setGlucoseNotes('');
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ar-EG', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Heart className="w-6 h-6 text-red-500" />
          <Droplets className="w-6 h-6 text-blue-500" />
        </div>
        <h2 className="text-xl font-bold text-foreground">متتبع ضغط الدم والسكر</h2>
        <p className="text-sm text-muted-foreground">مراقبة دقيقة لصحة الحامل مع تنبيهات ذكية</p>
      </div>

      {/* Tab Selector */}
      <div className="flex bg-muted rounded-lg p-1">
        <Button 
          variant={activeTab === 'bp' ? 'default' : 'ghost'}
          className="flex-1"
          onClick={() => setActiveTab('bp')}
        >
          <Heart className="w-4 h-4 mr-2" />
          ضغط الدم
        </Button>
        <Button 
          variant={activeTab === 'glucose' ? 'default' : 'ghost'}
          className="flex-1"
          onClick={() => setActiveTab('glucose')}
        >
          <Droplets className="w-4 h-4 mr-2" />
          السكر
        </Button>
      </div>

      {/* Blood Pressure Tab */}
      {activeTab === 'bp' && (
        <div className="space-y-6">
          {/* BP Input Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                قياس ضغط الدم الجديد
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBPSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="systolic">الضغط الانقباضي</Label>
                    <Input
                      id="systolic"
                      type="number"
                      placeholder="120"
                      value={systolic}
                      onChange={(e) => setSystolic(e.target.value)}
                      min="60"
                      max="200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="diastolic">الضغط الانبساطي</Label>
                    <Input
                      id="diastolic"
                      type="number"
                      placeholder="80"
                      value={diastolic}
                      onChange={(e) => setDiastolic(e.target.value)}
                      min="40"
                      max="130"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bp-notes">ملاحظات (اختيارية)</Label>
                  <Textarea
                    id="bp-notes"
                    placeholder="أي ملاحظات حول الظروف أو الأعراض..."
                    value={bpNotes}
                    onChange={(e) => setBpNotes(e.target.value)}
                    rows={2}
                  />
                </div>

                <Button type="submit" className="w-full">
                  <Heart className="w-4 h-4 mr-2" />
                  تسجيل قياس ضغط الدم
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* BP History */}
          <Card>
            <CardHeader>
              <CardTitle>تاريخ قياسات ضغط الدم</CardTitle>
            </CardHeader>
            <CardContent>
              {bpEntries.length === 0 ? (
                <div className="text-center py-8">
                  <Heart className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">لم يتم تسجيل أي قياسات لضغط الدم بعد</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {bpEntries.slice(0, 10).map((entry) => {
                    const status = getBPStatus(entry.systolic, entry.diastolic);
                    const StatusIcon = status.icon;
                    
                    return (
                      <div key={entry.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <StatusIcon className={`w-5 h-5 ${
                            status.color === 'destructive' ? 'text-red-500' : 
                            status.color === 'secondary' ? 'text-orange-500' : 'text-green-500'
                          }`} />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{entry.systolic}/{entry.diastolic}</span>
                              <Badge variant={status.color as any}>{status.text}</Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {formatDate(entry.date)} - الأسبوع {entry.week}
                            </div>
                            {entry.notes && (
                              <p className="text-xs text-muted-foreground mt-1">{entry.notes}</p>
                            )}
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => deleteEntry('bp', entry.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Glucose Tab */}
      {activeTab === 'glucose' && (
        <div className="space-y-6">
          {/* Glucose Input Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Droplets className="w-5 h-5 text-blue-500" />
                قياس السكر الجديد
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleGlucoseSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="glucose">مستوى السكر (mg/dL)</Label>
                  <Input
                    id="glucose"
                    type="number"
                    placeholder="100"
                    value={glucose}
                    onChange={(e) => setGlucose(e.target.value)}
                    min="50"
                    max="500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="measurement-type">نوع القياس</Label>
                  <Select value={measurementType} onValueChange={setMeasurementType as any}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="صائم">صائم (8+ ساعات)</SelectItem>
                      <SelectItem value="قبل الوجبة">قبل الوجبة</SelectItem>
                      <SelectItem value="بعد الوجبة">بعد الوجبة (ساعتين)</SelectItem>
                      <SelectItem value="عشوائي">عشوائي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="glucose-notes">ملاحظات (اختيارية)</Label>
                  <Textarea
                    id="glucose-notes"
                    placeholder="نوع الطعام المتناول، الوقت، الأعراض..."
                    value={glucoseNotes}
                    onChange={(e) => setGlucoseNotes(e.target.value)}
                    rows={2}
                  />
                </div>

                <Button type="submit" className="w-full">
                  <Droplets className="w-4 h-4 mr-2" />
                  تسجيل قياس السكر
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Glucose History */}
          <Card>
            <CardHeader>
              <CardTitle>تاريخ قياسات السكر</CardTitle>
            </CardHeader>
            <CardContent>
              {glucoseEntries.length === 0 ? (
                <div className="text-center py-8">
                  <Droplets className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">لم يتم تسجيل أي قياسات للسكر بعد</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {glucoseEntries.slice(0, 10).map((entry) => {
                    const typeKey = entry.measurementType === 'صائم' ? 'fasting' :
                                  entry.measurementType === 'بعد الوجبة' ? 'postMeal' :
                                  entry.measurementType === 'قبل الوجبة' ? 'preMeal' : 'random';
                    const status = getGlucoseStatus(entry.glucose, typeKey);
                    const StatusIcon = status.icon;
                    
                    return (
                      <div key={entry.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <StatusIcon className={`w-5 h-5 ${
                            status.color === 'destructive' ? 'text-red-500' : 
                            status.color === 'secondary' ? 'text-orange-500' : 'text-green-500'
                          }`} />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{entry.glucose} mg/dL</span>
                              <Badge variant={status.color as any}>{status.text}</Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {formatDate(entry.date)} - {entry.measurementType} - الأسبوع {entry.week}
                            </div>
                            {entry.notes && (
                              <p className="text-xs text-muted-foreground mt-1">{entry.notes}</p>
                            )}
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => deleteEntry('glucose', entry.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Reference Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">النطاقات الطبيعية أثناء الحمل</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-500" />
                ضغط الدم (mmHg)
              </h4>
              <div className="space-y-1 text-muted-foreground">
                <div>طبيعي: أقل من 120/80</div>
                <div>مرتفع نسبياً: 130-139/85-89</div>
                <div>مرتفع: 140/90 أو أعلى</div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Droplets className="w-4 h-4 text-blue-500" />
                السكر (mg/dL)
              </h4>
              <div className="space-y-1 text-muted-foreground">
                <div>صائم: أقل من 95</div>
                <div>قبل الوجبة: أقل من 95</div>
                <div>بعد الوجبة: أقل من 120</div>
                <div>عشوائي: أقل من 140</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BloodPressureGlucoseTracker;