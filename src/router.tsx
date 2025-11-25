import { Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import AiPerformanceDashboard from "./pages/AiPerformanceDashboard";
  
import Bookings from "./pages/Bookings";
import Conversations from "./pages/Conversations";
import WhatsApp from "./pages/WhatsApp";
import Instagram from "./pages/Instagram";
import KnowledgeBase from "./pages/KnowledgeBase";
import Settings from "./pages/Settings";
import PackagesPage from "./pages/Packages";
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
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import { useAuthStore } from "./state/authStore";

const AppRouter = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
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
        path="/settings"
        element={
          <ProtectedRoute>
            <Layout>
              <Settings />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRouter;
