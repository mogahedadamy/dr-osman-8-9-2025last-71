import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, X } from "lucide-react";

const MedicalDisclaimer = () => {
  const [hasAccepted, setHasAccepted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem("medical-disclaimer-accepted");
    const isAccepted = accepted === "true";
    setHasAccepted(isAccepted);
    setIsVisible(!isAccepted);
  }, []);

  const handleAccept = () => {
    localStorage.setItem("medical-disclaimer-accepted", "true");
    setHasAccepted(true);
    setIsVisible(false);
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full mx-auto shadow-2xl border-2 border-yellow-300">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
              <h3 className="text-lg font-bold text-yellow-800">تنبيه طبي مهم</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-4 text-sm">
            <p className="text-gray-700 leading-relaxed">
              هذا التطبيق مخصص <strong>للأغراض التعليمية والمعلوماتية فقط</strong> ولا يُغني بأي حال من الأحوال عن:
            </p>
            
            <ul className="list-disc list-inside space-y-1 text-gray-600 mr-4">
              <li>الاستشارة الطبية المتخصصة</li>
              <li>الفحوصات الطبية الدورية</li>
              <li>متابعة الطبيب المختص</li>
              <li>العلاج الطبي المناسب</li>
            </ul>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-xs font-medium">
                ⚠️ في حالة وجود أي أعراض غير طبيعية أو مخاوف صحية، يجب التوجه فوراً للطبيب المختص.
              </p>
            </div>
            
            <p className="text-gray-600 text-xs">
              بالمتابعة، أنت توافقين على أن استخدام هذا التطبيق على مسؤوليتك الشخصية.
            </p>
          </div>

          <div className="flex gap-3 mt-6">
            <Button 
              onClick={handleAccept}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              فهمت وأوافق
            </Button>
            <Button 
              variant="outline" 
              onClick={handleClose}
              className="flex-1"
            >
              إغلاق
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MedicalDisclaimer;