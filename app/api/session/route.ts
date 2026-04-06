import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'

const sessionSchema = z.object({
  glucose: z.number(),
  insulinDose: z.number(),
  insulinType: z.string(),
  hoursAgoInsulin: z.number(),
  mealPreset: z.string(),
  carbGrams: z.number(),
  activity: z.string(),
  trend: z.string(),
  riskScore: z.number(),
  predictedGlucose: z.number(),
  alertLevel: z.string(),
  iob: z.number(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = sessionSchema.parse(body)

    const { data, error } = await supabase
      .from('sessions')
      .insert({
        glucose: validated.glucose,
        insulin_dose: validated.insulinDose,
        insulin_type: validated.insulinType,
        hours_ago_insulin: validated.hoursAgoInsulin,
        meal_preset: validated.mealPreset,
        carb_grams: validated.carbGrams,
        activity: validated.activity,
        trend: validated.trend,
        risk_score: validated.riskScore,
        predicted_glucose: validated.predictedGlucose,
        alert_level: validated.alertLevel,
        iob: validated.iob,
      })
      .select()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ sessionId: data[0].id })
  } catch (err) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }
}

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(data)
}