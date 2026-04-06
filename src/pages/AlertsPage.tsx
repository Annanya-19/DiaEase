import { AlertTriangle, Clock, Zap, Info, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AlertsPage() {
  const alerts = [
    {
      id: 1,
      type: 'high',
      title: 'Hypoglycemia Warning',
      timeToRisk: '45 mins',
      message: 'Your predicted curve dips below 70mg/dL. High insulin activity combined with zero recent carbohydrate intake is driving this trajectory.',
      action: 'Consume 15g of fast-acting carbohydrates now.'
    },
    {
      id: 2,
      type: 'medium',
      title: 'Activity Imbalance',
      timeToRisk: 'Active',
      message: 'You have logged Exercise without a preceding glucose buffer.',
      action: 'Reduce intensity or ensure post-exercise protein intake.'
    },
    {
      id: 3,
      type: 'low',
      title: 'Calibration Required',
      timeToRisk: '-',
      message: 'No CGM sync detected for 12 hours. We are operating purely on manual predictions.',
      action: 'Sync device to improve AI prediction accuracy.'
    }
  ];

  const getTypeStyle = (type: string) => {
    switch(type) {
      case 'high': return {
        border: 'border-red-600/50 shadow-glow-red/20',
        bg: 'bg-red-600/10',
        text: 'text-red-600',
        icon: <ShieldAlert className="w-6 h-6 text-red-600" />
      };
      case 'medium': return {
        border: 'border-pink-500/50 shadow-glow-pink/10',
        bg: 'bg-pink-500/5',
        text: 'text-pink-500',
        icon: <AlertTriangle className="w-6 h-6 text-pink-500" />
      };
      case 'low': return {
        border: 'border-purple-600/50 shadow-glow-purple/10',
        bg: 'bg-purple-600/5',
        text: 'text-purple-400',
        icon: <Info className="w-6 h-6 text-purple-400" />
      };
      default: return {
        border: 'border-white/10',
        bg: 'bg-white/5',
        text: 'text-white',
        icon: <AlertTriangle className="w-6 h-6 text-white" />
      };
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black tracking-tighter text-slate-900 mb-2">Metabolic <span className="text-indigo-600">Alerts</span></h1>
          <p className="text-slate-600 text-[10px] uppercase font-bold tracking-[0.3em]">Systematic risk monitoring and biothread safety.</p>
        </div>
        <div className="bg-slate-100 border border-slate-200 px-6 py-2.5 flex items-center gap-3 rounded-2xl shadow-sm">
          <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
          <span className="text-xs font-black uppercase tracking-widest text-slate-700">Clinical Monitoring Active</span>
        </div>
      </div>

      <div className="space-y-8">
        {alerts.map((alert, i) => {
          const style = getTypeStyle(alert.type);
          return (
            <motion.div 
              key={alert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.15, duration: 0.6 }}
              className={`bg-white/95 border-l-8 ${style.border} ${style.bg} p-10 rounded-[2.5rem] border border-slate-200 shadow-xl relative overflow-hidden group hover:scale-[1.01] transition-transform duration-500`}
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
              
              <div className="flex flex-col md:flex-row gap-8 relative z-10">
                <div className="flex-shrink-0">
                   <div className="p-4 rounded-[1.5rem] bg-white/5 border border-white/10 shadow-lg">
                    {style.icon}
                   </div>
                </div>
                <div className="flex-1 space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">{alert.title}</h3>
                    <div className="flex items-center gap-2.5 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600">
                      <Clock className="w-3.5 h-3.5" />
                      Protocol Horizon: {alert.timeToRisk}
                    </div>
                  </div>
                  
                  <p className="text-slate-700 text-sm font-extrabold leading-relaxed tracking-wide">
                    {alert.message}
                  </p>
                  
                  <div className="mt-8 p-6 rounded-[2rem] bg-slate-50 border border-slate-200 group-hover:border-indigo-600/20 transition-all">
                    <div className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-black mb-3 flex items-center gap-2">
                       <Zap className="w-3.5 h-3.5 text-indigo-600" /> Medical Recommendation
                    </div>
                    <p className="text-indigo-600 font-black text-base tracking-tight">{alert.action}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
