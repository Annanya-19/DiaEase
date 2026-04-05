import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Activity } from 'lucide-react';

export default function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      onLogin();
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center relative">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-panel p-8 md:p-12 relative z-10"
      >
        <div className="text-center mb-10">
          <div className="inline-flex bg-theme-gold/10 p-3 rounded-2xl mb-4 border border-theme-gold/20 shadow-[0_0_15px_rgba(212,175,55,0.2)]">
            <Activity className="w-8 h-8 text-theme-gold" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Welcome Back</h1>
          <p className="text-gray-400 font-light">Access your DiaEase dashboard.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-gray-500" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-[#0a0f1a] border border-white/10 focus:border-theme-neon/50 focus:bg-[#0d1627] rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-gray-600 outline-none transition-all shadow-inner"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-500" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#0a0f1a] border border-white/10 focus:border-theme-neon/50 focus:bg-[#0d1627] rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-gray-600 outline-none transition-all shadow-inner"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded border-white/20 bg-white/5 text-theme-neon focus:ring-theme-neon/50" />
              <span className="text-gray-400 hover:text-white transition-colors">Remember me</span>
            </label>
            <a href="#" className="font-medium text-theme-neon hover:text-theme-gold transition-colors">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-theme-gold to-yellow-600 text-theme-navy py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all hover:scale-[1.02] group mt-8"
          >
            Authenticate 
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-500">
          Secure end-to-end encrypted connection.
        </div>
      </motion.div>
    </div>
  );
}
