import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

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

  const { riskScore, glucose, iob, alertLevel, causalFactors } = parsed.data

  const topFactors = causalFactors
    .slice(0, 3)
    .map((f: any) => `${f.name} (${f.value})`)
    .join(', ')

  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 200,
      messages: [
        {
          role: 'system',
          content: 'You are a clinical AI in a glucose prediction tool. Be concise and actionable. Max 3 sentences. No markdown. No disclaimers.'
        },
        {
          role: 'user',
          content: `Patient glucose: ${glucose} mmol/L. Risk score: ${riskScore}/100. Alert level: ${alertLevel}. Key risk factors: ${topFactors}. Explain why and what to do.`
        }
      ]
    })

    const narrative = response.choices[0].message.content || 'Unable to generate explanation.'
    return NextResponse.json({ narrative })
  } catch (err: any) {
    return NextResponse.json({ narrative: `Risk score is ${riskScore} and alert level is ${alertLevel}.` })
  }
}