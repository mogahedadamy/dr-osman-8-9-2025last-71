import { motion } from "framer-motion";
import { Wrench, Clock, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface UnderDevelopmentScreenProps {
  onClose: () => void;
  title?: string;
}

const UnderDevelopmentScreen = ({ 
  onClose, 
  title = "نظام الحجوزات" 
}: UnderDevelopmentScreenProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="w-full max-w-md"
      >
        <Card className="border-2 border-primary/20 shadow-2xl overflow-hidden">
          <CardContent className="p-0">
            {/* Header with gradient */}
            <div className="bg-gradient-to-br from-primary to-secondary p-6 text-center relative overflow-hidden">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute top-4 right-4 text-white/20"
              >
                <Sparkles className="w-8 h-8" />
              </motion.div>
              
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute bottom-4 left-4 text-white/20"
              >
                <Wrench className="w-6 h-6" />
              </motion.div>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <Wrench className="w-10 h-10 text-white" />
              </motion.div>
              
              <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
              <p className="text-white/90 text-sm">قيد التطوير</p>
            </div>

            {/* Content */}
            <div className="p-6 text-center space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">جاري العمل على هذه الميزة</span>
                </div>
                
                <p className="text-foreground/80 leading-relaxed">
                  نعمل بجد لتطوير هذه الخدمة لتقديم أفضل تجربة ممكنة. 
                  ستكون متاحة قريباً بإذن الله.
                </p>
              </motion.div>

              {/* Progress Animation */}
              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>التقدم</span>
                  <span>75%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "75%" }}
                    transition={{ delay: 0.6, duration: 1.5, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                  />
                </div>
              </motion.div>

              {/* Features coming soon */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-muted/50 rounded-lg p-4 space-y-2"
              >
                <h4 className="font-semibold text-foreground mb-3">المميزات القادمة:</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  {[
                    "حجز المواعيد بسهولة",
                    "اختيار الطبيب المناسب", 
                    "تأكيد المواعيد فوري",
                    "تذكيرات ذكية"
                  ].map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + (index * 0.1) }}
                      className="flex items-center gap-2"
                    >
                      <ArrowRight className="w-3 h-3 text-primary" />
                      <span>{feature}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <Button 
                onClick={onClose}
                className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                size="lg"
              >
                عودة للصفحة الرئيسية
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default UnderDevelopmentScreen;