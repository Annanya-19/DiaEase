import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'

const alertSchema = z.object({
  alertLevel: z.string(),
  message: z.string(),
  tier: z.number(),
  sessionId: z.string(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = alertSchema.parse(body)

    const { error } = await supabase
      .from('alert_events')
      .insert({
        alert_level: validated.alertLevel,
        message: validated.message,
        tier: validated.tier,
        session_id: validated.sessionId,
      })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }
}

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('sessionId')
  if (!sessionId) return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 })

  const { data, error } = await supabase
    .from('alert_events')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}