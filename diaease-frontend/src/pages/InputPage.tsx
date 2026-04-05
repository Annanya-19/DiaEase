import { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Syringe, Clock, Utensils, PersonStanding, Sunrise, ChevronRight } from 'lucide-react';
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
    { id: 'glucose', icon: Activity, label: 'Current Glucose', placeholder: 'e.g. 105', unit: 'mg/dL', type: 'number', val: glucose, setVal: setGlucose },
    { id: 'insulin', icon: Syringe, label: 'Insulin Dose', placeholder: 'e.g. 5', unit: 'Units', type: 'number', val: insulin, setVal: setInsulin },
    { id: 'timeSince', icon: Clock, label: 'Time Since Dose', placeholder: 'e.g. 30', unit: 'mins', type: 'number', val: timeSince, setVal: setTimeSince },
    { id: 'meal', icon: Utensils, label: 'Last Meal Amount', placeholder: 'e.g. 45', unit: 'g carbs', type: 'number', val: carbs, setVal: setCarbs },
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
    <div className="max-w-4xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4 mb-12"
      >
        <div className="inline-block px-4 py-1 flex items-center justify-center gap-2 rounded-full border border-theme-gold/30 bg-theme-gold/10 text-white text-sm mx-auto w-max mb-4">
           Step 1 of 1
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Metabolic Input</h1>
        <p className="text-gray-400 font-light">Enter your biomarkers for trajectory analysis.</p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-panel p-8 md:p-12 space-y-10 rounded-[2.5rem]"
      >
        <div className="grid md:grid-cols-2 gap-6 relative z-10">
          {fields.map((field) => (
            <div 
              key={field.id}
              className={`transition-all duration-300 rounded-3xl p-5 border ${
                activeField === field.id 
                  ? 'bg-theme-navy/90 shadow-[0_0_20px_rgba(212,175,55,0.15)] border-theme-gold/50 scale-[1.02]' 
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
            >
              <label className="flex items-center gap-3 text-sm font-medium text-gray-300 mb-3">
                <div className={`p-2 rounded-xl transition-colors ${activeField === field.id ? 'bg-theme-gold/20 text-theme-gold' : 'bg-white/10 text-gray-400'}`}>
                  <field.icon className="w-5 h-5" />
                </div>
                {field.label}
              </label>
              <div className="flex items-center gap-3">
                <input
                  type={field.type}
                  value={field.val}
                  onChange={(e) => field.setVal(e.target.value)}
                  placeholder={field.placeholder}
                  onFocus={() => setActiveField(field.id)}
                  onBlur={() => setActiveField(null)}
                  className="w-full bg-transparent border-none outline-none text-3xl font-light placeholder:text-gray-600 text-white transition-all"
                />
                <span className={`text-sm font-medium whitespace-nowrap ${activeField === field.id ? 'text-theme-gold' : 'text-gray-500'}`}>{field.unit}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="grid md:grid-cols-2 gap-8 relative z-10">
          <div className="space-y-4">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
              <PersonStanding className="w-4 h-4 text-theme-neon" /> Activity Level
            </label>
            <div className="bg-[#0a0f1a] p-1.5 rounded-2xl flex border border-white/10 relative">
              {['Resting', 'Walking', 'Exercise'].map(type => (
                <button 
                  key={type} 
                  onClick={() => setActivity(type as any)}
                  className={`flex-1 py-3 text-sm font-medium rounded-xl transition-all relative z-10 ${activity === type ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  {activity === type && (
                    <motion.div layoutId="activeTabInput" className="absolute inset-0 bg-white/10 border border-white/20 rounded-xl shadow-sm -z-10" />
                  )}
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
              <Sunrise className="w-4 h-4 text-theme-neon" /> System Status
            </label>
            <div className="flex items-center justify-between bg-[#0a0f1a] px-5 py-[14px] rounded-2xl border border-white/10">
              <span className="text-sm font-medium pl-1 text-gray-300">Glucose Trend</span>
              <select className="bg-transparent text-sm font-semibold outline-none cursor-pointer p-1 text-theme-neon">
                <option>Stable →</option>
                <option>Rising ↑</option>
                <option>Falling ↓</option>
              </select>
            </div>
          </div>
        </div>

        <div className="pt-8 relative z-10 flex justify-end">
          <button onClick={handleSubmit} className="w-full md:w-auto bg-gradient-to-r from-theme-gold to-yellow-600 text-[#060B14] px-10 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all hover:scale-[1.02] group text-lg">
            Run Prediction 
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
