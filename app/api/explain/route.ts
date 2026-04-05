import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const explainBodySchema = z.object({
  riskScore: z.number(),
  glucose: z.number(),
  iob: z.number(),
  alertLevel: z.string(),
  causalFactors: z.array(z.any()),
})

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = explainBodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const validatedData = parsed.data
  return NextResponse.json({
    narrative:
      'AI explanation coming soon. Risk score is ' +
      validatedData.riskScore +
      ' and alert level is ' +
      validatedData.alertLevel +
      '.',
  })
}
