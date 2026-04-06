import { useState } from 'react';
import InputPage from './pages/InputPage';
import LandingPage from './pages/LandingPage';
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
    <div className="min-h-screen text-slate-900 font-sans selection:bg-purple-100">
      <Navbar currentPage={currentPage} onNavigate={setCurrentPage} />
      
      {/* Dynamic padding based on page */}
      <main className={`mx-auto ${currentPage === 'dashboard' ? 'pt-24 px-4 pb-4 max-w-[1600px]' : 'pt-32 px-6 pb-24 max-w-7xl'}`}>
        <AnimatePresence mode="wait">
          {currentPage === 'login' && <motion.div key="login" initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -20}} transition={{ duration: 0.5 }}><LandingPage onLogin={handleLogin} /></motion.div>}
          {currentPage === 'dashboard' && <motion.div key="dashboard" initial={{opacity: 0, scale: 0.98}} animate={{opacity: 1, scale: 1}} exit={{opacity: 0, scale: 0.98}} transition={{ duration: 0.5 }}><DashboardPage initialParams={simParams} onSimulateLocal={(p: SimulationParams) => setSimParams(p)} /></motion.div>}
          {currentPage === 'input' && <motion.div key="input" initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -20}} transition={{ duration: 0.5 }}><InputPage onSimulate={handleRunPrediction} /></motion.div>}
          {currentPage === 'alerts' && <motion.div key="alerts" initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -20}} transition={{ duration: 0.5 }}><AlertsPage /></motion.div>}
          
          {currentPage === 'loading' && (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center min-h-[60vh] space-y-8"
            >
              <div className="relative">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-24 h-24 border-4 border-purple-100 rounded-full"
                >
                  <div className="absolute top-0 left-0 w-24 h-24 border-t-4 border-purple-600 rounded-full"></div>
                </motion.div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-purple-600/10 w-12 h-12 rounded-full blur-xl" />
              </div>
              <div className="text-center space-y-2">
                <motion.h2 
                  animate={{ opacity: [0.5, 1, 0.5] }} 
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="text-3xl font-black tracking-tighter text-slate-900"
                >
                  Analyzing Metabolic Data...
                </motion.h2>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Processing bio-causal risk pathways</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      
      {/* AI Chatbot */}
      {currentPage !== 'login' && <AIChatbot />}
    </div>
  );
}

