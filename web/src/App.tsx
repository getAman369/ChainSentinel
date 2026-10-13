import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import { ThemeProvider } from "@/hooks/useTheme";

import { ToastProvider } from "@components/feedback/Toast";
import { Layout } from "@components/layout/Layout";

import Home from "@pages/Home";
import History from "@pages/History";
import Results from "@pages/Results";
import Health from "@pages/Health";
import ApiDocs from "@pages/ApiDocs";
import Settings from "@pages/Settings";
import About from "@pages/About";
import NotFound from "@pages/NotFound";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
      >
        <Routes location={location}>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/results" element={<Results />} />
            <Route path="/history" element={<History />} />
            <Route path="/docs" element={<ApiDocs />} />
            <Route path="/status" element={<Health />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <AnimatedRoutes />
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
