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
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-secondary rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-accent rounded-full blur-2xl animate-pulse delay-500"></div>
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
        <div className="relative mb-6">
          {/* Glow Effect */}
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl scale-150 animate-pulse"></div>
          
          {/* Main Logo Circle */}
          <div 
            className="
              relative w-32 h-32 md:w-40 md:h-40
              rounded-full flex items-center justify-center
              shadow-2xl
              animate-bounce-gentle
            "
          >
            <img 
              src="/lovable-uploads/1e1120b6-69dd-4ce1-89bb-55e30b39b4d6.png"
              alt="Dr. Osman Pregnancy Companion Logo"
              className="w-full h-full object-contain"
              onLoad={() => setLogoLoaded(true)}
              onError={() => setLogoLoaded(true)} // Continue even if image fails to load
            />
            
            {/* Sparkles */}
            <Sparkles 
              className="absolute -top-3 -right-3 w-8 h-8 text-accent animate-pulse" 
              fill="currentColor"
            />
          </div>
        </div>

        {/* App Title */}
        <div 
          className={`
            space-y-2 transform transition-all duration-700 delay-300
            ${stage >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
          `}
        >
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent drop-shadow-lg">
            Dr. Osman
          </h1>
          <p className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-pink-600 bg-clip-text text-transparent">
            Pregnancy Companion
          </p>
          <p className="text-sm text-muted-foreground max-w-xs">
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