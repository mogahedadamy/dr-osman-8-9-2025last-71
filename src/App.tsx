import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppInitializer from "@/components/shared/AppInitializer";
import ScrollToTop from "@/components/shared/ScrollToTop";
import MedicalDisclaimer from "@/components/shared/MedicalDisclaimer";
import ProductionBuildOptimizations from "@/components/shared/ProductionBuildOptimizations";
import GooglePlayOptimizations from "@/components/shared/GooglePlayOptimizations";
import FinalProductionOptimizations from "@/components/shared/FinalProductionOptimizations";
import EnhancedOfflineIndicator from "@/components/mobile/EnhancedOfflineIndicator";
import { DynamicContentProvider } from "@/components/mobile/DynamicContentProvider";
import { ContentSyncProvider } from "@/components/mobile/ContentBridge";
import QuickPerformanceBoost from "@/components/performance/QuickPerformanceBoost";
import AutoSpeedBoost from "@/components/performance/AutoSpeedBoost";
// Removed useLightningToast import to fix React hooks error
import ServiceWorkerManager from "@/components/performance/ServiceWorkerManager";
import { SettingsProvider } from "@/providers/SettingsProvider";
import Index from "./pages/Index";
import Tips from "./pages/Tips";
import Reminders from "./pages/Reminders";
import DailyLog from "./pages/DailyLog";
// تحسين الصفحات الثقيلة بـ lazy loading
import { 
  FastChat, 
  FastLibrary, 
  FastTools, 
  FastStatistics, 
  FastSettings, 
  FastProfile 
} from "./components/performance/OptimizedPages";
import ShoppingList from "./pages/ShoppingList";
import PreparationChecklist from "./pages/PreparationChecklist";
import Calendar from "./pages/Calendar";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import PrivacyPolicyDetailed from "./pages/PrivacyPolicyDetailed";
import TermsOfService from "./pages/TermsOfService";
import AppInstructions from "./pages/AppInstructions";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import PremiumAccess from "./pages/PremiumAccess";
import PaymentSubmission from "./pages/PaymentSubmission";
import PaymentSuccess from "./pages/PaymentSuccess";
import AdminDashboard from "./pages/AdminDashboard";
import BookingSystem from "./pages/BookingSystem";
import OsmanTips from "./pages/OsmanTips";
import SmartReminders from "./pages/SmartReminders";
import ContentManagement from "./pages/ContentManagement";
import AllServices from "./pages/AllServices";
import HealthTracker from "./pages/HealthTracker";
import WeeklyPregnancy from "./pages/WeeklyPregnancy";
import ProtectedRoute from "./components/shared/ProtectedRoute";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 دقائق
      gcTime: 1000 * 60 * 30, // 30 دقيقة
      retry: (failureCount, error) => {
        if (failureCount >= 3) return false;
        return true;
      },
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <SettingsProvider>
        <AppInitializer>
          <ContentSyncProvider>
            <DynamicContentProvider>
              <ProductionBuildOptimizations />
              <GooglePlayOptimizations />
              <FinalProductionOptimizations />
              <ServiceWorkerManager />
              <EnhancedOfflineIndicator />
              <AutoSpeedBoost />
              <MedicalDisclaimer />
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <ScrollToTop />
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/tips" element={<Tips />} />
                  <Route path="/reminders" element={<Reminders />} />
                  <Route path="/library" element={<FastLibrary />} />
                  <Route path="/chat" element={<FastChat />} />
                  <Route path="/daily-log" element={<DailyLog />} />
                  <Route path="/profile" element={<FastProfile />} />
                  <Route path="/settings" element={<FastSettings />} />
                  <Route path="/shopping-list" element={<ShoppingList />} />
                  <Route path="/preparation-checklist" element={<PreparationChecklist />} />
                  <Route path="/calendar" element={<Calendar />} />
                  <Route path="/statistics" element={<FastStatistics />} />
                  <Route path="/tools" element={<FastTools />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="/privacy-policy-detailed" element={<PrivacyPolicyDetailed />} />
                  <Route path="/terms-of-service" element={<TermsOfService />} />
                  <Route path="/instructions" element={<AppInstructions />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/admin-login" element={<AdminLogin />} />
                  <Route path="/premium-access" element={<PremiumAccess />} />
                  <Route path="/payment-submission" element={<PaymentSubmission />} />
                  <Route path="/payment-success" element={<PaymentSuccess />} />
                  <Route path="/admin" element={
                    <ProtectedRoute requireAdmin={true}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/osman-tips" element={<OsmanTips />} />
                  <Route path="/smart-reminders" element={<SmartReminders />} />
                  <Route path="/booking-system" element={<BookingSystem />} />
                  <Route path="/booking" element={<BookingSystem />} />
                  <Route path="/health-tracker" element={<HealthTracker />} />
                  <Route path="/weekly-pregnancy" element={<WeeklyPregnancy />} />
                  <Route path="/all-services" element={<AllServices />} />
                  <Route path="/content-management" element={
                    <ProtectedRoute requireAdmin={true}>
                      <ContentManagement />
                    </ProtectedRoute>
                  } />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </DynamicContentProvider>
          </ContentSyncProvider>
        </AppInitializer>
      </SettingsProvider>
    </QueryClientProvider>
  );
};

export default App;
