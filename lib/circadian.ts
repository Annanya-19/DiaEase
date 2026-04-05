export function getCircadianFactor(hour: number): number {
  if (hour >= 4 && hour < 8) return 1.25
  if (hour >= 8 && hour < 12) return 1.0
  if (hour >= 12 && hour < 15) return 1.1
  if (hour >= 15 && hour < 18) return 0.9
  if (hour >= 18 && hour < 22) return 1.0
  if (hour >= 22 || hour < 2) return 1.2
  if (hour >= 2 && hour < 4) return 1.15
  return 1.0
}

export function getCircadianPhase(hour: number):
  | 'Dawn phenomenon'
  | 'Morning stable'
  | 'Post-lunch dip'
  | 'Afternoon low'
  | 'Evening stable'
  | 'Night watch'
  | 'Deep night' {
  if (hour >= 4 && hour < 8) return 'Dawn phenomenon'
  if (hour >= 8 && hour < 12) return 'Morning stable'
  if (hour >= 12 && hour < 15) return 'Post-lunch dip'
  if (hour >= 15 && hour < 18) return 'Afternoon low'
  if (hour >= 18 && hour < 22) return 'Evening stable'
  if (hour >= 22 || hour < 2) return 'Night watch'
  if (hour >= 2 && hour < 4) return 'Deep night'
  return 'Morning stable'
}
