import type { CausalFactor, GlucoseInput, RiskOutput } from '../types/index'
import { calculateIOB } from './iob-calculator'
import { getCircadianFactor, getCircadianPhase } from './circadian'

export function calculateRisk(input: GlucoseInput): RiskOutput {
  const iob = calculateIOB(
    input.insulinDose,
    input.hoursAgoInsulin,
    input.insulinType
  )

  const iobFactor = Math.min(iob / 3, 1)

  const trendFactor =
    input.trend === 'falling' ? 0.6 : input.trend === 'stable' ? 0 : 0.2

  const activityFactor =
    input.activity === 'exercising'
      ? 0.4
      : input.activity === 'post-exercise'
        ? 0.5
        : input.activity === 'walking'
          ? 0.1
          : 0

  let mealFactor = 0
  if (input.mealPreset === 'none') {
    mealFactor = input.hoursAgoInsulin < 2 ? 0.3 : 0
  } else if (input.mealPreset === 'snack') {
    mealFactor = 0.1
  } else if (input.mealPreset === 'normal') {
    mealFactor = 0.15
  } else if (input.mealPreset === 'large') {
    mealFactor = 0.2
  }

  const hour = new Date().getHours()
  const circadianFactor = getCircadianFactor(hour)
  const circadianBoost = (circadianFactor - 1) * 0.5
  const circadianPhase = getCircadianPhase(hour)

  const riskScore = Math.round(
    Math.min(
      iobFactor * 35 +
        trendFactor * 20 +
        activityFactor * 20 +
        circadianBoost * 15 +
        mealFactor * 10,
      99
    )
  )

  const activityOffset =
    input.activity === 'exercising'
      ? -0.5
      : input.activity === 'post-exercise'
        ? -0.3
        : 0

  const predictedGlucose30min = Math.max(
    1.5,
    Math.min(
      20,
      input.glucose -
        iob * 1.8 +
        input.carbGrams * 0.04 +
        activityOffset
    )
  )

  const alertLevel: RiskOutput['alertLevel'] =
    riskScore < 40 ? 'safe' : riskScore < 65 ? 'warn' : 'danger'

  const iobContrib = iobFactor * 35
  const trendContrib = trendFactor * 20
  const activityContrib = activityFactor * 20
  const mealContrib = mealFactor * 10
  const circadianContrib = circadianBoost * 15

  const causalFactors: CausalFactor[] = [
    {
      name: 'IOB',
      weight: 35,
      value: `Insulin on board ~${iob.toFixed(2)} u; factor ${iobFactor.toFixed(2)}`,
      impact:
        iobContrib > 15 ? 'negative' : iobContrib < 5 ? 'positive' : 'neutral',
    },
    {
      name: 'Trend',
      weight: 20,
      value: `Glucose trend: ${input.trend}`,
      impact:
        trendContrib > 12
          ? 'negative'
          : trendContrib < 4
            ? 'positive'
            : 'neutral',
    },
    {
      name: 'Activity',
      weight: 20,
      value: `Activity: ${input.activity}`,
      impact:
        activityContrib > 10
          ? 'negative'
          : activityContrib < 3
            ? 'positive'
            : 'neutral',
    },
    {
      name: 'Meal',
      weight: 10,
      value: `Meal preset: ${input.mealPreset}`,
      impact:
        mealContrib > 5
          ? 'negative'
          : mealContrib === 0
            ? 'positive'
            : 'neutral',
    },
    {
      name: 'Circadian',
      weight: 15,
      value: `${circadianPhase} (factor ${circadianFactor.toFixed(2)})`,
      impact:
        circadianContrib > 5
          ? 'negative'
          : circadianContrib < 1
            ? 'positive'
            : 'neutral',
    },
  ]

  return {
    riskScore,
    predictedGlucose30min,
    alertLevel,
    iob,
    causalFactors,
  }
}
