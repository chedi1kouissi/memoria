import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import LandingPage from './components/LandingPage';
import Sidebar from './components/Sidebar';
import MemoryGraph from './components/MemoryGraph';
import Dashboard from './components/Dashboard';
import Chatbot from './components/Chatbot';
import ContextPanel from './components/ContextPanel';

function AppContent() {
  const [showApp, setShowApp] = useState(false);

  return (
    <AnimatePresence mode="wait">
      {!showApp ? (
        <motion.div
          key="landing"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.2, 0, 0, 1] }}
        >
          <LandingPage onEnter={() => setShowApp(true)} />
        </motion.div>
      ) : (
        <motion.div
          key="app"
          className="h-screen overflow-hidden flex bg-creme"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.2, 0, 0, 1] }}
        >
          <Sidebar />
          <Routes>
            <Route path="/" element={<Navigate to="/graph" replace />} />
            <Route
              path="/graph"
              element={
                <>
                  <MemoryGraph />
                  <ContextPanel />
                </>
              }
            />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/chat" element={<Chatbot />} />
          </Routes>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
