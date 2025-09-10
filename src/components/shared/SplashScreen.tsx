import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [stage, setStage] = useState(0); // 0: fade in, 1: show content, 2: fade out
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [animationsComplete, setAnimationsComplete] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => setStage(1), 800); // Start showing content
    
    // Wait for logo to load and animations to complete
    const checkCompletion = () => {
      if (logoLoaded && animationsComplete) {
        // Wait additional time to let user see the full logo
        setTimeout(() => setStage(2), 1500); // Start fade out
        setTimeout(() => {
          setIsVisible(false);
          onComplete();
        }, 2000); // Complete splash
      }
    };

    if (stage === 1) {
      // Mark animations as complete after all animations finish
      const animationTimer = setTimeout(() => {
        setAnimationsComplete(true);
        checkCompletion();
      }, 2500); // Wait for all animations to complete

      return () => clearTimeout(animationTimer);
    }

    return () => clearTimeout(timer1);
  }, [onComplete, logoLoaded, animationsComplete, stage]);

  if (!isVisible) return null;

  return (
    <div 
      className={`
        fixed inset-0 z-50 flex items-center justify-center
        bg-gradient-to-br from-primary-light via-background to-secondary-soft
        transition-opacity duration-500
        ${stage === 2 ? 'opacity-0' : 'opacity-100'}
      `}
    >
      {/* Minimal Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/3 left-1/3 w-16 h-16 bg-primary rounded-full blur-2xl animate-pulse delay-1000"></div>
      </div>

      {/* Main Logo Content */}
      <div 
        className={`
          relative flex flex-col items-center justify-center text-center
          transform transition-all duration-1000 ease-out
          ${stage >= 1 ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}
        `}
      >
        {/* Logo Container */}
        <div className="relative mb-8">
          {/* Main Logo */}
          <div 
            className="
              relative w-40 h-40 md:w-48 md:h-48
              flex items-center justify-center
            "
          >
            <img 
              src="/lovable-uploads/1e1120b6-69dd-4ce1-89bb-55e30b39b4d6.png"
              alt="Dr. Osman Pregnancy Companion Logo"
              className="w-full h-full object-contain"
              onLoad={() => setLogoLoaded(true)}
              onError={() => setLogoLoaded(true)} // Continue even if image fails to load
            />
          </div>
        </div>

        {/* App Title */}
        <div 
          className={`
            space-y-3 transform transition-all duration-700 delay-300
            ${stage >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
          `}
        >
          <p className="text-sm text-muted-foreground">
            مرافقك الموثوق في رحلة الأمومة
          </p>
        </div>

        {/* Loading Animation */}
        <div 
          className={`
            mt-8 flex space-x-1 space-x-reverse transform transition-all duration-500 delay-700
            ${stage >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
          `}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`
                w-2 h-2 bg-primary rounded-full animate-pulse
              `}
              style={{
                animationDelay: `${i * 0.2}s`,
                animationDuration: '1s'
              }}
            ></div>
          ))}
        </div>
      </div>

      {/* Bottom Text */}
      <div 
        className={`
          absolute bottom-8 left-0 right-0 text-center
          transform transition-all duration-500 delay-1000
          ${stage >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
        `}
      >
        <p className="text-xs text-muted-foreground">
          مدعوم بالذكاء الاصطناعي
        </p>
      </div>
    </div>
  );
};

export default SplashScreen;