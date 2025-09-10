import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if it's iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Don't show if already installed or dismissed recently
      const dismissed = localStorage.getItem('pwa-prompt-dismissed');
      const lastDismissed = dismissed ? parseInt(dismissed) : 0;
      const daysSinceLastDismissal = (Date.now() - lastDismissed) / (1000 * 60 * 60 * 24);
      
      if (!dismissed || daysSinceLastDismissal > 7) {
        setTimeout(() => setShowPrompt(true), 3000); // Show after 3 seconds
      }
    };

    const handleAppInstalled = () => {
      setShowPrompt(false);
      setDeferredPrompt(null);
      toast({
        title: "تم تثبيت التطبيق بنجاح! 🎉",
        description: "يمكنك الآن الوصول إلى Dr. Osman من شاشتك الرئيسية"
      });
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [toast]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        toast({
          title: "شكراً لك! 🙏",
          description: "جاري تثبيت التطبيق..."
        });
      }
      
      setDeferredPrompt(null);
      setShowPrompt(false);
    } catch (error) {
      console.error('Error installing app:', error);
      toast({
        title: "خطأ في التثبيت",
        description: "حدث خطأ أثناء تثبيت التطبيق",
        variant: "destructive"
      });
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
  };

  const handleIOSInstall = () => {
    toast({
      title: "تثبيت التطبيق على iOS",
      description: "اضغط على زر المشاركة ثم 'إضافة إلى الشاشة الرئيسية'",
      duration: 8000
    });
    handleDismiss();
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 md:left-auto md:right-6 md:w-96">
      <Card className="shadow-lg border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3 space-x-reverse">
            <div className="bg-primary/10 p-2 rounded-full">
              <Download className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-foreground mb-1">
                ثبت تطبيق Dr. Osman
              </h3>
              <p className="text-xs text-muted-foreground mb-3">
                احصلي على تجربة أفضل وأسرع مع التطبيق المثبت على جهازك
              </p>
              <div className="flex space-x-2 space-x-reverse">
                {isIOS ? (
                  <Button 
                    size="sm" 
                    onClick={handleIOSInstall}
                    className="text-xs"
                  >
                    كيفية التثبيت
                  </Button>
                ) : (
                  <Button 
                    size="sm" 
                    onClick={handleInstallClick}
                    disabled={!deferredPrompt}
                    className="text-xs"
                  >
                    تثبيت الآن
                  </Button>
                )}
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={handleDismiss}
                  className="text-xs"
                >
                  لاحقاً
                </Button>
              </div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDismiss}
              className="p-1 h-auto"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PWAInstallPrompt;