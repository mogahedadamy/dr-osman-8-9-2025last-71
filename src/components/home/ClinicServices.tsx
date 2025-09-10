import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { 
  Stethoscope, 
  Calendar, 
  Phone, 
  MapPin, 
  Clock,
  ArrowLeft
} from "lucide-react";

const ClinicServices = () => {
  const clinicInfo = {
    name: "Osman Pregnancy companion - رفيق الحمل الذكي",
    address: "عيادة د. عثمان المتخصصة",
    phone: "+249123456789",
    workingHours: "السبت - الخميس: 8 صباحاً - 6 مساءً",
    services: [
      "متابعة الحمل الشاملة",
      "الفحص بالسونار 4D",
      "فحوصات مخبرية متكاملة",
      "استشارات تغذية الحمل"
    ]
  };

  return (
    <div className="px-4 mb-6">
      <Card className="shadow-card overflow-hidden bg-gradient-to-br from-wellness/10 to-primary/5 border border-primary/20">
        <CardContent className="p-0">
          {/* Header */}
          <div className="bg-gradient-to-r from-wellness to-primary p-4 text-white">
            <div className="flex items-center gap-3">
              <div className="icon-3d icon-3d-wellness w-12 h-12 rounded-full flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold">خدمات التطبيق</h3>
                <p className="text-sm text-white/90">رعاية طبية متخصصة</p>
              </div>
              <Badge className="bg-white/20 text-white border-white/30">
                متاح الآن
              </Badge>
            </div>
          </div>

          {/* Clinic Info */}
          <div className="p-4">
            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-muted-foreground">{clinicInfo.address}</span>
              </div>
              
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-muted-foreground">{clinicInfo.phone}</span>
              </div>
              
              <div className="flex items-center gap-3 text-sm">
                <Clock className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-muted-foreground">{clinicInfo.workingHours}</span>
              </div>
            </div>

            {/* Services */}
            <div className="mb-4">
              <h4 className="font-semibold text-foreground mb-3 text-sm">خدماتنا المتخصصة:</h4>
              <div className="grid grid-cols-2 gap-2">
                {clinicInfo.services.map((service, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0"></div>
                    <span className="text-muted-foreground">{service}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Link to="/calendar">
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm">
                  <Calendar className="w-4 h-4 ml-2" />
                  حجز موعد
                </Button>
              </Link>
              
              <Button 
                variant="outline" 
                className="w-full border-primary text-primary hover:bg-primary/10 text-sm"
                onClick={() => window.open(`tel:${clinicInfo.phone}`)}
              >
                <Phone className="w-4 h-4 ml-2" />
                اتصال مباشر
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClinicServices;