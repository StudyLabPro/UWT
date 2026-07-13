/**
 * Minimal, dependency-free implementations of two summation strategies used by the
 * interactive catastrophic-cancellation demo on /act:
 *
 *  - naiveSum: plain sequential float64 addition (`a += x`), the way most code sums numbers.
 *  - neumaierSum: Kahan-Babuska (Neumaier) compensated summation, an error-free-transform (EFT)
 *    based algorithm that tracks the rounding residue lost on every addition and folds it back
 *    into the result exactly once at the end. This is the same family of technique Balansis'
 *    `Operations.sequence_sum` exposes as an explicit (result, compensation) pair.
 *
 * Both are plain JS numbers (IEEE754 double) — no bignum/decimal library involved. The point of
 * the demo is to make the *existing* precision loss of float64 visible, and to show how far a
 * compensated running sum can push that loss back, not to introduce arbitrary precision math.
 */

export type SummationTrace = {
  /** Running value after each input, using plain float64 addition. */
  naiveRunning: number[]
  /** Running *corrected* value after each input (sum + compensation), using Neumaier summation. */
  compensatedRunning: number[]
  /** Running compensation register (the bits naive addition would silently drop). */
  compensationRunning: number[]
}

/** Sequential float64 summation: exactly what `values.reduce((a, b) => a + b, 0)` does. */
export function naiveSum(values: number[]): number {
  let sum = 0
  for (const value of values) {
    sum += value
  }
  return sum
}

/**
 * Neumaier (improved Kahan/Kahan-Babuska) compensated summation.
 * Returns the raw running sum, the separate compensation register, and the corrected total
 * (sum + compensation), matching Balansis' "result + compensation" framing.
 */
export function neumaierSum(values: number[]): { sum: number; compensation: number; corrected: number } {
  let sum = 0
  let compensation = 0

  for (const value of values) {
    const t = sum + value
    if (Math.abs(sum) >= Math.abs(value)) {
      compensation += sum - t + value
    } else {
      compensation += value - t + sum
    }
    sum = t
  }

  return { sum, compensation, corrected: sum + compensation }
}

/**
 * Builds the demo series: `steps` repetitions of a (scale, +1, -scale) triple.
 * In real-number arithmetic the ±scale terms cancel exactly, so the true sum is always
 * exactly `steps`. Sequential float64 addition loses the "+1" the moment `scale` grows past
 * ~2^53 (~9e15), because `scale + 1` rounds straight back down to `scale`.
 */
export function buildCancellationSeries(scale: number, steps: number): number[] {
  const values: number[] = []
  for (let i = 0; i < steps; i += 1) {
    values.push(scale, 1, -scale)
  }
  return values
}

/** Step-by-step trace of both summation strategies over the demo series, for charting. */
export function traceCancellation(scale: number, steps: number): SummationTrace {
  const naiveRunning: number[] = []
  const compensatedRunning: number[] = []
  const compensationRunning: number[] = []

  let naive = 0
  let sum = 0
  let compensation = 0

  for (let i = 0; i < steps; i += 1) {
    const triple = [scale, 1, -scale]
    for (const value of triple) {
      naive += value

      const t = sum + value
      if (Math.abs(sum) >= Math.abs(value)) {
        compensation += sum - t + value
      } else {
        compensation += value - t + sum
      }
      sum = t
    }

    naiveRunning.push(naive)
    compensatedRunning.push(sum + compensation)
    compensationRunning.push(compensation)
  }

  return { naiveRunning, compensatedRunning, compensationRunning }
}
