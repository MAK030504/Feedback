import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useTheme } from "./hooks/useTheme";
import { LandingPage } from "./pages/LandingPage";
import { SubmitFeedbackPage } from "./pages/SubmitFeedbackPage";
import { TrackTicketPage } from "./pages/TrackTicketPage";
import { SuggestionsPage } from "./pages/SuggestionsPage";
import { AdminLoginPage } from "./pages/AdminLoginPage";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";

const NotFoundPage = () => (
  <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
    <h2 className="text-2xl font-semibold">Page not found</h2>
  </div>
);

function App() {
  const { theme, toggleTheme } = useTheme();

  return (
    <AppShell theme={theme} onToggleTheme={toggleTheme}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/submit" element={<SubmitFeedbackPage />} />
        <Route path="/track" element={<TrackTicketPage />} />
        <Route path="/suggestions" element={<SuggestionsPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        </Route>

        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AppShell>
  );
}

export default App;
