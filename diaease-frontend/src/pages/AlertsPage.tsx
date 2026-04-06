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
        border: 'border-pink-200 shadow-md',
        bg: 'bg-pink-50/80',
        text: 'text-pink-700',
        icon: <ShieldAlert className="w-6 h-6 text-pink-600" />
      };
      case 'medium': return {
        border: 'border-purple-200 shadow-md',
        bg: 'bg-purple-50/80',
        text: 'text-purple-700',
        icon: <AlertTriangle className="w-6 h-6 text-purple-600" />
      };
      case 'low': return {
        border: 'border-slate-200 shadow-sm',
        bg: 'bg-slate-50/80',
        text: 'text-slate-700',
        icon: <Info className="w-6 h-6 text-slate-500" />
      };
      default: return {
        border: 'border-white/60',
        bg: 'bg-white/40',
        text: 'text-slate-900',
        icon: <AlertTriangle className="w-6 h-6 text-slate-900" />
      };
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black tracking-tighter text-slate-900 mb-2">Alert <span className="text-gradient-purple">Nexus</span></h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em]">Proactive metabolic risk notifications.</p>
        </div>
        <div className="glass-panel px-6 py-2.5 flex items-center gap-3 border-purple-200 bg-white/60 shadow-sm">
          <div className="w-2 h-2 rounded-full bg-purple-600 animate-pulse shadow-sm" />
          <span className="text-xs font-black uppercase tracking-widest text-purple-800">Causal Monitoring Active</span>
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
              className={`glass-panel p-10 border-l-8 ${style.border} ${style.bg} relative overflow-hidden group hover:scale-[1.01] transition-all duration-500 shadow-xl`}
            >
              <div className="flex flex-col md:flex-row gap-8 relative z-10">
                <div className="flex-shrink-0">
                   <div className="p-4 rounded-[1.5rem] bg-white border border-white shadow-sm transition-transform group-hover:scale-110 duration-500">
                    {style.icon}
                   </div>
                </div>
                <div className="flex-1 space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h3 className={`text-2xl font-black ${style.text} tracking-tight uppercase`}>{alert.title}</h3>
                    <div className="flex items-center gap-2.5 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full bg-white/80 border border-white shadow-sm text-slate-500">
                      <Clock className="w-3.5 h-3.5" />
                      Risk Horizon: {alert.timeToRisk}
                    </div>
                  </div>
                  
                  <p className="text-slate-600 text-sm font-bold leading-relaxed tracking-wide">
                    {alert.message}
                  </p>
                  
                  <div className="mt-8 p-6 rounded-[2rem] bg-white/60 border border-white group-hover:border-purple-200 transition-all shadow-inner">
                    <div className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-black mb-3 flex items-center gap-2">
                       <Zap className="w-3.5 h-3.5 text-pink-600" /> Recommended Action
                    </div>
                    <p className="text-purple-900 font-black text-base tracking-tight">{alert.action}</p>
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

