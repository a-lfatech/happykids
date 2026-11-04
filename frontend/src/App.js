import { useEffect, useRef } from "react";
import "@/App.css";
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { API, AppStateProvider, useAppState } from "./context/AppState";
import { AudioHelp } from "./components/AudioHelp";
import LandingPage from "./pages/LandingPage";
import LearningDashboard from "./pages/LearningDashboard";
import WorldPage from "./pages/WorldPage";
import PlayRouter from "./pages/PlayRouter";
import AchievementScreen from "./pages/AchievementScreen";
import ParentDashboard from "./pages/ParentDashboard";
import ProgressPage from "./pages/ProgressPage";
import CertificatePage from "./pages/CertificatePage";
import AboutPage from "./pages/AboutPage";
import LegalPage from "./pages/LegalPage";

// REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
function AuthCallback() {
  const { hash } = useLocation();
  const navigate = useNavigate();
  const { setUser } = useAppState();
  const done = useRef(false);
  useEffect(() => {
    if (done.current) return;
    done.current = true;
    const sid = new URLSearchParams(hash.slice(1)).get("session_id");
    fetch(`${API}/auth/session`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ session_id: sid }) })
      .then((r) => (r.ok ? r.json() : null))
      .then((u) => { setUser(u); navigate("/parents", { replace: true }); })
      .catch(() => navigate("/parents", { replace: true }));
  }, [hash, navigate, setUser]);
  return null;
}

function AnimatedRoutes() {
  const location = useLocation();
  useEffect(() => { if (!location.hash) window.scrollTo(0, 0); }, [location.pathname, location.hash]);
  if (location.hash?.includes("session_id=")) return <AuthCallback />;
  return (
    <AnimatePresence mode="wait">
      <motion.div key={location.pathname} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.25 }}>
        <Routes location={location}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/learn" element={<LearningDashboard />} />
          <Route path="/world/:worldId" element={<WorldPage />} />
          <Route path="/play/:activityId" element={<PlayRouter />} />
          <Route path="/done/:gameId" element={<AchievementScreen />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/certificate/:badgeId" element={<CertificatePage />} />
          <Route path="/parents" element={<ParentDashboard />} />
          <Route path="/grown-ups" element={<Navigate to="/parents" replace />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/privacy" element={<LegalPage kind="privacy" />} />
          <Route path="/terms" element={<LegalPage kind="terms" />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

const Motion = ({ children }) => {
  const { state } = useAppState();
  return <MotionConfig reducedMotion={state.settings.reducedMotion ? "always" : "user"}>{children}</MotionConfig>;
};

export default function App() {
  return (
    <AppStateProvider>
      <Motion>
        <BrowserRouter>
          <AnimatedRoutes />
          <AudioHelp />
        </BrowserRouter>
      </Motion>
    </AppStateProvider>
  );
}
