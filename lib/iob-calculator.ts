export function calculateIOB(
  dose: number,
  hoursAgo: number,
  insulinType: 'rapid' | 'long' | 'mixed'
): number {
  const peakMinutes =
    insulinType === 'rapid' ? 90 : insulinType === 'long' ? 480 : 240
  const raw = dose * Math.exp(-(hoursAgo * 60) / peakMinutes)
  return Math.max(0, raw)
}
