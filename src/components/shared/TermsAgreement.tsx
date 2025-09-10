import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  FileText, 
  Shield, 
  AlertTriangle, 
  X,
  ExternalLink
} from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useNavigate } from "react-router-dom";

const TermsAgreement = () => {
  const navigate = useNavigate();
  const [termsAccepted, setTermsAccepted] = useLocalStorage('termsAccepted', false);
  const [isVisible, setIsVisible] = useState(false);
  const [hasAgreed, setHasAgreed] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // Show terms on first visit only
  useEffect(() => {
    const isFirstTimeUser = !termsAccepted;
    if (isFirstTimeUser) {
      // Small delay to ensure UI is ready
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [termsAccepted]);

  const handleAccept = () => {
    if (hasAgreed) {
      setTermsAccepted(true);
      setIsVisible(false);
      // Set flag to mark user as not first-time anymore
      localStorage.setItem('isFirstTimeUser', 'false');
      // Trigger tutorial after accepting
      setTimeout(() => {
        (window as any).startInteractiveTutorial?.();
      }, 1000);
    }
  };

  const handleReject = () => {
    setIsExiting(true);
    // Try different methods to exit the app
    setTimeout(() => {
      // For mobile apps (Capacitor)
      if ((window as any).App?.exitApp) {
        (window as any).App.exitApp();
      }
      // For web browsers
      else if (window.history.length > 1) {
        window.history.back();
      }
      // Last resort - close window (only works if opened by script)
      else {
        window.close();
        // If can't close, redirect to blank page
        window.location.href = 'about:blank';
      }
    }, 500);
  };

  if (!isVisible || termsAccepted) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-2xl border-2 border-primary/30 bg-background/95 backdrop-blur-md">
        <CardHeader className="text-center border-b border-border/50">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="w-6 h-6 text-primary" />
            <CardTitle className="text-xl font-bold text-foreground">
              الشروط والأحكام
            </CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            يجب الموافقة على الشروط للمتابعة
          </p>
        </CardHeader>

        <CardContent className="p-6">
          {/* Terms Content */}
          <ScrollArea className="h-64 mb-6 p-4 border border-border/50 rounded-lg bg-muted/20">
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-2">
                <FileText className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-foreground mb-1">اتفاقية الاستخدام</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    مرحباً بك في تطبيق د.عثمان للحمل والولادة. باستخدام هذا التطبيق، فإنك توافق على الالتزام بهذه الشروط والأحكام.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-foreground mb-1">إخلاء المسؤولية الطبية</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    المعلومات المقدمة في هذا التطبيق هي لأغراض تعليمية فقط ولا تغني عن استشارة طبيب مختص. 
                    لا تستخدمي هذا التطبيق لتشخيص أو علاج أي حالة طبية.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-foreground mb-1">حماية البيانات</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    نحن ملتزمون بحماية خصوصيتك. بيانات النكا لشخصية محمية ولا نشاركها مع أطراف ثالثة بدون موافقتك.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <FileText className="w-4 h-4 text-blue-500 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-foreground mb-1">الاستخدام المسؤول</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    يجب استخدام التطبيق بطريقة مسؤولة ولأغراض مشروعة فقط. 
                    في حالة الطوارئ الطبية، اتصلي بالطبيب أو الطوارئ فوراً.
                  </p>
                </div>
              </div>
            </div>
          </ScrollArea>

          {/* Agreement Checkbox */}
          <div className="flex items-start gap-3 mb-6 p-3 bg-primary/5 rounded-lg border border-primary/20">
            <Checkbox
              id="agreement"
              checked={hasAgreed}
              onCheckedChange={(checked) => setHasAgreed(checked as boolean)}
              className="mt-1"
            />
            <label htmlFor="agreement" className="text-sm text-foreground leading-relaxed cursor-pointer">
              أوافق على{' '}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/terms-of-service');
                }}
                className="font-semibold text-primary hover:text-primary/80 underline transition-colors"
              >
                الشروط والأحكام
              </button>
              {' '}و{' '}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/privacy-policy');
                }}
                className="font-semibold text-primary hover:text-primary/80 underline transition-colors"
              >
                سياسة الخصوصية
              </button>
              {' '}وأتفهم أن المعلومات المقدمة هي لأغراض تعليمية ولا تغني عن استشارة طبيب مختص.
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleReject}
              variant="outline"
              className="flex-1 border-destructive/30 text-destructive hover:bg-destructive/10"
              disabled={isExiting}
            >
              {isExiting ? (
                <>
                  <X className="w-4 h-4 mr-2" />
                  جاري الخروج...
                </>
              ) : (
                <>
                  <X className="w-4 h-4 mr-2" />
                  رفض وخروج
                </>
              )}
            </Button>
            
            <Button
              onClick={handleAccept}
              disabled={!hasAgreed}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Shield className="w-4 h-4 mr-2" />
              موافق ومتابعة
            </Button>
          </div>

          {/* Help text */}
          <p className="text-xs text-muted-foreground text-center mt-4">
            يمكنك مراجعة الشروط الكاملة في أي وقت من الإعدادات
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TermsAgreement;