
import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, diabetesType, takesInsulin, mealsPerDay, activityLevel, typicalCarbIntake, experiencesHypoglycemia, preferredUnit, alertPreference, emergencyContactName, emergencyContactPhone } = body
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 })
    const { data: existing } = await supabase.from("users").select("id").eq("email", email).single()
    if (existing) return NextResponse.json({ userId: existing.id, existing: true })
    const { data, error } = await supabase.from("users").insert({ email, name, diabetes_type: diabetesType, takes_insulin: takesInsulin, meals_per_day: mealsPerDay, activity_level: activityLevel, typical_carb_intake: typicalCarbIntake, experiences_hypoglycemia: experiencesHypoglycemia, preferred_unit: preferredUnit, alert_preference: alertPreference, emergency_contact_name: emergencyContactName, emergency_contact_phone: emergencyContactPhone }).select()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ userId: data[0].id, existing: false })
  } catch (err) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 })
  }
}

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("email")
  const id = request.nextUrl.searchParams.get("id")
  const query = supabase.from("users").select("*")
  if (email) query.eq("email", email)
  else if (id) query.eq("id", id)
  else return NextResponse.json({ error: "Provide email or id" }, { status: 400 })
  const { data, error } = await query.single()
  if (error || !data) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(data)
}
