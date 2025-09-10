import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, Upload, Calendar, Download, Trash2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useBellyPhotosDB } from "@/hooks/useLocalStorage";
import { usePregnancyTracking } from "@/hooks/usePregnancyTracking";
import { BellyPhoto } from "@/types";

interface EnhancedBellyPhotosProps {
  className?: string;
}

const EnhancedBellyPhotos = ({ className }: EnhancedBellyPhotosProps) => {
  const { toast } = useToast();
  const { photos, loading, addPhoto, deletePhoto } = useBellyPhotosDB();
  const { currentWeek } = usePregnancyTracking();
  
  const [selectedWeek, setSelectedWeek] = useState(currentWeek);
  const [notes, setNotes] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handlePhotoUpload = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "حجم الصورة كبير جداً",
        description: "يرجى اختيار صورة أصغر من 5 ميجابايت",
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const newPhoto: BellyPhoto = {
        id: Date.now().toString(),
        week: selectedWeek,
        date: new Date().toLocaleDateString('ar'),
        photo: e.target?.result as string,
        notes: notes.trim() || undefined,
        createdAt: new Date().toISOString()
      };

      await addPhoto(newPhoto);
      
      toast({
        title: "تم إضافة الصورة بنجاح",
        description: `صورة الأسبوع ${selectedWeek} من الحمل`
      });

      setNotes('');
      setShowAddModal(false);
    };
    
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handlePhotoUpload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handlePhotoUpload(file);
    }
  };

  const handleDeletePhoto = async (id: string) => {
    await deletePhoto(id);
    toast({
      title: "تم حذف الصورة",
      description: "تم إزالة الصورة من المجموعة"
    });
  };

  const exportPhotosData = () => {
    const dataStr = JSON.stringify(photos, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `belly-photos-timeline-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    toast({
      title: "تم تنزيل البيانات",
      description: "يمكنك الآن عمل نسخة احتياطية من صور رحلة الحمل"
    });
  };

  const getPhotosByWeek = () => {
    if (!Array.isArray(photos)) return {};
    return photos.reduce((acc, photo) => {
      if (!acc[photo.week]) acc[photo.week] = [];
      acc[photo.week].push(photo);
      return acc;
    }, {} as Record<number, BellyPhoto[]>);
  };

  const photosByWeek = getPhotosByWeek();

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground mt-2">جاري تحميل الصور...</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-foreground">تتبع نمو البطن</h3>
          <p className="text-sm text-muted-foreground">توثيق رحلة الحمل بالصور</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowAddModal(true)}
            size="sm"
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 ml-1" />
            إضافة صورة
          </Button>
          {Array.isArray(photos) && photos.length > 0 && (
            <Button 
              onClick={exportPhotosData}
              variant="outline"
              size="sm"
            >
              <Download className="w-4 h-4 ml-1" />
              تصدير
            </Button>
          )}
        </div>
      </div>

      {/* Statistics */}
      {Array.isArray(photos) && photos.length > 0 && (
        <Card className="bg-gradient-card">
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{Array.isArray(photos) ? photos.length : 0}</div>
                <div className="text-sm text-muted-foreground">صورة</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-secondary">
                  {Object.keys(photosByWeek).length}
                </div>
                <div className="text-sm text-muted-foreground">أسبوع موثق</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-wellness">
                  {Math.min(...Object.keys(photosByWeek).map(Number))}
                </div>
                <div className="text-sm text-muted-foreground">أول أسبوع</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Photos Timeline */}
      {Array.isArray(photos) && photos.length > 0 ? (
        <div className="space-y-6">
           {Object.entries(photosByWeek)
             .sort(([a], [b]) => Number(b) - Number(a))
             .map(([week, weekPhotos]) => (
             <div key={week} className="space-y-3">
               <div className="flex items-center gap-2">
                 <Calendar className="w-5 h-5 text-primary" />
                 <h4 className="font-bold text-foreground">الأسبوع {week}</h4>
                 <Badge variant="secondary" className="text-xs">
                   {Array.isArray(weekPhotos) ? weekPhotos.length : 0} صورة
                 </Badge>
               </div>
               <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                 {Array.isArray(weekPhotos) && weekPhotos.map((photo: BellyPhoto) => (
                  <Card key={photo.id} className="relative group overflow-hidden">
                    <CardContent className="p-0">
                      <div className="relative">
                        <img 
                          src={photo.photo} 
                          alt={`الأسبوع ${photo.week}`}
                          className="w-full h-32 object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeletePhoto(photo.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="p-2">
                        <p className="text-xs text-muted-foreground">{photo.date}</p>
                        {photo.notes && (
                          <p className="text-xs text-foreground mt-1">{photo.notes}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card className="border-dashed border-2 border-muted">
          <CardContent className="p-8 text-center">
            <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">ابدئي في توثيق رحلة الحمل</h3>
            <p className="text-muted-foreground text-sm mb-4">
              التقطي صوراً أسبوعية لتتبع نمو البطن وإنشاء ذكريات جميلة
            </p>
            <Button 
              onClick={() => setShowAddModal(true)}
              className="bg-primary hover:bg-primary/90"
            >
              <Camera className="w-4 h-4 ml-2" />
              إضافة أول صورة
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add Photo Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-primary" />
              إضافة صورة جديدة
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="week">الأسبوع</Label>
              <Input
                id="week"
                type="number"
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(Number(e.target.value))}
                min="4"
                max="42"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">ملاحظات (اختياري)</Label>
              <Textarea
                id="notes"
                placeholder="كيف تشعرين اليوم؟ أي ملاحظات عن نمو البطن..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive ? 'border-primary bg-primary/5' : 'border-muted'
              }`}
              onDragEnter={() => setDragActive(true)}
              onDragLeave={() => setDragActive(false)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground mb-2">اسحبي الصورة هنا أو</p>
              <Button variant="outline" asChild>
                <label>
                  اختاري من الجهاز
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowAddModal(false)}
            >
              إلغاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tips */}
      <div className="bg-muted/50 rounded-lg p-4">
        <h4 className="font-semibold text-foreground mb-2">📸 نصائح للتصوير:</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• التقطي الصورة في نفس الوقت والمكان كل أسبوع</li>
          <li>• استخدمي نفس الملابس أو الألوان المشابهة</li>
          <li>• قفي بنفس الوضعية (من الجانب أفضل)</li>
          <li>• تأكدي من الإضاءة الجيدة</li>
          <li>• سجلي ملاحظاتك وأحاسيسك مع كل صورة</li>
        </ul>
      </div>
    </div>
  );
};

export default EnhancedBellyPhotos;