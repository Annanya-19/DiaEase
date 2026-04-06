import { Activity, ShieldCheck, User, LayoutDashboard, Bell, FileInput } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

interface NavbarProps {
  currentPage: 'login' | 'dashboard' | 'input' | 'loading' | 'alerts';
  onNavigate: (page: 'login' | 'dashboard' | 'input' | 'alerts') => void;
}

export default function Navbar({ currentPage, onNavigate }: NavbarProps) {
  if (currentPage === 'login') return null; // No navbar on landing/login

  const navItems = [
    { id: 'input', label: 'Input Data', icon: <FileInput className="w-4 h-4" /> },
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'alerts', label: 'Alerts', icon: <Bell className="w-4 h-4" /> }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-6">
      <div className="max-w-[1600px] mx-auto">
        <div className="glass-panel px-6 py-3 flex items-center justify-between border-white/40 backdrop-blur-2xl shadow-xl">
          {/* Logo */}
          <button 
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-3 group cursor-pointer"
          >
            <div className="bg-purple-600/10 p-2 rounded-xl group-hover:bg-purple-600/20 transition-all group-hover:scale-110 border border-purple-200">
              <Activity className="w-5 h-5 text-purple-700" />
            </div>
            <div className="flex flex-col items-start leading-none">
              <span className="font-bold text-xl tracking-tighter text-slate-900">
                Dia<span className="text-pink-600">Ease</span>
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mt-1">Biotech AI</span>
            </div>
          </button>

          {/* Nav Links / Status Badge */}
          <div className="hidden lg:flex items-center gap-4">
             <div className="flex bg-purple-50 border border-purple-100 rounded-full px-4 py-1.5 items-center gap-2 mr-4">
               <ShieldCheck className="w-4 h-4 text-pink-600" />
               <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700">Encrypted Metabolic Vault</span>
             </div>

             <div className="flex items-center gap-1 bg-slate-100/50 p-1 rounded-2xl border border-slate-200">
              {navItems.map((item) => (
                <button 
                  key={item.id}
                  onClick={() => onNavigate(item.id as any)}
                  className={cn(
                    "flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all relative group",
                    (currentPage === item.id || (item.id === 'input' && currentPage === 'loading')) 
                      ? "text-purple-900 bg-white shadow-sm" 
                      : "text-slate-500 hover:text-purple-700 hover:bg-white/50"
                  )}
                >
                  {item.icon}
                  {item.label}
                  {(currentPage === item.id || (item.id === 'input' && currentPage === 'loading')) && (
                    <motion.div 
                      layoutId="nav-active" 
                      className="absolute inset-0 bg-white rounded-xl shadow-sm -z-10" 
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-4">
             <button 
              onClick={() => onNavigate('login')}
              className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/60 hover:bg-white/80 transition-all border border-white group shadow-sm"
            >
               <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center border border-white/20 shadow-md group-hover:scale-110 transition-transform">
                 <User className="w-4 h-4 text-white" />
               </div>
               <div className="flex flex-col items-start leading-none hidden sm:flex">
                 <span className="text-sm font-bold text-slate-900">Researcher J. Doe</span>
                 <span className="text-[10px] text-slate-500 font-bold uppercase mt-0.5 tracking-tight">Active Metadata Session</span>
               </div>
             </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

