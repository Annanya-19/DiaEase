import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  Zap, 
  Mail, 
  Lock, 
  ArrowRight,
  Globe,
  ShieldCheck,
  Cpu,
  BrainCircuit,
  Utensils
} from 'lucide-react';

interface LandingPageProps {
  onLogin: () => void;
}

export default function LandingPage({ onLogin }: LandingPageProps) {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = () => {
    setIsLoading(true);
    // Mimic OAuth transition for now
    setTimeout(() => {
      onLogin();
    }, 1500);
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => onLogin(), 1000);
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* High-End Dark Background Blur Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[120px] z-0" />
      
      {/* Floating Animated Orbs for depth */}
      <div className="absolute top-[-5%] left-[-5%] w-[35%] h-[35%] bg-purple-600/10 blur-[100px] rounded-full animate-pulse z-0" />
      <div className="absolute bottom-[-5%] right-[-5%] w-[35%] h-[40%] bg-pink-500/10 blur-[100px] rounded-full animate-pulse [animation-delay:3s] z-0" />

      {/* Main Content - PROPER ALIGNMENT GRID */}
      <section className="relative min-h-screen flex items-center pt-24 pb-32 px-6 z-10">
        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          
          {/* Hero Side - Properly Aligned Left */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-12 text-left"
          >
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md shadow-xl">
              <div className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
              <span className="text-[10px] font-black text-purple-300 uppercase tracking-[0.3em] drop-shadow-sm">Metabolic AI Active</span>
            </div>

            <div className="space-y-6">
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white leading-[0.9]">
                Metabolic <br />
                <span className="text-gradient-purple">Intelligence</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-400 font-medium max-w-lg leading-relaxed">
                Utilizing high-fidelity causal modeling to predict and optimize metabolic trajectories. 
                Secure your biothread with DiaEase.
              </p>
            </div>

            <div className="flex flex-wrap gap-10">
              <div className="flex flex-col gap-2">
                <span className="text-4xl font-black text-white tracking-tighter">99.8%</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Predictive Precision</span>
              </div>
              <div className="w-[1px] h-12 bg-white/10" />
              <div className="flex flex-col gap-2">
                <span className="text-4xl font-black text-white tracking-tighter">12ms</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Latency Response</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 max-w-md">
               {[
                 { icon: ShieldCheck, text: 'Quantum Security' },
                 { icon: Zap, text: 'Real-time Delta' },
               ].map((item, i) => (
                 <div key={i} className="flex items-center gap-4 p-5 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-default">
                   <item.icon className="w-6 h-6 text-purple-400" />
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.text}</span>
                 </div>
               ))}
            </div>
          </motion.div>

          {/* Auth Side - Properly Aligned Right */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full max-w-md mx-auto"
          >
            <div className="glass-panel p-10 md:p-14 border-white/10 shadow-2xl relative overflow-hidden backdrop-blur-3xl bg-black/20">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="relative z-10 space-y-10">
                <div className="space-y-4">
                  <h2 className="text-4xl font-black text-white tracking-tighter">
                    {authMode === 'login' ? 'Login' : 'Secure Sign-Up'}
                  </h2>
                  <p className="text-xs text-slate-300 font-extrabold uppercase tracking-widest">
                    {authMode === 'login' ? 'Authentication Required' : 'Initialize New Account'}
                  </p>
                </div>

                {/* Login/Signup Toggle */}
                <div className="flex p-1.5 bg-slate-950/80 rounded-2xl border border-white/5">
                  <button 
                    onClick={() => setAuthMode('login')}
                    className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${authMode === 'login' ? 'bg-white/10 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    Sign In
                  </button>
                  <button 
                    onClick={() => setAuthMode('signup')}
                    className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${authMode === 'signup' ? 'bg-white/10 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    Register
                  </button>
                </div>

                <form className="space-y-6" onSubmit={handleAuthSubmit}>
                  <div className="space-y-4">
                     <div className="relative group">
                       <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-purple-400 transition-colors" />
                       <input 
                         type="email" 
                         placeholder="Biometric ID / Email" 
                         className="w-full bg-slate-950/40 border border-white/5 rounded-2xl py-4 pl-14 pr-4 text-sm text-white placeholder:text-slate-700 outline-none focus:border-purple-500/50 transition-all font-medium"
                         required
                       />
                     </div>
                     <div className="relative group">
                       <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-purple-400 transition-colors" />
                       <input 
                         type="password" 
                         placeholder="Access Cipher" 
                         className="w-full bg-slate-950/40 border border-white/5 rounded-2xl py-4 pl-14 pr-4 text-sm text-white placeholder:text-slate-700 outline-none focus:border-purple-500/50 transition-all font-medium"
                         required
                       />
                     </div>
                  </div>

                  <button 
                    disabled={isLoading}
                    className="w-full py-5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black uppercase tracking-[0.2em] text-[10px] shadow-lg shadow-purple-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3 group"
                  >
                    {isLoading ? 'Verifying...' : (authMode === 'login' ? 'Establish Connection' : 'Initialize Account')}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                  <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest text-slate-600 px-4">
                    or continue with
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <button 
                    onClick={handleGoogleLogin}
                    className="flex items-center justify-center gap-3 py-4 rounded-2xl bg-white/20 border border-white/30 hover:bg-white/30 transition-all group shadow-2xl backdrop-blur-md"
                  >
                    <Globe className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-black uppercase tracking-widest text-white">Sign in with Google</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-40 px-6 relative z-10 border-t border-white/5 bg-slate-950/20">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { icon: Cpu, title: 'Neural Compute', desc: 'Real-time metabolic delta analysis powered by custom neural biomarkers.' },
              { icon: BrainCircuit, title: 'Causal Modeling', desc: 'Go beyond correlations to understand the underlying bio-causal pathways.' },
              { icon: Utensils, title: 'Nutrient Graph', desc: 'Track nutrient interaction graphs for optimal metabolic precision.' }
            ].map((f, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:border-purple-500/20 transition-all group"
              >
                <div className="w-14 h-14 rounded-2xl bg-purple-600/10 flex items-center justify-center mb-8 border border-white/5 group-hover:scale-110 transition-transform">
                  <f.icon className="w-7 h-7 text-purple-400" />
                </div>
                <h3 className="text-2xl font-black text-white tracking-tight mb-4">{f.title}</h3>
                <p className="text-sm text-slate-300 font-extrabold leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-24 px-6 border-t border-white/5 relative z-10 bg-slate-950/40 backdrop-blur-xl text-center md:text-left">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-600/20 flex items-center justify-center border border-white/10">
              <Activity className="w-6 h-6 text-purple-400" />
            </div>
            <span className="font-black text-3xl tracking-tighter text-white">Dia<span className="text-pink-500">Ease</span></span>
          </div>
          <div className="flex flex-wrap justify-center gap-10 text-xs font-black uppercase tracking-[0.2em] text-slate-300">
            <a href="#" className="hover:text-white transition-colors">Security Protocol</a>
            <a href="#" className="hover:text-white transition-colors">Privacy Model</a>
            <a href="#" className="hover:text-white transition-colors">System Disclosure</a>
          </div>
          <div className="text-[10px] font-black uppercase text-slate-200 px-6 py-3 rounded-full border border-white/20 bg-white/10 shadow-lg backdrop-blur-md">
            End-to-End Encrypted Biomarkers
          </div>
        </div>
      </footer>
    </div>
  );
}
