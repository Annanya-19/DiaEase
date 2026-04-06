import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const glucoseInputSchema = z.object({
  glucose: z.number(),
  insulinDose: z.number(),
  insulinType: z.enum(['rapid', 'long', 'mixed']),
  hoursAgoInsulin: z.number(),
  mealPreset: z.enum(['none', 'snack', 'normal', 'large']),
  carbGrams: z.number(),
  activity: z.enum(['resting', 'walking', 'exercising', 'post-exercise']),
  trend: z.enum(['rising', 'stable', 'falling']),
})

const activityMap: Record<string, number> = { resting: 0, walking: 1, exercising: 2, 'post-exercise': 3 }
const trendMap: Record<string, number> = { rising: 1, stable: 0, falling: -1 }

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

  const input = parsed.data

  try {
    const mlRes = await fetch('https://diaease-production.up.railway.app/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        glucose: input.glucose,
        iob: input.insulinDose,
        carbs: input.carbGrams,
        activity: activityMap[input.activity],
        hour: new Date().getHours(),
        trend: trendMap[input.trend],
        mins_since_meal: input.hoursAgoInsulin * 60,
        glucose_velocity: input.trend === 'falling' ? -0.2 : input.trend === 'rising' ? 0.2 : 0,
        prev_hypo_24h: 0
      })
    })

    const result = await mlRes.json()

    return NextResponse.json({
      riskScore: result.riskScore,
      alertLevel: result.alertLevel,
      predictedGlucose30min: result.predictedGlucose30min,
      hypoProba: result.hypoProba,
      confidence: result.confidence,
      featureImportances: result.featureImportances,
      modelVersion: result.modelVersion,
      iob: input.insulinDose,
      causalFactors: Object.entries(result.featureImportances || {}).map(([name, weight]) => ({
        name,
        weight: Math.round((weight as number) * 100),
        value: name === 'glucose' ? `${input.glucose} mmol/L` : String(weight),
        impact: (weight as number) > 0.3 ? 'negative' : 'neutral'
      }))
    })
  } catch (err: any) {
    return NextResponse.json({ error: 'ML service unavailable: ' + err.message }, { status: 503 })
  }
}