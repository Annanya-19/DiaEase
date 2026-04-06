import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  TrendingUp, 
  Zap, 
  Mail, 
  Lock, 
  ArrowRight,
  Chrome,
  UserPlus
} from 'lucide-react';

interface LandingPageProps {
  onLogin: () => void;
}

export default function LandingPage({ onLogin }: LandingPageProps) {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  const features = [
    {
      title: "Analyze Glucose",
      desc: "Deep metabolic analysis using AI-driven causal pathways.",
      icon: <Activity className="w-6 h-6 text-purple-600" />,
      color: "from-purple-100 to-purple-50"
    },
    {
      title: "Predict Risk",
      desc: "Stay ahead of hypo/hyperglycemic events with predictive modeling.",
      icon: <Zap className="w-6 h-6 text-pink-600" />,
      color: "from-pink-100 to-pink-50"
    },
    {
      title: "Track Trends",
      desc: "Visualize long-term health variations with premium analytics.",
      icon: <TrendingUp className="w-6 h-6 text-rose-600" />,
      color: "from-rose-100 to-rose-50"
    }
  ];

  return (
    <div className="relative min-h-screen overflow-hidden text-slate-900">
      {/* Background Blur Overlay for depth */}
      <div className="bg-blur-overlay opacity-30" />
      
      {/* --- Hero Section --- */}
      <section className="relative pt-20 pb-32 px-6">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/40 border border-white/60 mb-8 backdrop-blur-md shadow-sm"
          >
            <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
            <span className="text-xs font-semibold tracking-wider uppercase text-purple-800/70">Next-Gen Metabolism AI</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.1 }}
            className="text-6xl md:text-8xl font-black tracking-tighter mb-6"
          >
            <span className="text-slate-900">Dia</span>
            <span className="text-gradient-purple">Ease</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-xl md:text-2xl text-slate-600 font-light max-w-2xl mb-12 leading-relaxed"
          >
            Predict and manage glucose intelligently with futuristic metabolomic modeling.
          </motion.p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full mt-8">
            {/* Left Column: Visual */}
            <div className="relative flex justify-center items-center h-[400px]">
              <motion.div
                animate={{ 
                  scale: [1, 1.05, 1],
                  rotate: [0, 5, 0, -5, 0]
                }}
                transition={{ 
                  duration: 12, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="relative w-64 h-64 md:w-80 md:h-80"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute inset-4 glass-card flex items-center justify-center rounded-full border-white/60 relative z-10 shadow-2xl">
                  <Activity className="w-24 h-24 text-purple-600 animate-pulse" />
                </div>
                
                {/* Floating elements */}
                <motion.div 
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute -top-4 -right-4 w-16 h-16 glass-card rounded-2xl flex items-center justify-center border-white/80 shadow-lg"
                >
                  <Zap className="w-8 h-8 text-pink-500" />
                </motion.div>
                <motion.div 
                  animate={{ y: [0, 20, 0] }}
                  transition={{ duration: 5, repeat: Infinity, delay: 1 }}
                  className="absolute -bottom-4 -left-4 w-12 h-12 glass-card rounded-xl flex items-center justify-center border-white/80 shadow-lg"
                >
                  <TrendingUp className="w-6 h-6 text-purple-500" />
                </motion.div>
              </motion.div>
            </div>

            {/* Right Column: Integrated Auth Section */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="w-full max-w-md mx-auto lg:mx-0 glass-panel p-10 relative overflow-hidden shadow-2xl border-white/60"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 via-pink-500 to-rose-500" />
              
              <div className="flex justify-center gap-1 p-1 bg-slate-200/50 rounded-xl mb-8 border border-white/40">
                <button 
                  onClick={() => setAuthMode('login')}
                  className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-all ${authMode === 'login' ? 'bg-white text-purple-700 shadow-md' : 'text-slate-600 hover:text-purple-700'}`}
                >
                  Sign In
                </button>
                <button 
                  onClick={() => setAuthMode('signup')}
                  className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-all ${authMode === 'signup' ? 'bg-white text-purple-700 shadow-md' : 'text-slate-600 hover:text-purple-700'}`}
                >
                  Create Account
                </button>
              </div>

              <AnimatePresence mode="wait">
                <motion.form
                  key={authMode}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="space-y-5"
                  onSubmit={(e) => { e.preventDefault(); onLogin(); }}
                >
                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-2 tracking-wider font-mono">Registry ID (Email)</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-purple-600 transition-colors" />
                      <input 
                        type="email" 
                        placeholder="researcher@biotech.ai"
                        className="w-full bg-white/60 border border-slate-200 rounded-xl py-4 pl-12 pr-4 text-slate-900 focus:outline-none focus:border-purple-500 focus:bg-white transition-all shadow-sm"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-2 tracking-wider font-mono">Secure Pulse Key</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-purple-600 transition-colors" />
                      <input 
                        type="password" 
                        placeholder="••••••••"
                        className="w-full bg-white/60 border border-slate-200 rounded-xl py-4 pl-12 pr-4 text-slate-900 focus:outline-none focus:border-purple-500 focus:bg-white transition-all shadow-sm"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full group relative overflow-hidden bg-gradient-to-r from-purple-700 to-pink-600 py-4 px-6 rounded-xl hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] mt-4"
                  >
                    <div className="flex items-center justify-center gap-3">
                      <span className="font-bold tracking-tight text-white">
                        {authMode === 'login' ? 'Authenticate Access' : 'Initialize Account'}
                      </span>
                      {authMode === 'login' ? <ArrowRight className="w-5 h-5 text-white" /> : <UserPlus className="w-5 h-5 text-white" />}
                    </div>
                  </button>

                  <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200"></div>
                    </div>
                    <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest">
                      <span className="bg-white/80 px-4 text-slate-400 backdrop-blur-sm rounded-full border border-slate-100">Secure Protocol</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="w-full flex items-center justify-center gap-3 bg-white/60 border border-slate-200 hover:bg-white py-3.5 rounded-xl transition-all shadow-sm hover:shadow-md"
                  >
                    <Chrome className="w-5 h-5 text-pink-600" />
                    <span className="text-sm font-bold text-slate-700">Digital ID with Google</span>
                  </button>
                </motion.form>
              </AnimatePresence>
              
              <p className="mt-8 text-center text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                Secured by <span className="text-purple-600">DiaEase Cryptology</span> • v4.0.1
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- Features Section --- */}
      <section className="py-32 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tight text-slate-900">Metabolic Intelligence</h2>
            <p className="text-slate-600 max-w-xl mx-auto font-medium">High-fidelity predictions powered by bio-causal AI models.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="group glass-card p-10 hover:shadow-2xl transition-all duration-500 border border-white/60 hover:border-purple-200 bg-white/40"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-6 border border-white/40 group-hover:scale-110 transition-transform shadow-sm`}>
                  {f.icon}
                </div>
                <h3 className="text-2xl font-black mb-4 text-slate-800">{f.title}</h3>
                <p className="text-slate-600 leading-relaxed font-medium">{f.desc}</p>
                <div className="mt-8 flex items-center gap-2 text-purple-700 font-bold text-sm opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
                  Protocol Analysis <ArrowRight className="w-4 h-4" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="py-20 px-6 border-t border-slate-200 mt-20 relative bg-white/20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-slate-600">
          <div className="flex items-center gap-3">
            <div className="bg-purple-600 p-2 rounded-lg">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="font-black text-2xl tracking-tighter text-slate-900">DiaEase</span>
          </div>
          <div className="flex gap-8 text-xs font-bold uppercase tracking-widest">
            <a href="#" className="hover:text-purple-600 transition-colors">Privacy Model</a>
            <a href="#" className="hover:text-purple-600 transition-colors">Biotech Security</a>
            <a href="#" className="hover:text-purple-600 transition-colors">AI Disclosure</a>
          </div>
          <div className="text-[10px] text-slate-500 font-black uppercase bg-white/60 px-5 py-2.5 rounded-full border border-slate-200 shadow-sm">
            End-to-End Encrypted Metadata
          </div>
        </div>
      </footer>
    </div>
  );
}

