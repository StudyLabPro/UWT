type RangeControlProps = {
  min: number
  max: number
  step?: number
  value: number
  onChange: (value: number) => void
}

export function RangeControl({ min, max, step = 1, value, onChange }: RangeControlProps) {
  return <input type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} />
}
