export interface SimulationParams {
  currentGlucose: number;
  insulinDose: number;
  carbs: number;
  activityLevel: 'Resting' | 'Walking' | 'Exercise';
}

export interface DataPoint {
  time: string;
  glucose: number;
  isSimulated: boolean;
}

export function runSimulation(params: SimulationParams): DataPoint[] {
  const { currentGlucose, insulinDose, carbs, activityLevel } = params;
  const data: DataPoint[] = [];

  // Start time: Now. We will project the next 4 hours in 30-min increments.
  const now = new Date();
  let glucose = currentGlucose || 100;
  
  // Activity Multiplier: Exercise drops glucose faster.
  const activityMultiplier = activityLevel === 'Exercise' ? 1.5 : (activityLevel === 'Walking' ? 1.2 : 1.0);

  // Simple mock math:
  // Carbs max impact is at +1 hour, then taper off. Total impact = carbs * 3 mg/dL.
  // Insulin max impact at +2 hours, decays by hour 4. Total impact = insulin * -40 mg/dL.
  
  const totalCarbImpact = carbs * 3;
  const totalInsulinDrop = insulinDose * 40 * activityMultiplier;

  // Hourly distribution mocks (0, 30m, 1h, 1.5h, 2h, 2.5h, 3h, 3.5h, 4h)
  const carbCurve = [0, 0.4, 0.8, 0.9, 1.0, 0.8, 0.4, 0.1, 0];
  const insulinCurve = [0, -0.1, -0.3, -0.6, -1.0, -0.9, -0.6, -0.2, 0];

  for (let i = 0; i <= 8; i++) {
    const timeObj = new Date(now.getTime() + i * 30 * 60000);
    const timeStr = timeObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Calculate delta for this specific tick based on the curves
    const carbDelta = i === 0 ? 0 : totalCarbImpact * (carbCurve[i] - carbCurve[i-1]);
    const insulinDelta = i === 0 ? 0 : totalInsulinDrop * (insulinCurve[i] - insulinCurve[i-1]);
    
    // Natural metabolic drift
    const baselineDrift = activityLevel === 'Exercise' ? -5 : (activityLevel === 'Walking' ? -2 : -1);

    glucose = Math.max(20, glucose + carbDelta + insulinDelta + baselineDrift);

    data.push({
      time: timeStr,
      glucose: Math.round(glucose),
      isSimulated: i > 0,
    });
  }

  return data;
}

export function determineRisk(curve: DataPoint[]): { risk: 'High' | 'Medium' | 'Low', message: string } {
  const minGlucose = Math.min(...curve.map(d => d.glucose));
  const maxGlucose = Math.max(...curve.map(d => d.glucose));

  if (minGlucose < 54) {
    return { risk: 'High', message: 'CRITICAL: Severe hypoglycemia predicted.' };
  } else if (minGlucose < 70) {
    return { risk: 'Medium', message: 'Warning: You may go low soon. Consider a small snack.' };
  } else if (maxGlucose > 250) {
    return { risk: 'High', message: 'Warning: Hyperglycemia predicted. Monitor closely.' };
  } else if (maxGlucose > 180) {
    return { risk: 'Medium', message: 'Glucose elevation predicted. A light walk may help stabilize.' };
  }

  return { risk: 'Low', message: 'Your predicted curve is stable and well within range.' };
}
