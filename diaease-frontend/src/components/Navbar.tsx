import { Activity, ShieldCheck, User } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

interface NavbarProps {
  currentPage: 'login' | 'dashboard' | 'input' | 'loading' | 'alerts';
  onNavigate: (page: 'login' | 'dashboard' | 'input' | 'alerts') => void;
}

export default function Navbar({ currentPage, onNavigate }: NavbarProps) {
  if (currentPage === 'login') return null; // No navbar on login

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <div className="max-w-[1600px] mx-auto">
        <div className="glass-panel px-6 py-3 flex items-center justify-between shadow-sm">
          {/* Logo */}
          <button 
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2 group cursor-pointer"
          >
            <div className="bg-theme-gold/20 p-2 rounded-xl group-hover:bg-theme-gold/30 transition-colors">
              <Activity className="w-5 h-5 text-theme-gold" />
            </div>
            <span className="font-bold text-lg tracking-tight text-white">
              DiaEase
            </span>
          </button>

          {/* Nav Links / Status Badge */}
          <div className="hidden md:flex items-center gap-8">
             <div className="flex bg-white/5 border border-white/10 rounded-full px-4 py-1.5 items-center gap-2">
               <ShieldCheck className="w-4 h-4 text-theme-neon" />
               <span className="text-xs font-medium text-gray-300">On-device • No raw data shared</span>
             </div>

             <div className="flex gap-6 text-sm font-medium ml-4">
              <button 
                onClick={() => onNavigate('input')}
                className={cn("transition-colors hover:text-white relative", (currentPage === 'input' || currentPage === 'loading') ? "text-white" : "text-gray-400")}
              >
                Input Data
                {(currentPage === 'input' || currentPage === 'loading') && <motion.div layoutId="nav" className="absolute -bottom-1 left-0 right-0 h-[2px] bg-theme-gold rounded-full" />}
              </button>
              <button 
                onClick={() => onNavigate('dashboard')}
                className={cn("transition-colors hover:text-white relative", currentPage === 'dashboard' ? "text-white" : "text-gray-400")}
              >
                Dashboard
                {currentPage === 'dashboard' && <motion.div layoutId="nav" className="absolute -bottom-1 left-0 right-0 h-[2px] bg-theme-gold rounded-full" />}
              </button>
              <button 
                onClick={() => onNavigate('alerts')}
                className={cn("transition-colors hover:text-white relative", currentPage === 'alerts' ? "text-white" : "text-gray-400")}
              >
                Alerts
                {currentPage === 'alerts' && <motion.div layoutId="nav" className="absolute -bottom-1 left-0 right-0 h-[2px] bg-theme-gold rounded-full" />}
              </button>
            </div>
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-4">
             <button 
              onClick={() => onNavigate('login')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors border border-transparent hover:border-white/10"
            >
               <div className="w-7 h-7 rounded-full bg-gradient-to-r from-theme-gold to-yellow-600 flex items-center justify-center">
                 <User className="w-4 h-4 text-theme-navy" />
               </div>
               <span className="text-sm font-medium text-gray-200 hidden sm:block">Jane. D</span>
             </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
