import "@/App.css";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AppStateProvider } from "./context/AppState";
import { AudioHelp } from "./components/AudioHelp";
import HomeScreen from "./pages/HomeScreen";
import MissingNumbersGame from "./pages/MissingNumbersGame";
import MoreOrLessGame from "./pages/MoreOrLessGame";
import AchievementScreen from "./pages/AchievementScreen";
import ParentDashboard from "./pages/ParentDashboard";

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div key={location.pathname} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.25 }}>
        <Routes location={location}>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/play/missing-numbers" element={<MissingNumbersGame />} />
          <Route path="/play/more-or-less" element={<MoreOrLessGame />} />
          <Route path="/done/:gameId" element={<AchievementScreen />} />
          <Route path="/grown-ups" element={<ParentDashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <AppStateProvider>
      <BrowserRouter>
        <AnimatedRoutes />
        <AudioHelp />
      </BrowserRouter>
    </AppStateProvider>
  );
}
