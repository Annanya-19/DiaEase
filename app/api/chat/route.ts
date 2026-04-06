import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, context } = body
    if (!message) return NextResponse.json({ error: 'Message required' }, { status: 400 })

    const contextString = context ? `Patient's current metabolic state:
- Glucose: ${context.glucose} mmol/L
- Risk Score: ${context.riskScore}/100
- Alert Level: ${context.alertLevel}
- Insulin on Board: ${context.iob} units
- Activity: ${context.activity}
- Trend: ${context.trend}` : 'No metabolic context provided.'

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 300,
      messages: [
        { role: 'system', content: 'You are DiaEase AI, a clinical assistant for diabetic patients. Be concise, warm, and actionable. Max 3 sentences. No markdown. No disclaimers. Always ground your answer in the patient actual numbers.' },
        { role: 'user', content: `${contextString}\n\nPatient asks: ${message}` }
      ]
    })

    const reply = response.choices[0].message.content || 'Unable to generate response'
    return NextResponse.json({ reply })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Chat failed' }, { status: 500 })
  }
}