import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  ReferenceLine, BarChart, Bar, Cell 
} from 'recharts';
import { 
  Activity, ShieldCheck, Cpu, ChevronRight, Activity as Heart, 
  Droplet, Clock, Edit2, QrCode, Utensils, Zap, TrendingUp, Info
} from 'lucide-react';
import { runSimulation, determineRisk, SimulationParams } from '../lib/simulator';

interface DashboardPageProps {
  initialParams: SimulationParams;
  onSimulateLocal: (params: SimulationParams) => void;
}

export default function DashboardPage({ initialParams, onSimulateLocal }: DashboardPageProps) {
  const [params, setParams] = useState<SimulationParams>(initialParams);
  const [curve, setCurve] = useState(() => runSimulation(params));
  
  // Re-run simulation when params change (What-if scenario)
  useEffect(() => {
    setCurve(runSimulation(params));
    onSimulateLocal(params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const riskAnalysis = useMemo(() => determineRisk(curve), [curve]);

  // Mock data for Bar Chart (Glucose Trends over last 6 hours)
  const hourlyTrends = [
    { hour: '12 AM', value: 5.2 },
    { hour: '1 AM', value: 5.4 },
    { hour: '2 AM', value: 5.8 },
    { hour: '3 AM', value: 6.2 },
    { hour: '4 AM', value: 5.9 },
    { hour: '5 AM', value: 5.7 },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full text-slate-900"
    >
      {/* LEFT PANEL: Core Metrics & Risk */}
      <div className="lg:col-span-3 space-y-8 flex flex-col">
        {/* Live Glucose Hero */}
        <div className="glass-panel p-8 flex flex-col items-center justify-center relative overflow-hidden h-72 border-white shadow-2xl">
           <div className="absolute top-0 right-0 w-48 h-48 bg-purple-100 rounded-full blur-3xl pointer-events-none opacity-50" />
           
           <p className="text-slate-500 font-bold tracking-widest uppercase text-[10px] mb-4">Metabolic Homeostasis</p>
           <div className="flex items-baseline gap-2 relative">
             <span className="text-8xl font-black text-slate-900 tracking-tighter drop-shadow-sm">5.6</span>
             <motion.span 
               animate={{ y: [0, -5, 0] }}
               transition={{ duration: 2, repeat: Infinity }}
               className="text-pink-600 font-bold text-2xl"
             >
               ↑
             </motion.span>
           </div>
           <p className="text-slate-400 font-bold mt-1 tracking-wider">mmol/L</p>
           
           <div className="mt-8 px-6 py-2 rounded-full bg-purple-50 border border-purple-100 flex items-center gap-3 shadow-sm">
             <div className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
             <span className="text-[10px] font-black text-purple-700 uppercase tracking-[0.2em]">Optimal Range</span>
           </div>
        </div>

        {/* Circular Risk Progress (Risk Score) */}
        <div className="glass-panel p-8 flex flex-col items-center gap-6 border-white shadow-xl bg-white/60">
           <div className="relative w-32 h-32 flex items-center justify-center">
             <svg className="w-full h-full transform -rotate-90">
               <circle cx="64" cy="64" r="58" stroke="#f1f5f9" strokeWidth="10" fill="none" />
               <motion.circle 
                 cx="64" cy="64" r="58" 
                 stroke="url(#riskGradient)" 
                 strokeWidth="10" 
                 fill="none" 
                 strokeDasharray="364.4" 
                 initial={{ strokeDashoffset: 364.4 }}
                 animate={{ strokeDashoffset: 364.4 * (1 - 0.22) }}
                 transition={{ duration: 2, ease: "easeOut" }}
                 strokeLinecap="round" 
               />
               <defs>
                 <linearGradient id="riskGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                   <stop offset="0%" stopColor="#7c3aed" />
                   <stop offset="100%" stopColor="#db2777" />
                 </linearGradient>
               </defs>
             </svg>
             <div className="absolute flex flex-col items-center">
               <span className="text-3xl font-black text-slate-900">22</span>
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Score</span>
             </div>
           </div>
           <div className="text-center">
             <h3 className="text-lg font-black text-slate-800">Low Risk</h3>
             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Metabolic Instability Probability</p>
           </div>
        </div>

        {/* Vital Indicators */}
        <div className="glass-panel p-8 flex-1 border-white shadow-xl bg-white/40">
           <h3 className="text-[10px] uppercase tracking-[0.3em] text-slate-400 font-black mb-8">Bio-Telemetry</h3>
           <div className="space-y-8">
             <div className="flex items-center gap-5 group cursor-help">
               <div className="p-3 rounded-2xl bg-purple-50 border border-purple-100 group-hover:bg-purple-100 group-hover:border-purple-200 transition-all shadow-sm">
                 <Droplet className="w-5 h-5 text-purple-600" />
               </div>
               <div>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Insulin on Board</p>
                 <p className="text-xl font-black text-slate-800">1.2 U</p>
               </div>
             </div>
             <div className="flex items-center gap-5 group cursor-help">
               <div className="p-3 rounded-2xl bg-pink-50 border border-pink-100 group-hover:bg-pink-100 group-hover:border-pink-200 transition-all shadow-sm">
                 <Clock className="w-5 h-5 text-pink-600" />
               </div>
               <div>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Time in Range</p>
                 <p className="text-xl font-black text-slate-800">94%</p>
               </div>
             </div>
             <div className="flex items-center gap-5 group cursor-help">
               <div className="p-3 rounded-2xl bg-rose-50 border border-rose-100 group-hover:bg-rose-100 group-hover:border-rose-200 transition-all shadow-sm">
                 <Heart className="w-5 h-5 text-rose-600" />
               </div>
               <div>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">State</p>
                 <p className="text-xl font-black text-slate-800 uppercase tracking-tight">{params.activityLevel}</p>
               </div>
             </div>
           </div>
        </div>
      </div>

      {/* CENTER PANEL: Main Visualizations */}
      <div className="lg:col-span-6 space-y-8 flex flex-col">
        {/* Status Header */}
        <div className={`glass-panel p-5 flex items-center justify-between border-l-8 ${riskAnalysis.risk === 'High' ? 'border-l-pink-500' : 'border-l-purple-500'} shadow-xl bg-white/80`}>
           <div className="flex items-center gap-4">
             <div className={`w-10 h-10 rounded-full flex items-center justify-center ${riskAnalysis.risk === 'High' ? 'bg-pink-50 text-pink-600 border border-pink-100' : 'bg-purple-50 text-purple-600 border border-purple-100'}`}>
               <ShieldCheck className="w-5 h-5" />
             </div>
             <div>
               <h4 className="text-sm font-black text-slate-900">
                 {riskAnalysis.risk === 'High' ? 'CRITICAL METABOLIC DESYNC' : 'SYSTEM OPTIMIZED'}
               </h4>
               <p className="text-xs text-slate-500 font-bold">Trajectory indicates stable metabolic homeostasis across all sensors.</p>
             </div>
           </div>
           <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
             <Info className="w-4 h-4 text-slate-400" />
           </button>
        </div>

        {/* Glucose Trajectory Line Chart */}
        <div className="glass-panel p-8 flex-1 min-h-[450px] flex flex-col relative overflow-hidden border-white shadow-2xl bg-white/40">
           <div className="flex items-center justify-between mb-10 relative z-10">
             <div>
               <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                 <Zap className="w-5 h-5 text-pink-600" /> Daily Variation
               </h2>
               <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mt-1">24-Hour Predictive Delta</p>
             </div>
             <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest">
               <span className="flex items-center gap-2 text-slate-400"><div className="w-2.5 h-1 bg-slate-200 rounded-full" /> Baseline</span>
               <span className="flex items-center gap-2 text-pink-600"><div className="w-2.5 h-1 bg-pink-500 rounded-full shadow-sm" /> Forecast</span>
             </div>
           </div>
           
           <div className="flex-1 w-full relative -ml-4 z-10">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={curve} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorGlucoseGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#db2777" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#db2777" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="time" 
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} 
                    stroke="transparent" 
                    dy={15}
                  />
                  <YAxis 
                    domain={['dataMin - 10', 'dataMax + 20']} 
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} 
                    stroke="transparent" 
                    dx={-10}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      borderRadius: '20px', 
                      border: '1px solid #f1f5f9',
                      backdropFilter: 'blur(20px)',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.05)'
                    }}
                    itemStyle={{ color: '#db2777', fontSize: '12px', fontWeight: 800 }}
                    labelStyle={{ color: '#64748b', fontSize: '10px', fontWeight: 700, marginBottom: '4px' }}
                  />
                  
                  <ReferenceLine y={70} stroke="#f43f5e" strokeDasharray="5 5" strokeOpacity={0.4} />
                  <ReferenceLine y={180} stroke="#f43f5e" strokeDasharray="5 5" strokeOpacity={0.4} />

                  <Area 
                    type="monotone" 
                    dataKey="glucose" 
                    stroke="#db2777" 
                    strokeWidth={4}
                    fill="url(#colorGlucoseGlow)" 
                    activeDot={{ r: 8, fill: '#fff', stroke: '#db2777', strokeWidth: 3 }}
                    animationDuration={2500}
                  />
                </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Lower Grid: Bar Chart & Simulator */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {/* Glucose Trends Bar Chart */}
           <div className="glass-panel p-8 flex flex-col border-white shadow-xl bg-white/60">
              <h3 className="text-sm font-black text-slate-800 mb-8 flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-purple-600" /> Glucose History
              </h3>
              <div className="flex-1 w-full min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hourlyTrends}>
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#7c3aed" />
                        <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.4} />
                      </linearGradient>
                    </defs>
                    <Tooltip 
                      cursor={{fill: 'rgba(0,0,0,0.02)'}}
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {hourlyTrends.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill="url(#barGradient)" />
                      ))}
                    </Bar>
                    <XAxis dataKey="hour" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
           </div>

           {/* Simulator */}
           <div className="glass-panel p-8 border-purple-100 bg-purple-50/50 shadow-xl">
              <h3 className="text-sm font-black text-slate-800 mb-2 flex items-center gap-3">
                <Edit2 className="w-5 h-5 text-pink-600" /> Scenario Lab
              </h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-10">Real-time Metabolic Shift</p>
              
              <div className="space-y-8">
                 <div className="space-y-4">
                   <div className="flex justify-between items-end">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Carbohydrates</label>
                     <span className="text-xl font-black text-purple-900">{params.carbs}g</span>
                   </div>
                   <input 
                    type="range" min="0" max="100" step="5" 
                    value={params.carbs} 
                    onChange={e => setParams(p => ({...p, carbs: Number(e.target.value)}))} 
                    className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-pink-600" 
                  />
                 </div>
                 <div className="space-y-4">
                   <div className="flex justify-between items-end">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Insulin Dose</label>
                     <span className="text-xl font-black text-purple-900">{params.insulinDose}U</span>
                   </div>
                   <input 
                    type="range" min="0" max="10" step="0.5" 
                    value={params.insulinDose} 
                    onChange={e => setParams(p => ({...p, insulinDose: Number(e.target.value)}))} 
                    className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-purple-700" 
                  />
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* RIGHT PANEL: Insights & Controls */}
      <div className="lg:col-span-3 space-y-8 flex flex-col">
        {/* Escalation Tiers */}
        <div className="glass-panel p-8 border-white shadow-xl bg-white/60 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-pink-50 rounded-full blur-3xl opacity-50" />
           <h3 className="text-[10px] uppercase tracking-[0.3em] text-slate-400 font-black mb-8">Escalation Protocol</h3>
           <div className="space-y-6 relative before:absolute before:inset-y-2 before:left-4 before:w-[1px] before:bg-slate-100">
             {['Monitoring', 'Health Alert', 'Caregiver Node', 'Emergency'].map((tier, i) => (
               <div key={i} className={`flex items-center gap-6 relative z-10 transition-opacity duration-500 ${i === 0 ? 'opacity-100' : 'opacity-40'}`}>
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border transition-all ${i === 0 ? 'bg-purple-600 text-white border-purple-600 shadow-md' : 'bg-white text-slate-400 border-slate-100'}`}>
                   0{i}
                 </div>
                 <div className="flex flex-col">
                   <span className={`text-xs font-black uppercase tracking-tight ${i === 0 ? 'text-slate-900' : 'text-slate-400'}`}>{tier}</span>
                   {i === 0 && <span className="text-[10px] text-purple-600 font-bold">Active Stream</span>}
                 </div>
               </div>
             ))}
           </div>
           
           <button className="mt-10 w-full py-4 rounded-xl bg-white border border-slate-100 hover:bg-slate-50 transition-all flex justify-between items-center px-6 font-black text-[10px] uppercase tracking-[0.2em] text-slate-700 group shadow-sm">
             Modify Protocols <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
           </button>
        </div>

        {/* Global Event Log */}
        <div className="glass-panel p-8 flex-1 border-white shadow-xl bg-white/40">
           <h3 className="text-[10px] uppercase tracking-[0.3em] text-slate-400 font-black mb-8">Metabolic Ledger</h3>
           <div className="space-y-8">
             {[
               { time: '10:42 AM', event: 'CGM Nexus Sync', icon: Cpu, color: 'text-purple-600' },
               { time: '09:15 AM', event: 'Metabolism Analysis', icon: BrainCircuit, color: 'text-pink-600' },
               { time: '08:30 AM', event: 'Carb Intake Logged', icon: Utensils, color: 'text-rose-600' }
             ].map((log, i) => {
               const Icon = (log.icon as any) || Activity;
               return (
               <div key={i} className="flex gap-4 group">
                 <div className={`w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-slate-100 transition-transform group-hover:scale-110 shadow-sm`}>
                   <Icon className={`w-4 h-4 ${log.color}`} />
                 </div>
                 <div className="flex flex-col justify-center leading-tight">
                   <p className="text-xs font-black text-slate-900 tracking-tight">{log.event}</p>
                   <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">{log.time}</p>
                 </div>
               </div>
               );
             })}
           </div>
        </div>

        {/* Metabolic Passport */}
        <div className="glass-panel p-8 bg-gradient-to-br from-purple-50 to-white border-white shadow-xl relative overflow-hidden group">
          <div className="absolute -right-6 -bottom-6 opacity-5 group-hover:scale-110 transition-transform duration-700 text-purple-600 group-hover:opacity-10">
             <QrCode className="w-40 h-40" />
          </div>
          <h3 className="text-[10px] uppercase tracking-[0.3em] text-purple-600 font-black mb-2 relative z-10">Bio-ID Passport</h3>
          <p className="text-xs text-slate-500 font-bold mb-6 leading-relaxed relative z-10">Share high-fidelity glucose parameters securely with authorized medical endpoints.</p>
          <button className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 transition-all text-[10px] font-black uppercase tracking-widest text-white shadow-lg relative z-10">
            Verify Identity
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// Minimal BrainCircuit placeholder if not found in Lucide
function BrainCircuit({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M12 5V3a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h2" />
      <path d="M15 19H9a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1Z" />
      <path d="M19 12h2a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H11a1 1 0 0 1-1-1v-2" />
      <path d="M12 11v2" />
      <path d="M12 15h0" />
    </svg>
  );
}

