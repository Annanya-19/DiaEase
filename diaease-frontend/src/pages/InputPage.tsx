import { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Syringe, Clock, Utensils, PersonStanding, Sunrise, ChevronRight, Zap } from 'lucide-react';

interface MLResult {
  riskScore: number;
  alertLevel: string;
  predictedGlucose30min: number;
  hypoProba: number;
  confidence: number;
  featureImportances: Record<string, number>;
  modelVersion: string;
}

interface InputPageProps {
  onSimulate?: (params: any, mlResult?: MLResult) => void;
}

export default function InputPage({ onSimulate }: InputPageProps) {
  const [activeField, setActiveField] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [glucose, setGlucose] = useState<string>('120');
  const [insulin, setInsulin] = useState<string>('5');
  const [timeSince, setTimeSince] = useState<string>('30');
  const [carbs, setCarbs] = useState<string>('45');
  const [activity, setActivity] = useState<'Resting' | 'Walking' | 'Exercise'>('Resting');
  const [trend, setTrend] = useState<'Stable Phase' | 'Hyper Phase' | 'Hypo Phase'>('Stable Phase');

  const fields = [
    { id: 'glucose', icon: Activity, label: 'Current Glucose', placeholder: 'e.g. 105', unit: 'mg/dL', type: 'number', val: glucose, setVal: setGlucose, color: 'text-purple-600' },
    { id: 'insulin', icon: Syringe, label: 'Insulin Dose', placeholder: 'e.g. 5', unit: 'Units', type: 'number', val: insulin, setVal: setInsulin, color: 'text-pink-600' },
    { id: 'timeSince', icon: Clock, label: 'Time Since Dose', placeholder: 'e.g. 30', unit: 'mins', type: 'number', val: timeSince, setVal: setTimeSince, color: 'text-rose-600' },
    { id: 'meal', icon: Utensils, label: 'Last Meal Amount', placeholder: 'e.g. 45', unit: 'g carbs', type: 'number', val: carbs, setVal: setCarbs, color: 'text-purple-600' },
  ];

  const activityMap: Record<string, number> = { Resting: 0, Walking: 1, Exercise: 2 };
  const trendMap: Record<string, number> = { 'Hyper Phase': 1, 'Stable Phase': 0, 'Hypo Phase': -1 };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      // Convert mg/dL to mmol/L for the ML model
      const glucoseMmol = (Number(glucose) || 120) / 18;
      const insulinDose = Number(insulin) || 0;
      const carbGrams = Number(carbs) || 0;
      const minsSince = Number(timeSince) || 30;

      const res = await fetch('https://diaease-production.up.railway.app/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          glucose: glucoseMmol,
          iob: insulinDose,
          carbs: carbGrams,
          activity: activityMap[activity],
          hour: new Date().getHours(),
          trend: trendMap[trend],
          mins_since_meal: minsSince,
          glucose_velocity: trendMap[trend] === -1 ? -0.2 : trendMap[trend] === 1 ? 0.2 : 0,
          prev_hypo_24h: 0
        })
      });

      if (!res.ok) throw new Error('ML service error');
      const mlResult: MLResult = await res.json();

      if (onSimulate) {
        onSimulate({
          currentGlucose: Number(glucose) || 120,
          insulinDose,
          carbs: carbGrams,
          activityLevel: activity
        }, mlResult);
      }
    } catch (err: any) {
      setError('Failed to connect to ML service. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4 mb-16"
      >
        <div className="inline-flex items-center justify-center gap-2 px-6 py-1.5 rounded-full border border-purple-200 bg-white/60 text-purple-700 text-xs font-black uppercase tracking-[0.2em] mx-auto w-max mb-6 backdrop-blur-md shadow-sm">
          Metabolic Session ID: FE-829
        </div>
        <h1 className="text-5xl font-black tracking-tighter text-slate-900 mb-4">Metabolic Phase <span className="text-gradient-purple">Input</span></h1>
        <p className="text-slate-500 font-bold tracking-wide max-w-xl mx-auto uppercase text-[10px]">Enter high-fidelity biometric data to initialize causal trajectory modeling.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.8 }}
        className="glass-panel p-10 md:p-14 space-y-12 border-white relative overflow-hidden shadow-2xl"
      >
        <div className="grid md:grid-cols-2 gap-8 relative z-10">
          {fields.map((field) => (
            <div
              key={field.id}
              className={`transition-all duration-500 rounded-[2rem] p-8 border ${
                activeField === field.id
                  ? 'bg-white shadow-xl border-purple-200 scale-[1.02]'
                  : 'bg-white/40 border-white/60 hover:bg-white/60 hover:border-white'
              }`}
            >
              <label className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">
                <div className={`p-2.5 rounded-xl transition-all duration-500 ${activeField === field.id ? 'bg-purple-600 text-white shadow-lg' : 'bg-white/60 text-slate-400 border border-white'}`}>
                  <field.icon className="w-5 h-5" />
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
                  className="w-full bg-transparent border-none outline-none text-4xl font-black placeholder:text-slate-300 text-slate-900 transition-all tracking-tighter"
                />
                <span className={`text-xs font-black uppercase tracking-widest ${activeField === field.id ? 'text-purple-600' : 'text-slate-400'}`}>{field.unit}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

        <div className="grid md:grid-cols-2 gap-12 relative z-10">
          <div className="space-y-6">
            <label className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              <PersonStanding className="w-4 h-4 text-pink-600" /> Biomark Activity Level
            </label>
            <div className="bg-slate-100/50 p-1.5 rounded-2xl flex border border-slate-200 relative">
              {['Resting', 'Walking', 'Exercise'].map(type => (
                <button
                  key={type}
                  onClick={() => setActivity(type as any)}
                  className={`flex-1 py-3.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all relative z-10 ${activity === type ? 'text-purple-900 font-bold' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {activity === type && (
                    <motion.div layoutId="activeTabInput" className="absolute inset-0 bg-white rounded-xl shadow-sm -z-10" />
                  )}
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <label className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              <Zap className="w-4 h-4 text-pink-600" /> Initial Entropy Trend
            </label>
            <div className="flex items-center justify-between bg-white/40 px-6 py-4 rounded-2xl border border-white/60 group hover:border-purple-300 transition-all shadow-sm">
              <span className="text-xs font-black uppercase tracking-tight text-slate-400 group-hover:text-slate-600 transition-colors">Stability Projection</span>
              <select
                value={trend}
                onChange={(e) => setTrend(e.target.value as any)}
                className="bg-transparent text-xs font-black uppercase tracking-widest outline-none cursor-pointer pr-2 text-purple-700"
              >
                <option>Stable Phase</option>
                <option>Hyper Phase</option>
                <option>Hypo Phase</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-600 text-xs font-bold text-center">
            {error}
          </div>
        )}

        <div className="pt-12 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
            <Sunrise className="w-4 h-4" />
            Metabolic Sync Validated
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full md:w-auto relative group overflow-hidden bg-gradient-to-r from-purple-700 to-pink-600 py-5 px-12 rounded-2xl hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <div className="flex items-center justify-center gap-4">
              <span className="font-black text-white uppercase tracking-[0.2em] text-sm">
                {loading ? 'Analyzing...' : 'Initialize Simulation'}
              </span>
              <ChevronRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>
      </motion.div>
    </div>
  );
}