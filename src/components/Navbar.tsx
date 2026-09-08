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
        <div className="bg-white/95 px-6 py-3 flex items-center justify-between shadow-xl border border-slate-200 rounded-3xl">
          {/* Logo */}
          <button 
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-3 group cursor-pointer"
          >
            <div className="bg-indigo-50 p-2 rounded-xl border border-indigo-100 transition-all group-hover:scale-110">
              <Activity className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="flex flex-col items-start leading-none">
              <span className="font-extrabold text-2xl tracking-tighter text-slate-900">
                Dia<span className="text-indigo-600">Ease</span>
              </span>
              <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest mt-1">Biotech Systems</span>
            </div>
          </button>

          {/* Nav Links / Status Badge */}
          <div className="hidden lg:flex items-center gap-4">
             <div className="flex bg-slate-50 border border-slate-200 rounded-full px-4 py-1.5 items-center gap-2 mr-4 shadow-sm">
               <ShieldCheck className="w-4 h-4 text-indigo-600" />
               <span className="text-[10px] font-black uppercase tracking-wider text-slate-700">Clinical Data Protocol Active</span>
             </div>

             <div className="flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/5">
              {navItems.map((item) => (
                <button 
                  key={item.id}
                  onClick={() => onNavigate(item.id as any)}
                  className={cn(
                    "flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-black transition-all relative group",
                    (currentPage === item.id || (item.id === 'input' && currentPage === 'loading')) 
                      ? "text-white bg-indigo-600 shadow-md" 
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  )}
                >
                  {item.icon}
                  {item.label}
                  {(currentPage === item.id || (item.id === 'input' && currentPage === 'loading')) && (
                    <div className="absolute inset-0 bg-indigo-600 rounded-xl -z-10 shadow-md" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-4">
             <button 
              onClick={() => onNavigate('login')}
              className="flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 transition-all border border-slate-200 group shadow-md"
            >
               <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform shadow-sm">
                 <User className="w-4 h-4 text-white" />
               </div>
               <div className="flex flex-col items-start leading-none hidden sm:flex">
                 <span className="text-sm font-black text-slate-900">Researcher J. Doe</span>
                 <span className="text-[10px] text-indigo-600 font-extrabold mt-0.5 tracking-tight uppercase">Session Active</span>
               </div>
             </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
