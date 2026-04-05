import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';
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
      case 'high': return 'border-red-500/50 bg-red-500/10 text-red-500';
      case 'medium': return 'border-orange-500/50 bg-orange-500/10 text-orange-500';
      case 'low': return 'border-theme-neon/50 bg-theme-neon/10 text-theme-neon';
      default: return 'border-white/20';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Alert Center</h1>
          <p className="text-gray-400">Proactive risk notifications and recommended actions.</p>
        </div>
        <div className="glass-panel px-4 py-2 flex items-center gap-2 border-theme-neon/30 text-theme-neon">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm font-medium">Monitoring Active</span>
        </div>
      </div>

      <div className="space-y-6">
        {alerts.map((alert, i) => (
          <motion.div 
            key={alert.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`glass-panel p-6 border-l-4 ${getTypeStyle(alert.type).split(' ')[0]} relative overflow-hidden`}
          >
            <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl opacity-20 ${getTypeStyle(alert.type).split(' ')[1]}`} />
            
            <div className="flex gap-4 relative z-10">
              <div className="mt-1">
                 <AlertTriangle className={`w-6 h-6 ${getTypeStyle(alert.type).split(' ')[2]}`} />
              </div>
              <div className="flex-1 space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-semibold text-white">{alert.title}</h3>
                  <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300">
                    <Clock className="w-3 h-3" />
                    {alert.timeToRisk}
                  </div>
                </div>
                
                <p className="text-gray-300 text-sm leading-relaxed">
                  {alert.message}
                </p>
                
                <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">Suggested Action</div>
                  <p className="text-theme-goldLight font-medium text-sm">{alert.action}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
