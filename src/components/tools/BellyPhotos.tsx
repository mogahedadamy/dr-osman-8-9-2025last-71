import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, Upload, Calendar, Download, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useBellyPhotosDB } from "@/hooks/useLocalStorage";

interface PhotoEntry {
  id: string;
  week: number;
  date: string;
  photo: string;
  notes?: string;
}

const BellyPhotos = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { photos, loading, addPhoto, deletePhoto } = useBellyPhotosDB();
  const [currentWeek, setCurrentWeek] = useState(20);

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

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
      const newPhoto: PhotoEntry = {
        id: Date.now().toString(),
        week: currentWeek,
        date: new Date().toLocaleDateString('ar'),
        photo: e.target?.result as string
      };

      await addPhoto(newPhoto);
      
      toast({
        title: "تم إضافة الصورة بنجاح",
        description: `صورة الأسبوع ${currentWeek} من الحمل`
      });
    };
    
    reader.readAsDataURL(file);
  };

  const handleDeletePhoto = async (id: string) => {
    await deletePhoto(id);
    
    toast({
      title: "تم حذف الصورة",
      description: "تم إزالة الصورة من المجموعة"
    });
  };

  const downloadTimelapseData = () => {
    const dataStr = JSON.stringify(photos, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'belly-photos-timeline.json';
    link.click();
    
    toast({
      title: "تم تنزيل البيانات",
      description: "يمكنك الآن نسخ احتياطية من صور رحلة الحمل"
    });
  };

  const generateTimelapseView = () => {
    return photos.map(photo => (
      <Card key={photo.id} className="relative group">
        <CardContent className="p-2">
          <div className="relative">
            <img 
              src={photo.photo} 
              alt={`الأسبوع ${photo.week}`}
              className="w-full h-32 object-cover rounded-lg"
            />
            <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground">
              الأسبوع {photo.week}
            </Badge>
            <Button
              size="sm"
              variant="destructive"
              className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => handleDeletePhoto(photo.id)}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
          <div className="mt-2 text-center">
            <p className="text-xs text-muted-foreground">{photo.date}</p>
          </div>
        </CardContent>
      </Card>
    ));
  };

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">جاري تحميل الصور...</p>
        </div>
      ) : (
        <>
          {/* Upload Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-4">
          <label className="text-sm font-medium">الأسبوع الحالي:</label>
          <input 
            type="number" 
            value={currentWeek}
            onChange={(e) => setCurrentWeek(Number(e.target.value))}
            min="4"
            max="42"
            className="w-16 text-center border rounded px-2 py-1"
          />
        </div>

        <div className="flex gap-2 justify-center">
          <Button 
            onClick={() => fileInputRef.current?.click()}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Camera className="w-4 h-4 ml-2" />
            إضافة صورة جديدة
          </Button>
          
          {photos.length > 0 && (
            <Button 
              onClick={downloadTimelapseData}
              variant="outline"
            >
              <Download className="w-4 h-4 ml-2" />
              تنزيل البيانات
            </Button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoUpload}
          className="hidden"
        />
      </div>

      {/* Statistics */}
      {photos.length > 0 && (
        <Card className="bg-gradient-card">
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{photos.length}</div>
                <div className="text-sm text-muted-foreground">صورة</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-secondary">
                  {photos.length > 0 ? photos[photos.length - 1].week - photos[0].week : 0}
                </div>
                <div className="text-sm text-muted-foreground">أسبوع موثق</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-wellness">
                  {photos.length > 0 ? photos[0].week : 0}
                </div>
                <div className="text-sm text-muted-foreground">أول صورة</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Photos Timeline */}
      {photos.length > 0 ? (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-foreground">خط زمني لرحلة الحمل</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {generateTimelapseView()}
          </div>
        </div>
      ) : (
        <Card className="border-dashed border-2 border-muted">
          <CardContent className="p-8 text-center">
            <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">ابدئي في توثيق رحلة الحمل</h3>
            <p className="text-muted-foreground text-sm mb-4">
              التقطي صوراً أسبوعية لتتبع نمو البطن وإنشاء ذكريات جميلة
            </p>
            <Button 
              onClick={() => fileInputRef.current?.click()}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Camera className="w-4 h-4 ml-2" />
              إضافة أول صورة
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      <div className="bg-muted/50 rounded-lg p-4">
        <h4 className="font-semibold text-foreground mb-2">📸 نصائح للتصوير:</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• التقطي الصورة في نفس الوقت والمكان كل أسبوع</li>
          <li>• استخدمي نفس الملابس أو الألوان المشابهة</li>
          <li>• قفي بنفس الوضعية (من الجانب أفضل)</li>
          <li>• تأكدي من الإضاءة الجيدة</li>
          <li>• سجلي الأسبوع وتاريخ كل صورة</li>
        </ul>
      </div>
        </>
      )}
    </div>
  );
};

export default BellyPhotos;