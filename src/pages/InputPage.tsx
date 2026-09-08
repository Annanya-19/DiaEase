import { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Syringe, Clock, Utensils, PersonStanding, ChevronRight, Zap, Info, ShieldAlert } from 'lucide-react';
import { XAxis, YAxis, ResponsiveContainer, Tooltip, AreaChart, Area } from 'recharts';
import { SimulationParams } from '../lib/simulator';

interface InputPageProps {
  onSimulate?: (params: SimulationParams) => void;
}

export default function InputPage({ onSimulate }: InputPageProps) {
  const [activeField, setActiveField] = useState<string | null>(null);
  
  const [glucose, setGlucose] = useState<string>('120');
  const [insulin, setInsulin] = useState<string>('5');
  const [timeSince, setTimeSince] = useState<string>('30');
  const [carbs, setCarbs] = useState<string>('45');
  const [activity, setActivity] = useState<'Resting'|'Walking'|'Exercise'>('Resting');

  const fields = [
    { id: 'glucose', icon: Activity, label: 'Current Glucose', placeholder: 'e.g. 105', unit: 'mg/dL', type: 'number', val: glucose, setVal: setGlucose, color: 'text-purple-400' },
    { id: 'insulin', icon: Syringe, label: 'Insulin Dose', placeholder: 'e.g. 5', unit: 'Units', type: 'number', val: insulin, setVal: setInsulin, color: 'text-pink-500' },
    { id: 'timeSince', icon: Clock, label: 'Time Since Dose', placeholder: 'e.g. 30', unit: 'mins', type: 'number', val: timeSince, setVal: setTimeSince, color: 'text-red-500' },
    { id: 'meal', icon: Utensils, label: 'Last Meal Amount', placeholder: 'e.g. 45', unit: 'g carbs', type: 'number', val: carbs, setVal: setCarbs, color: 'text-purple-400' },
  ];

  // Simulated prediction data
  const predictionData = [
    { time: 'Now', glucose: 120 },
    { time: '30m', glucose: 110 },
    { time: '60m', glucose: 95 },
    { time: '90m', glucose: 85 },
    { time: '120m', glucose: 82 },
  ];

  const handleSubmit = () => {
    if (onSimulate) {
      onSimulate({
        currentGlucose: Number(glucose) || 120,
        insulinDose: Number(insulin) || 0,
        carbs: Number(carbs) || 0,
        activityLevel: activity
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 pb-20">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4 mb-16"
      >
        <div className="inline-flex items-center justify-center gap-2 px-6 py-1.5 rounded-full border border-white/10 bg-white/5 text-purple-400 text-[10px] font-black uppercase tracking-[0.2em] mx-auto w-max mb-6 backdrop-blur-md shadow-lg">
           Metabolic Session ID: FE-829
        </div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white mb-4 px-4 leading-none drop-shadow-lg">Metabolic Phase <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Input</span></h1>
        <p className="text-slate-200 font-extrabold tracking-widest max-w-xl mx-auto uppercase text-xs leading-relaxed drop-shadow-md">Enter high-fidelity biometric data to initialize causal trajectory modeling.</p>
      </motion.div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Input Form */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.8 }}
          className="lg:col-span-12 xl:col-span-7 glass-panel p-8 md:p-12 space-y-12 border-white/10 bg-black/20 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="grid md:grid-cols-2 gap-8 relative z-10">
            {fields.map((field) => (
              <div 
                key={field.id}
                className={`transition-all duration-500 rounded-[2rem] p-8 border ${
                  activeField === field.id 
                    ? 'bg-white/10 border-purple-500/40 scale-[1.01]' 
                    : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10'
                }`}
              >
                <label className="flex items-center gap-4 text-xs font-black text-slate-200 uppercase tracking-[0.3em] mb-6">
                  <div className={`p-2.5 rounded-xl transition-all duration-500 ${activeField === field.id ? 'bg-purple-600 text-white shadow-glow-purple' : 'bg-white/10 text-slate-300 border border-white/10'}`}>
                    <field.icon className="w-4 h-4" />
                  </div>
                  {field.label}
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type={field.type}
                    value={field.val}
                    onChange={(e) => field.setVal(e.target.value)}
                    placeholder={field.placeholder}
                    onFocus={() => setActiveField(field.id)}
                    onBlur={() => setActiveField(null)}
                    className="w-full bg-transparent border-none outline-none text-4xl font-black placeholder:text-slate-700 text-white transition-all tracking-tighter drop-shadow-sm"
                  />
                  <span className={`text-xs font-black uppercase tracking-widest ${activeField === field.id ? 'text-purple-400' : 'text-slate-400'}`}>{field.unit}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-12 relative z-10 pt-4">
            <div className="space-y-6 text-center md:text-left">
              <label className="flex items-center justify-center md:justify-start gap-3 text-xs font-black text-slate-200 uppercase tracking-[0.3em]">
                <PersonStanding className="w-4 h-4 text-pink-500" /> Biomark Activity Level
              </label>
              <div className="bg-slate-950/50 p-1.5 rounded-2xl flex border border-white/5 relative">
                {['Resting', 'Walking', 'Exercise'].map(type => (
                  <button 
                    key={type} 
                    onClick={() => setActivity(type as any)}
                    className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all relative z-10 ${activity === type ? 'text-white font-black' : 'text-slate-300 hover:text-white hover:bg-white/5'}`}
                  >
                    {activity === type && (
                      <motion.div layoutId="activeTabInput" className="absolute inset-0 bg-white/10 border border-white/10 rounded-xl -z-10" />
                    )}
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-end justify-center md:justify-end pb-1.5">
              <button 
                onClick={handleSubmit} 
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-black uppercase tracking-[0.2em] text-sm px-12 py-5 rounded-2xl shadow-2xl shadow-purple-600/40 hover:scale-[1.03] active:scale-[0.97] transition-all flex items-center justify-center gap-3 group border border-white/20"
              >
                <span>Initialize Simulation</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Right Side: AI Prediction Graph (NEW) */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="lg:col-span-12 xl:col-span-5 glass-panel p-8 flex flex-col space-y-8 border-white/10 bg-black/20 relative overflow-hidden h-full min-h-[500px]"
        >
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-pink-500/5 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="flex items-center justify-between relative z-10">
            <div>
              <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-400" /> AI-Based Prediction
              </h3>
              <p className="text-[9px] text-slate-500 font-bold tracking-widest uppercase mt-1">Real-time Causal Forecasting</p>
            </div>
            <div className="px-3 py-1.5 rounded-full bg-green-500/20 border border-green-500/40 flex items-center gap-2 shadow-lg">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs font-black text-green-400 uppercase tracking-widest">Low Risk</span>
            </div>
          </div>

          {/* Graph Container */}
          <div className="flex-1 w-full min-h-[250px] relative z-10 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={predictionData}>
                <defs>
                  <linearGradient id="colorGlucose" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="time" 
                  tick={{ fill: '#475569', fontSize: 10, fontWeight: 700 }} 
                  stroke="transparent"
                  dy={10}
                />
                <YAxis 
                  domain={['dataMin - 20', 'dataMax + 20']} 
                  hide 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#020617', 
                    borderRadius: '12px', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    fontSize: '10px',
                    fontWeight: 800
                  }}
                  itemStyle={{ color: '#a855f7' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="glucose" 
                  stroke="#a855f7" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorGlucose)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* AI Insights */}
          <div className="space-y-4 pt-4 border-t border-white/5 relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                <Info className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold text-slate-400 tracking-tight">
                Risk likely to drop in <span className="text-white">next 2 hours</span>
              </p>
            </div>
            <div className="p-5 rounded-xl bg-white/10 border border-white/20 flex gap-4 shadow-xl backdrop-blur-md">
               <ShieldAlert className="w-5 h-5 text-pink-400 flex-shrink-0" />
               <p className="text-xs text-slate-200 font-extrabold leading-relaxed uppercase tracking-wider">
                 Predicted trajectory remains within optimal bounds (70-140 mg/dL). No immediate intervention required for metabolic stabilization.
               </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
