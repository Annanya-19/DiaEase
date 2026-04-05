import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import type { GlucoseInput, TwinInput } from '../../../types/index'
import { calculateRisk } from '../../../lib/risk-engine'
import { generateTrajectory } from '../../../lib/simulation-engine'

const glucoseInputSchema = z.object({
  glucose: z.number(),
  insulinDose: z.number(),
  insulinType: z.enum(['rapid', 'long', 'mixed']),
  hoursAgoInsulin: z.number(),
  mealPreset: z.enum(['none', 'snack', 'normal', 'large']),
  carbGrams: z.number(),
  activity: z.enum(['resting', 'walking', 'exercising', 'post-exercise']),
  trend: z.enum(['rising', 'stable', 'falling']),
}) satisfies z.ZodType<GlucoseInput>

const twinInputSchema = z.object({
  runKm: z.number(),
  carbsG: z.number(),
  correctionInsulin: z.number(),
  minutesAhead: z.number(),
}) satisfies z.ZodType<TwinInput>

const simulateBodySchema = z.object({
  baseInput: glucoseInputSchema,
  twin: twinInputSchema,
})

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = simulateBodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { baseInput, twin } = parsed.data
  const merged: GlucoseInput = {
    ...baseInput,
    carbGrams: baseInput.carbGrams + twin.carbsG,
    insulinDose: baseInput.insulinDose + twin.correctionInsulin,
    activity:
      twin.runKm > 3
        ? 'exercising'
        : twin.runKm > 0
          ? 'walking'
          : baseInput.activity,
  }

  const riskOutput = calculateRisk(merged)
  const trajectory = generateTrajectory(merged, twin.minutesAhead)

  const advice =
    riskOutput.alertLevel === 'danger'
      ? 'Eat 15g fast carbs immediately'
      : riskOutput.alertLevel === 'warn'
        ? 'Consider a small snack'
        : 'Safe to proceed'

  return NextResponse.json({
    projectedGlucose: riskOutput.predictedGlucose30min,
    trajectory,
    chipStatus: riskOutput.alertLevel,
    advice,
    riskScore: riskOutput.riskScore,
  })
}
