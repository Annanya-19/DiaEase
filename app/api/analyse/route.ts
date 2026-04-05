import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import type { GlucoseInput } from '../../../types/index'
import { calculateRisk } from '../../../lib/risk-engine'

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

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = glucoseInputSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const riskOutput = calculateRisk(parsed.data)
  return NextResponse.json(riskOutput)
}
