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
      className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full"
    >
      {/* LEFT PANEL: Core Metrics & Risk */}
      <div className="lg:col-span-3 space-y-8 flex flex-col">
        {/* Live Glucose Hero */}
        <div className="bg-white/95 border border-slate-200 p-8 flex flex-col items-center justify-center relative overflow-hidden h-72 rounded-[2.5rem] shadow-xl">
           <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />
           
           <p className="text-slate-600 font-black tracking-widest uppercase text-xs mb-4">Metabolic Homeostasis</p>
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
           <p className="text-slate-500 font-black mt-1 tracking-wider uppercase text-[10px]">mmol/L</p>
           
           <div className="mt-8 px-6 py-2 rounded-full bg-indigo-50 border border-indigo-100 flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
             <span className="text-[10px] font-black text-indigo-700 uppercase tracking-[0.2em]">Optimal Range</span>
           </div>
        </div>

        {/* Circular Risk Progress (Risk Score) */}
        <div className="bg-white/95 border border-slate-200 p-8 flex flex-col items-center gap-6 rounded-[2.5rem] shadow-xl">
           <div className="relative w-32 h-32 flex items-center justify-center">
             <svg className="w-full h-full transform -rotate-90">
               <circle cx="64" cy="64" r="58" stroke="rgba(0,0,0,0.05)" strokeWidth="10" fill="none" />
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
                   <stop offset="0%" stopColor="#4f46e5" />
                   <stop offset="100%" stopColor="#db2777" />
                 </linearGradient>
               </defs>
             </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-black text-slate-900">22</span>
              <span className="text-xs font-black text-slate-500 uppercase tracking-tighter">Score</span>
            </div>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-black text-slate-900">Low Risk</h3>
            <p className="text-xs text-slate-600 font-extrabold tracking-wide uppercase">Metabolic Probability</p>
          </div>
        </div>

        {/* Vital Indicators */}
        <div className="bg-white/95 border border-slate-200 p-8 flex-1 rounded-[2.5rem] shadow-xl">
           <h3 className="text-[10px] uppercase tracking-[0.3em] text-slate-400 font-black mb-8">Bio-Telemetry</h3>
           <div className="space-y-8">
             <div className="flex items-center gap-5 group cursor-help">
               <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-100 transition-all">
                 <Droplet className="w-5 h-5 text-indigo-600" />
               </div>
               <div>
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Insulin on Board</p>
                 <p className="text-xl font-black text-slate-900">1.2 U</p>
               </div>
             </div>
             <div className="flex items-center gap-5 group cursor-help">
               <div className="p-3 rounded-2xl bg-pink-50 border border-pink-100 transition-all">
                 <Clock className="w-5 h-5 text-pink-600" />
               </div>
               <div>
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Time in Range</p>
                 <p className="text-xl font-black text-slate-900">94%</p>
               </div>
             </div>
             <div className="flex items-center gap-5 group cursor-help">
               <div className="p-3 rounded-2xl bg-slate-100 border border-slate-200 transition-all">
                 <Heart className="w-5 h-5 text-slate-700" />
               </div>
               <div>
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">State</p>
                 <p className="text-xl font-black text-slate-900 uppercase tracking-tight">{params.activityLevel}</p>
               </div>
             </div>
           </div>
        </div>
      </div>

      {/* CENTER PANEL: Main Visualizations */}
      <div className="lg:col-span-6 space-y-8 flex flex-col">
        {/* Status Header */}
        <div className={`bg-white/95 border-l-8 ${riskAnalysis.risk === 'High' ? 'border-l-red-600' : 'border-l-indigo-600'} p-5 flex items-center justify-between border border-slate-200 rounded-[1.5rem] shadow-lg`}>
           <div className="flex items-center gap-4">
             <div className={`w-10 h-10 rounded-full flex items-center justify-center ${riskAnalysis.risk === 'High' ? 'bg-red-50 text-red-600' : 'bg-indigo-50 text-indigo-600'}`}>
               <ShieldCheck className="w-5 h-5" />
             </div>
             <div>
               <h4 className="text-sm font-black text-slate-900 uppercase">
                 {riskAnalysis.risk === 'High' ? 'ALERT: METABOLIC DESYNC' : 'SYSTEM: OPTIMIZED'}
               </h4>
               <p className="text-xs text-slate-600 font-extrabold uppercase tracking-tight">Stable metabolic homeostasis confirmed.</p>
             </div>
           </div>
           <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
             <Info className="w-4 h-4 text-slate-400" />
           </button>
        </div>

        {/* Glucose Trajectory Line Chart */}
        <div className="bg-white/95 border border-slate-200 p-8 flex-1 min-h-[450px] flex flex-col relative overflow-hidden rounded-[2.5rem] shadow-xl">
           <div className="flex items-center justify-between mb-10 relative z-10">
             <div>
               <h2 className="text-xl font-black text-indigo-900 tracking-tight flex items-center gap-3">
                 <Zap className="w-5 h-5 text-indigo-600" /> Daily Variation
               </h2>
               <p className="text-xs text-slate-500 font-black tracking-widest uppercase mt-1">24-Hour Predictive Delta</p>
             </div>
             <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest">
               <span className="flex items-center gap-2 text-slate-400"><div className="w-2.5 h-1 bg-slate-200 rounded-full" /> Baseline</span>
               <span className="flex items-center gap-2 text-indigo-600"><div className="w-2.5 h-1 bg-indigo-600 rounded-full" /> Forecast</span>
             </div>
           </div>
           
           <div className="flex-1 w-full relative -ml-4 z-10">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={curve} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorGlucoseGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#db2777" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#db2777" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                  <XAxis 
                    dataKey="time" 
                    tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 800 }} 
                    stroke="transparent" 
                    dy={15}
                  />
                  <YAxis 
                    domain={['dataMin - 10', 'dataMax + 20']} 
                    tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 800 }} 
                    stroke="transparent" 
                    dx={-10}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(2, 6, 23, 0.95)', 
                      borderRadius: '20px', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      backdropFilter: 'blur(20px)',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
                    }}
                    itemStyle={{ color: '#ec4899', fontSize: '12px', fontWeight: 800 }}
                    labelStyle={{ color: '#64748b', fontSize: '10px', fontWeight: 700, marginBottom: '4px' }}
                  />
                  
                  <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="5 5" strokeOpacity={0.3} />
                  <ReferenceLine y={180} stroke="#ef4444" strokeDasharray="5 5" strokeOpacity={0.3} />

                  <Area 
                    type="monotone" 
                    dataKey="glucose" 
                    stroke="#db2777" 
                    strokeWidth={4}
                    fill="url(#colorGlucoseGlow)" 
                    activeDot={{ r: 8, fill: '#020617', stroke: '#db2777', strokeWidth: 3 }}
                    animationDuration={2500}
                    className="drop-shadow-glow-pink"
                  />
                </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Lower Grid: Bar Chart & Simulator */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {/* Glucose Trends Bar Chart */}
           <div className="bg-white/95 border border-slate-200 p-8 flex flex-col rounded-[2.5rem] shadow-xl">
              <h3 className="text-sm font-black text-slate-900 mb-8 flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-indigo-600" /> Glucose History
              </h3>
              <div className="flex-1 w-full min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hourlyTrends}>
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4f46e5" />
                        <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.2} />
                      </linearGradient>
                    </defs>
                    <Tooltip 
                      cursor={{fill: 'rgba(0,0,0,0.03)'}}
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)' }}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {hourlyTrends.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill="url(#barGradient)" />
                      ))}
                    </Bar>
                    <XAxis dataKey="hour" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
           </div>

           {/* Simulator */}
           <div className="bg-indigo-50 border border-indigo-100 p-8 rounded-[2.5rem] shadow-sm">
              <h3 className="text-sm font-black text-indigo-900 mb-2 flex items-center gap-3">
                <Edit2 className="w-5 h-5 text-indigo-600" /> Scenario Lab
              </h3>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-10">Real-time Metabolic Shift</p>
              
              <div className="space-y-8">
                 <div className="space-y-4">
                   <div className="flex justify-between items-end">
                     <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Carbohydrates</label>
                     <span className="text-xl font-black text-slate-900">{params.carbs}g</span>
                   </div>
                   <input 
                    type="range" min="0" max="100" step="5" 
                    value={params.carbs} 
                    onChange={e => setParams(p => ({...p, carbs: Number(e.target.value)}))} 
                    className="w-full h-1.5 bg-indigo-200 rounded-full appearance-none cursor-pointer accent-indigo-600" 
                  />
                 </div>
                 <div className="space-y-4">
                   <div className="flex justify-between items-end">
                     <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Insulin Dose</label>
                     <span className="text-xl font-black text-slate-900">{params.insulinDose}U</span>
                   </div>
                   <input 
                    type="range" min="0" max="10" step="0.5" 
                    value={params.insulinDose} 
                    onChange={e => setParams(p => ({...p, insulinDose: Number(e.target.value)}))} 
                    className="w-full h-1.5 bg-indigo-200 rounded-full appearance-none cursor-pointer accent-indigo-600" 
                  />
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* RIGHT PANEL: Insights & Controls */}
      <div className="lg:col-span-3 space-y-8 flex flex-col">
        {/* Escalation Tiers */}
        <div className="bg-white/95 border border-slate-200 p-8 rounded-[2.5rem] shadow-xl overflow-hidden relative">
           <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 rounded-full blur-3xl" />
           <h3 className="text-[10px] uppercase tracking-[0.3em] text-slate-400 font-black mb-8">Escalation Protocol</h3>
           <div className="space-y-6 relative before:absolute before:inset-y-2 before:left-4 before:w-[1px] before:bg-slate-200">
             {['Monitoring', 'Health Alert', 'Caregiver Node', 'Emergency'].map((tier, i) => (
               <div key={i} className={`flex items-center gap-6 relative z-10 transition-opacity duration-500 ${i === 0 ? 'opacity-100' : 'opacity-30'}`}>
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border transition-all ${i === 0 ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-transparent text-slate-400 border-slate-200'}`}>
                   0{i}
                 </div>
                 <div className="flex flex-col">
                   <span className={`text-xs font-black uppercase tracking-tight ${i === 0 ? 'text-slate-900' : 'text-slate-400'}`}>{tier}</span>
                   {i === 0 && <span className="text-[10px] text-indigo-600 font-bold">Active Stream</span>}
                 </div>
               </div>
             ))}
           </div>
           
           <button className="mt-10 w-full py-4 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-all flex justify-between items-center px-6 font-black text-[10px] uppercase tracking-[0.2em] text-slate-700 group">
             Modify Protocols <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
           </button>
        </div>

        {/* Global Event Log */}
        <div className="bg-white/95 border border-slate-200 p-8 flex-1 rounded-[2.5rem] shadow-xl">
           <h3 className="text-[10px] uppercase tracking-[0.3em] text-slate-400 font-black mb-8">Metabolic Ledger</h3>
           <div className="space-y-8">
             {[
               { time: '10:42 AM', event: 'CGM Sync Completed', icon: Cpu, color: 'text-indigo-600' },
               { time: '09:15 AM', event: 'Causal Analysis', icon: Heart, color: 'text-pink-600' },
               { time: '08:30 AM', event: 'Nutrient Intake', icon: Utensils, color: 'text-indigo-600' }
             ].map((log, i) => {
               const Icon = (log.icon as any) || Activity;
               return (
               <div key={i} className="flex gap-4 group">
                 <div className={`w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:scale-110 transition-transform`}>
                   <Icon className={`w-4 h-4 ${log.color}`} />
                 </div>
                 <div className="flex flex-col justify-center leading-tight">
                   <p className="text-xs font-black text-slate-900 tracking-tight">{log.event}</p>
                   <p className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-tighter">{log.time}</p>
                 </div>
               </div>
               );
             })}
           </div>
        </div>

        {/* Metabolic Passport */}
        <div className="bg-indigo-600 border border-indigo-700 p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
          <div className="absolute -right-6 -bottom-6 opacity-10 group-hover:scale-110 transition-transform duration-700 text-white group-hover:opacity-20">
             <QrCode className="w-40 h-40" />
          </div>
          <h3 className="text-[10px] uppercase tracking-[0.3em] text-indigo-200 font-black mb-2 relative z-10">Bio-ID Passport</h3>
          <p className="text-xs text-indigo-50 font-extrabold mb-6 leading-relaxed relative z-10">Securely share clinical parameters with authorized endpoints.</p>
          <button className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-[10px] font-black uppercase tracking-widest text-white border border-white/20 relative z-10 shadow-lg">
            Verify Identity
          </button>
        </div>
      </div>

      {/* Add missing icon import fix for internal use */}
      <style>{`
        .drop-shadow-glow-purple { filter: drop-shadow(0 0 8px rgba(109, 40, 217, 0.4)); }
        .drop-shadow-glow-pink { filter: drop-shadow(0 0 12px rgba(219, 39, 119, 0.6)); }
        .shadow-glow-purple { box-shadow: 0 0 15px rgba(109, 40, 217, 0.3); }
        .shadow-glow-pink { box-shadow: 0 0 20px rgba(219, 39, 119, 0.4); }
      `}</style>
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
