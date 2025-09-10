import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, AlertCircle, Info, Phone } from 'lucide-react';

interface RedFlagsProps {
  redFlags: {
    urgent: string[];
    concerning: string[];
    normal: string[];
  };
  week: number;
}

const RedFlags: React.FC<RedFlagsProps> = ({ redFlags, week }) => {
  return (
    <div dir="rtl" className="text-right">
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-600">
          <AlertTriangle className="w-5 h-5" />
          العلامات المهمة - الأسبوع {week}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          معرفة هذه العلامات يساعدك على الاطمئنان أو طلب المساعدة في الوقت المناسب
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* العلامات الطارئة */}
        <div className="space-y-3">
          <Alert className="border-red-200 bg-red-50 dark:bg-red-950/20">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription>
              <div className="space-y-3">
                <div>
                  <h4 className="font-bold text-red-800 dark:text-red-300 mb-2">
                    🚨 علامات طارئة - اطلبي المساعدة فوراً
                  </h4>
                  <p className="text-xs text-red-700 dark:text-red-400 mb-3">
                    إذا ظهرت أي من هذه الأعراض، توجهي للمستشفى أو اتصلي بالطبيب فوراً
                  </p>
                </div>
                
                <div className="space-y-2">
                  {redFlags.urgent.map((flag, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-red-100 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800"
                    >
                      <span className="text-red-600 font-bold text-lg">⚠️</span>
                      <span className="text-sm font-medium text-red-800 dark:text-red-200">
                        {flag}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="bg-red-100 dark:bg-red-900/20 rounded-lg p-3 border border-red-200 dark:border-red-800">
                  <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm font-bold">اتصلي فوراً: رقم الطوارئ أو طبيبك</span>
                  </div>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </div>

        {/* العلامات المقلقة */}
        <div className="space-y-3">
          <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription>
              <div className="space-y-3">
                <div>
                  <h4 className="font-bold text-orange-800 dark:text-orange-300 mb-2">
                    ⚡ علامات تستدعي الانتباه
                  </h4>
                  <p className="text-xs text-orange-700 dark:text-orange-400 mb-3">
                    هذه الأعراض تحتاج لاستشارة طبية خلال 24-48 ساعة
                  </p>
                </div>
                
                <div className="space-y-2">
                  {redFlags.concerning.map((flag, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800"
                    >
                      <span className="text-orange-600 text-lg">⚠️</span>
                      <span className="text-sm text-orange-800 dark:text-orange-200">
                        {flag}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </div>

        {/* الأعراض الطبيعية */}
        <div className="space-y-3">
          <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
            <Info className="h-4 w-4 text-green-600" />
            <AlertDescription>
              <div className="space-y-3">
                <div>
                  <h4 className="font-bold text-green-800 dark:text-green-300 mb-2">
                    ✅ أعراض طبيعية لكن قد تقلقك
                  </h4>
                  <p className="text-xs text-green-700 dark:text-green-400 mb-3">
                    هذه الأعراض طبيعية في الحمل، لكن يمكن مناقشتها مع الطبيب في الزيارة القادمة
                  </p>
                </div>
                
                <div className="space-y-2">
                  {redFlags.normal.map((flag, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-2 bg-green-100 dark:bg-green-900/20 rounded-lg"
                    >
                      <span className="text-green-600 text-lg">✅</span>
                      <span className="text-sm text-green-800 dark:text-green-200">
                        {flag}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </div>

        {/* نصيحة عامة */}
        <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <span className="text-2xl">👩‍⚕️</span>
            <div>
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
                نصيحة د.عثمان المهمة
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                الأم التي تثق في حدسها وتتواصل مع طبيبها هي أم حكيمة. 
                لا تترددي في السؤال - الطبيب موجود لطمأنتك وحماية طفلك.
                {week <= 12 && " في الأسابيع الأولى، كوني أكثر حذراً ومتابعة."}
                {week > 28 && " في الثلث الأخير، راقبي حركة طفلك يومياً."}
              </p>
            </div>
          </div>
        </div>

        {/* معلومات الاتصال الطارئ */}
        <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
          <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
            <Phone className="w-4 h-4" />
            أرقام مهمة لحفظها
          </h4>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <p>📞 عيادة د.عثمان: [رقم العيادة]</p>
            <p>🚨 طوارئ الولادة: 999 أو [رقم المستشفى]</p>
            <p>💬 واتساب الاستشارات: [رقم الواتساب]</p>
          </div>
        </div>
      </CardContent>
    </Card>
    </div>
  );
};

export default RedFlags;