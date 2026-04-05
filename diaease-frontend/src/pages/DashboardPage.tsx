import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Activity, ShieldCheck, Cpu, ChevronRight, Activity as Heart, Droplet, Clock, Edit2, QrCode, Syringe, Utensils } from 'lucide-react';
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

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full"
    >
      {/* LEFT PANEL */}
      <div className="lg:col-span-3 space-y-6 flex flex-col">
        {/* Live Glucose Hero */}
        <div className="glass-panel p-6 flex flex-col items-center justify-center border-t-4 border-t-theme-neon relative overflow-hidden h-64">
           <div className="absolute top-0 right-0 w-48 h-48 bg-theme-neon/10 rounded-full blur-3xl pointer-events-none" />
           <p className="text-gray-400 font-medium tracking-wide uppercase text-sm mb-4">Live Glucose</p>
           <div className="flex items-start gap-2">
             <span className="text-7xl font-bold text-white tracking-tighter">5.6</span>
             <span className="text-theme-neon mt-2 font-bold text-xl">→</span>
           </div>
           <p className="text-gray-500 font-medium mt-1">mmol/L</p>
           
           <div className="mt-6 px-4 py-1.5 rounded-full bg-theme-neon/10 border border-theme-neon/20 flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-theme-neon animate-pulse" />
             <span className="text-xs font-semibold text-theme-neon uppercase tracking-wider">In Range</span>
           </div>
        </div>

        {/* Circular Risk Analysis */}
        <div className="glass-panel p-6 flex items-center gap-6">
           <div className="relative w-24 h-24 flex items-center justify-center">
             <svg className="w-full h-full transform -rotate-90">
               <circle cx="48" cy="48" r="40" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="none" />
               <circle cx="48" cy="48" r="40" stroke="#00ffa3" strokeWidth="8" fill="none" strokeDasharray="250" strokeDashoffset="195" strokeLinecap="round" />
             </svg>
             <span className="absolute text-xl font-bold text-white">22%</span>
           </div>
           <div>
             <h3 className="text-lg font-semibold text-white">Low Risk</h3>
             <p className="text-sm text-gray-400">Hypoglycemia Probability</p>
           </div>
        </div>

        {/* Metabolic State */}
        <div className="glass-panel p-6 flex-1">
           <h3 className="text-sm uppercase tracking-wider text-gray-500 font-bold mb-6">Metabolic State</h3>
           <div className="space-y-6">
             <div className="flex items-center gap-4">
               <div className="p-3 rounded-xl bg-white/5 border border-white/10"><Droplet className="w-5 h-5 text-theme-gold" /></div>
               <div>
                 <p className="text-sm text-gray-400">Insulin on Board</p>
                 <p className="text-lg font-semibold text-white">1.2 U</p>
               </div>
             </div>
             <div className="flex items-center gap-4">
               <div className="p-3 rounded-xl bg-white/5 border border-white/10"><Clock className="w-5 h-5 text-theme-gold" /></div>
               <div>
                 <p className="text-sm text-gray-400">Last Meal</p>
                 <p className="text-lg font-semibold text-white">45 mins ago</p>
               </div>
             </div>
             <div className="flex items-center gap-4">
               <div className="p-3 rounded-xl bg-white/5 border border-white/10"><Heart className="w-5 h-5 text-theme-gold" /></div>
               <div>
                 <p className="text-sm text-gray-400">Activity Level</p>
                 <p className="text-lg font-semibold text-white">{params.activityLevel}</p>
               </div>
             </div>
           </div>
        </div>
      </div>

      {/* CENTER PANEL */}
      <div className="lg:col-span-6 space-y-6 flex flex-col">
        {/* Banner */}
        <div className={`glass-panel p-4 flex items-center justify-between border-l-4 ${riskAnalysis.risk === 'High' ? 'border-l-red-500' : 'border-l-theme-neon'}`}>
           <div className="flex items-center gap-3">
             <ShieldCheck className={`w-5 h-5 ${riskAnalysis.risk === 'High' ? 'text-red-500' : 'text-theme-neon'}`} />
             <span className="font-semibold text-white">
               {riskAnalysis.risk === 'High' ? 'Warning — Critical trajectory' : 'All clear — glucose completely stable'}
             </span>
           </div>
        </div>

        {/* Graph */}
        <div className="glass-panel p-6 flex-1 min-h-[400px] flex flex-col">
           <div className="flex items-center justify-between mb-6">
             <h2 className="text-lg font-semibold text-white">Glucose Trajectory</h2>
             <div className="flex items-center gap-4 text-xs font-medium">
               <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-white/30" /> Actual</span>
               <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-theme-gold" /> Predicted</span>
             </div>
           </div>
           
           <div className="flex-1 w-full relative -ml-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={curve} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorGlucoseGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d4af37" stopOpacity={0.6}/>
                      <stop offset="95%" stopColor="#d4af37" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="time" tick={{ fill: '#6b7280', fontSize: 12 }} stroke="rgba(255,255,255,0.1)" />
                  <YAxis domain={['dataMin - 10', 'dataMax + 20']} tick={{ fill: '#6b7280', fontSize: 12 }} stroke="rgba(255,255,255,0.1)" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#060B14', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}
                    itemStyle={{ color: '#d4af37' }}
                  />
                  
                  {/* Danger zones */}
                  <ReferenceLine y={70} stroke="#ff4d4d" strokeDasharray="3 3" strokeOpacity={0.5} label={{ position: 'insideTopLeft', value: 'Hypo limit', fill: '#ff4d4d', fontSize: 10 }} />

                  <Area 
                    type="monotone" 
                    dataKey="glucose" 
                    stroke="#d4af37" 
                    strokeWidth={4}
                    fill="url(#colorGlucoseGlow)" 
                    activeDot={{ r: 8, fill: '#0a0f1a', stroke: '#d4af37', strokeWidth: 3 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Causal Pathway & Simulator */}
        <div className="grid grid-cols-2 gap-6">
           <div className="glass-panel p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-4 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-theme-gold" /> Causal Risk Pathway
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white">Insulin Driver</span>
                    <span className="text-sm text-theme-neon font-bold">60%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-1.5"><div className="bg-theme-neon h-1.5 rounded-full w-[60%]" /></div>
                  
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-sm text-white">Meal Deficit</span>
                    <span className="text-sm text-theme-goldLight font-bold">30%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-1.5"><div className="bg-theme-goldLight h-1.5 rounded-full w-[30%]" /></div>
                </div>
              </div>
              <button className="mt-6 w-full py-2.5 rounded-xl border border-theme-gold/30 text-theme-goldLight font-medium text-sm hover:bg-theme-gold/10 transition-colors">
                Explain with AI
              </button>
           </div>

           <div className="glass-panel p-6 border border-theme-gold/20">
              <h3 className="text-sm font-semibold text-theme-goldLight mb-1 flex items-center gap-2">
                <Edit2 className="w-4 h-4" /> Scenario Simulator
              </h3>
              <p className="text-xs text-gray-400 mb-4">Dynamically shift inputs</p>
              
              <div className="space-y-4">
                 <div>
                   <label className="flex justify-between text-xs font-semibold text-white mb-1">
                     Carbs <span className="text-theme-gold">{params.carbs}g</span>
                   </label>
                   <input type="range" min="0" max="100" step="5" value={params.carbs} onChange={e => setParams(p => ({...p, carbs: Number(e.target.value)}))} className="w-full accent-theme-gold" />
                 </div>
                 <div>
                   <label className="flex justify-between text-xs font-semibold text-white mb-1">
                     Insulin <span className="text-theme-gold">{params.insulinDose}U</span>
                   </label>
                   <input type="range" min="0" max="10" step="1" value={params.insulinDose} onChange={e => setParams(p => ({...p, insulinDose: Number(e.target.value)}))} className="w-full accent-theme-gold" />
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="lg:col-span-3 space-y-6 flex flex-col">
        {/* Escalation */}
        <div className="glass-panel p-6">
           <h3 className="text-sm uppercase tracking-wider text-gray-500 font-bold mb-4">Escalation Tiers</h3>
           <div className="space-y-3 relative before:absolute before:inset-y-2 before:left-3.5 before:w-[2px] before:bg-white/10">
             {['Tier 0 (Monitoring)', 'Tier 1 (Alert)', 'Tier 2 (Caregiver)', 'Tier 3 (Emergency)'].map((tier, i) => (
               <div key={i} className={`flex items-center gap-4 relative z-10 ${i === 0 ? 'opacity-100' : 'opacity-40'}`}>
                 <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-theme-neon text-[#0a0f1a]' : 'bg-white/10 text-white border border-white/20'}`}>
                   {i}
                 </div>
                 <span className={`text-sm font-semibold ${i === 0 ? 'text-theme-neon' : 'text-white'}`}>{tier}</span>
               </div>
             ))}
           </div>
           
           <button className="mt-8 w-full py-3 rounded-xl bg-white/5 border border-white/20 hover:bg-white/10 transition-colors flex justify-between items-center px-4 font-medium text-sm text-white">
             Escalate to Tier 1 <ChevronRight className="w-4 h-4" />
           </button>
        </div>

        {/* Alert Log */}
        <div className="glass-panel p-6 flex-1">
           <h3 className="text-sm uppercase tracking-wider text-gray-500 font-bold mb-4">Event Log</h3>
           <div className="space-y-4">
             {[
               { time: '10:42 AM', event: 'CGM Sync Successful', icon: Activity },
               { time: '09:15 AM', event: 'Insulin (1.2U) Logged', icon: Syringe },
               { time: '08:30 AM', event: 'Meal (45g Carbs)', icon: Utensils }
             ].map((log, i) => {
               const Icon = log.icon;
               return (
               <div key={i} className="flex gap-3">
                 <div className="mt-0.5"><Icon className="w-4 h-4 text-theme-gold/70" /></div>
                 <div>
                   <p className="text-sm font-medium text-white">{log.event}</p>
                   <p className="text-xs text-gray-500">{log.time}</p>
                 </div>
               </div>
               );
             })}
           </div>
        </div>

        {/* Passport */}
        <div className="glass-panel p-6 border-transparent bg-gradient-to-br from-theme-navy to-[#0a0f1a] relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500 text-white">
             <QrCode className="w-32 h-32" />
          </div>
          <h3 className="text-sm uppercase tracking-wider text-theme-gold font-bold mb-2 relative z-10">Metabolic Passport</h3>
          <p className="text-xs text-gray-400 mb-4 relative z-10">Scan to share your risk profile parameters securely with a provider.</p>
          <button className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-xs font-semibold text-white relative z-10">
            Regenerate QR
          </button>
        </div>
      </div>
    </motion.div>
  );
}
