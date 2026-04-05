import { useState } from 'react';
import InputPage from './pages/InputPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AlertsPage from './pages/AlertsPage';
import Navbar from './components/Navbar';
import AIChatbot from './components/AIChatbot';
import { SimulationParams } from './lib/simulator';
import { motion, AnimatePresence } from 'framer-motion';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'login' | 'dashboard' | 'input' | 'loading' | 'alerts'>('login');
  
  // Base default params
  const [simParams, setSimParams] = useState<SimulationParams>({
    currentGlucose: 105,
    insulinDose: 1.2,
    carbs: 0,
    activityLevel: 'Resting'
  });

  const handleLogin = () => {
    setCurrentPage('input');
  };

  const handleRunPrediction = (params: SimulationParams) => {
    setSimParams(params);
    setCurrentPage('loading');
    setTimeout(() => {
      setCurrentPage('dashboard');
    }, 2500);
  };

  return (
    <div className="min-h-screen text-white font-sans">
      <Navbar currentPage={currentPage} onNavigate={setCurrentPage} />
      
      {/* Dynamic padding based on page */}
      <main className={`mx-auto ${currentPage === 'dashboard' ? 'pt-24 px-4 pb-4 max-w-[1600px]' : 'pt-32 px-6 pb-24 max-w-7xl'}`}>
        <AnimatePresence mode="wait">
          {currentPage === 'login' && <motion.div key="login" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}><LoginPage onLogin={handleLogin} /></motion.div>}
          {currentPage === 'dashboard' && <motion.div key="dashboard" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}><DashboardPage initialParams={simParams} onSimulateLocal={(p: SimulationParams) => setSimParams(p)} /></motion.div>}
          {currentPage === 'input' && <motion.div key="input" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}><InputPage onSimulate={handleRunPrediction} /></motion.div>}
          {currentPage === 'alerts' && <motion.div key="alerts" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}><AlertsPage /></motion.div>}
          
          {currentPage === 'loading' && (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center min-h-[60vh] space-y-6"
            >
              <div className="relative">
                <div className="w-24 h-24 border-4 border-theme-gold/20 rounded-full animate-spin">
                  <div className="absolute top-0 left-0 w-24 h-24 border-t-4 border-theme-gold rounded-full"></div>
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-theme-gold/20 w-12 h-12 rounded-full blur-md" />
              </div>
              <motion.h2 
                animate={{ opacity: [0.5, 1, 0.5] }} 
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-2xl font-semibold tracking-tight text-white"
              >
                Analyzing Metabolic Data...
              </motion.h2>
              <p className="text-gray-400 font-light">Processing causal risk pathways</p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      
      {/* AI Chatbot */}
      {currentPage !== 'login' && <AIChatbot />}
    </div>
  );
}
