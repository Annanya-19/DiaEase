import { NextRequest, NextResponse } from 'next/server'
<<<<<<< HEAD
import { z } from 'zod'
import { supabase } from '@/lib/supabase'

const passportSchema = z.object({
  sessionId: z.string(),
  passportData: z.any(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = passportSchema.parse(body)

    const url_slug = Math.random().toString(36).substring(2, 10)

    const { data, error } = await supabase
      .from('passports')
      .insert({
        session_id: validated.sessionId,
        passport_data: validated.passportData,
        url_slug,
      })
      .select()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({
      passportId: data[0].id,
      passportUrl: '/passport/' + url_slug,
    })
  } catch (err) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }
}
=======
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, passportData } = body
    if (!sessionId) return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 })
    const url_slug = Math.random().toString(36).substring(2, 10)
    const { data, error } = await supabase
      .from('passports')
      .insert({ session_id: sessionId, passport_data: passportData || {}, url_slug })
      .select()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ passportId: data[0].id, passportUrl: '/passport/' + url_slug })
  } catch (err) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }
}
>>>>>>> backend/final
