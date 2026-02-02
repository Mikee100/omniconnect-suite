import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import AiPerformanceDashboard from "./pages/AiPerformanceDashboard";
import AIObservability from "./pages/AIObservability";
import QueueDashboard from "./pages/QueueDashboard";
import MpesaTest from "./pages/MpesaTest";
import Bookings from "./pages/Bookings";
import Conversations from "./pages/Conversations";
import Customers from "./pages/Customers";
import CustomerDetailsPage from "./pages/CustomerDetailsPage";
import WhatsApp from "./pages/WhatsApp";
import Instagram from "./pages/Instagram";
import KnowledgeBase from "./pages/KnowledgeBase";
import Settings from "./pages/Settings";
import PackagesPage from "./pages/Packages";
import AIPromptSettings from "./pages/AIPromptSettings";
import AITestChat from "./pages/AITestChat";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import { useAuthStore } from "./state/authStore";
import Escalations from "./pages/Escalations";
import Notifications from "./pages/Notifications";
import MessengerPage from "./pages/MessengerPage";
import HealthMonitoring from "./pages/HealthMonitoring";

const queryClient = new QueryClient();

const AppRouter = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookings"
            element={
              <ProtectedRoute>
                <Layout>
                  <Bookings />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/conversations"
            element={
              <ProtectedRoute>
                <Layout>
                  <Conversations />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers"
            element={
              <ProtectedRoute>
                <Layout>
                  <Customers />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers/:customerId"
            element={
              <ProtectedRoute>
                <Layout>
                  <CustomerDetailsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/escalations"
            element={
              <ProtectedRoute>
                <Layout>
                  <Escalations />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/whatsapp"
            element={
              <ProtectedRoute>
                <Layout>
                  <WhatsApp />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/mpesa-test"
            element={
              <ProtectedRoute>
                <Layout>
                  <MpesaTest />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/queue-dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <QueueDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai-performance"
            element={
              <ProtectedRoute>
                <Layout>
                  <AiPerformanceDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai-observability"
            element={
              <ProtectedRoute>
                <Layout>
                  <AIObservability />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/packages"
            element={
              <ProtectedRoute>
                <Layout>
                  <PackagesPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/instagram"
            element={
              <ProtectedRoute>
                <Layout>
                  <Instagram />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/knowledge-base"
            element={
              <ProtectedRoute>
                <Layout>
                  <KnowledgeBase />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai-test-chat"
            element={
              <ProtectedRoute>
                <Layout>
                  <AITestChat />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Layout>
                  <Settings />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai-prompt-settings"
            element={
              <ProtectedRoute>
                <Layout>
                  <AIPromptSettings />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Layout>
                  <Notifications />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/messenger"
            element={
              <ProtectedRoute>
                <Layout>
                  <MessengerPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/health"
            element={
              <ProtectedRoute>
                <Layout>
                  <HealthMonitoring />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default AppRouter;
