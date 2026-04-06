import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { predictionId, actualGlucose, hypoOccurred } = body
    if (!predictionId) return NextResponse.json({ error: 'predictionId required' }, { status: 400 })

    const { data: prediction } = await supabase
      .from('predictions').select('predicted_glucose').eq('id', predictionId).single()

    const predictionError = prediction ? Math.abs(prediction.predicted_glucose - actualGlucose) : null

    const { error } = await supabase.from('predictions').update({
      actual_glucose: actualGlucose,
      hypo_occurred: hypoOccurred,
      feedback_at: new Date().toISOString(),
      prediction_error: predictionError
    }).eq('id', predictionId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    await fetch(process.env.ML_SERVICE_URL + '/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actual_hypo: hypoOccurred ? 1 : 0 })
    }).catch(() => { })

    return NextResponse.json({ success: true, predictionError })
  } catch (err) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }
}