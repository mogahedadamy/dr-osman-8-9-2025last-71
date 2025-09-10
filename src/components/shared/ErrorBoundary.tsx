import { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('خطأ في التطبيق:', error, errorInfo);
  }

  private handleRefresh = () => {
    window.location.reload();
  };

  private handleHome = () => {
    // استخدام التنقل الصحيح بدلاً من تحديث الصفحة
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.pathname = '/';
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-md shadow-xl border-2 border-destructive/20">
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-destructive" />
                </div>
              </div>
              
              <h2 className="text-xl font-bold text-foreground mb-2">
                عذراً، حدث خطأ غير متوقع
              </h2>
              
              <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
                نعتذر عن هذا الإزعاج. يرجى المحاولة مرة أخرى أو العودة للصفحة الرئيسية.
              </p>

              {/* Error Details (Development Mode) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mb-4 p-3 bg-destructive/5 border border-destructive/20 rounded-lg text-left">
                  <p className="text-xs text-destructive font-mono break-all">
                    {this.state.error.message}
                  </p>
                </div>
              )}

              <div className="flex gap-3 justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={this.handleRefresh}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  إعادة تحميل
                </Button>
                
                <Button
                  size="sm"
                  onClick={this.handleHome}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  الصفحة الرئيسية
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;