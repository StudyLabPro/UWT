import type { CSSProperties } from 'react'

type RangeControlProps = {
  min: number
  max: number
  step?: number
  value: number
  onChange: (value: number) => void
}

export function RangeControl({ min, max, step = 1, value, onChange }: RangeControlProps) {
  const progress = max === min ? 0 : ((value - min) / (max - min)) * 100
  const clampedProgress = Math.max(0, Math.min(100, progress))
  const style = { '--range-value': `${clampedProgress}%` } as CSSProperties

  return (
    <input
      className="pixelRange"
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      style={style}
      onChange={(event) => onChange(Number(event.target.value))}
    />
  )
}
