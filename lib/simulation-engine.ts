import type { GlucoseInput, SimulationPoint } from '../types/index'
import { calculateIOB } from './iob-calculator'

export function generateTrajectory(
  input: GlucoseInput,
  minutes: number = 60
): SimulationPoint[] {
  const points: SimulationPoint[] = []
  for (let t = 0; t <= minutes; t++) {
    const iobAtT = calculateIOB(
      input.insulinDose,
      input.hoursAgoInsulin + t / 60,
      input.insulinType
    )
    const carbEffect = input.carbGrams * 0.04 * Math.min(t / 30, 1)
    const noise = (Math.random() - 0.5) * 0.08
    const glucose = Math.max(
      1.5,
      Math.min(
        20,
        input.glucose - iobAtT * 1.8 + carbEffect + noise
      )
    )
    points.push({ minute: t, glucose })
  }
  return points
}
