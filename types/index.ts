export interface GlucoseInput {
  glucose: number
  insulinDose: number
  insulinType: 'rapid' | 'long' | 'mixed'
  hoursAgoInsulin: number
  mealPreset: 'none' | 'snack' | 'normal' | 'large'
  carbGrams: number
  activity: 'resting' | 'walking' | 'exercising' | 'post-exercise'
  trend: 'rising' | 'stable' | 'falling'
}

export interface CausalFactor {
  name: string
  weight: number
  value: string
  impact: 'positive' | 'negative' | 'neutral'
}

export interface RiskOutput {
  riskScore: number
  predictedGlucose30min: number
  alertLevel: 'safe' | 'warn' | 'danger'
  iob: number
  causalFactors: CausalFactor[]
}

export interface SimulationPoint {
  minute: number
  glucose: number
}

export interface TwinInput {
  runKm: number
  carbsG: number
  correctionInsulin: number
  minutesAhead: number
}

export interface AlertEvent {
  alertLevel: string
  message: string
  tier: number
  timestamp: string
}
