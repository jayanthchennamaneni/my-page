import { useMemo, useState } from 'react'

// A fixed set of "weights" so the demo is deterministic and easy to follow.
const WEIGHTS = [-0.42, 0.13, 1.87, -1.05, 0.66, 0.08, -1.52, 0.94]

type Mode = 'symmetric' | 'asymmetric'
type Bits = 8 | 4

interface Quantized {
  q: number[]
  scale: number
  zeroPoint: number
  dequantized: number[]
  levels: number
}

function quantize(values: number[], bits: Bits, mode: Mode): Quantized {
  if (mode === 'symmetric') {
    const qmax = 2 ** (bits - 1) - 1
    const scale = Math.max(...values.map(Math.abs)) / qmax || 1
    const q = values.map((x) =>
      Math.max(-qmax, Math.min(qmax, Math.round(x / scale))),
    )
    return {
      q,
      scale,
      zeroPoint: 0,
      dequantized: q.map((v) => v * scale),
      levels: 2 * qmax + 1,
    }
  }
  const min = Math.min(...values)
  const max = Math.max(...values)
  const levels = 2 ** bits - 1
  const scale = (max - min) / levels || 1
  const zeroPoint = Math.round(-min / scale)
  const q = values.map((x) =>
    Math.max(0, Math.min(levels, Math.round(x / scale) + zeroPoint)),
  )
  return { q, scale, zeroPoint, dequantized: q.map((v) => (v - zeroPoint) * scale), levels: levels + 1 }
}

function hintFor(bits: Bits, mode: Mode, maxError: number): string {
  const pct = (maxError / Math.max(...WEIGHTS.map(Math.abs))) * 100
  if (bits === 8) {
    return `8-bit gives 255 possible values, so each weight is stored almost exactly — the largest error is only ${pct.toFixed(1)}% of the biggest weight.`
  }
  return mode === 'symmetric'
    ? `4-bit gives only ${2 ** 3} steps around zero. Every weight is forced onto the nearest step — compare the two bars to see the rounding error.`
    : `4-bit asymmetric stretches the grid to cover the exact min→max range, so the steps land where the data is. The zero point marks where real zero sits.`
}

export default function QuantizationVisual() {
  const [bits, setBits] = useState<Bits>(8)
  const [mode, setMode] = useState<Mode>('symmetric')
  const result = useMemo(() => quantize(WEIGHTS, bits, mode), [bits, mode])

  const maxAbs = Math.max(...WEIGHTS.map(Math.abs))
  const maxError = Math.max(...WEIGHTS.map((x, i) => Math.abs(x - result.dequantized[i])))
  const worstIndex = WEIGHTS.reduce(
    (worst, x, i) => (Math.abs(x - result.dequantized[i]) > Math.abs(x - result.dequantized[worst]) ? i : worst),
    0,
  )

  return (
    <figure className="quant-visual">
      <p className="quant-title">The same eight weights, stored with fewer bits</p>

      <div className="quant-controls">
        <div className="quant-group" role="group" aria-label="Bit width">
          <span>bits</span>
          {([8, 4] as Bits[]).map((b) => (
            <button
              key={b}
              type="button"
              className={`quant-toggle${bits === b ? ' is-active' : ''}`}
              onClick={() => setBits(b)}
            >
              {b}-bit
            </button>
          ))}
        </div>
        <div className="quant-group" role="group" aria-label="Quantization mode">
          <span>mode</span>
          {(['symmetric', 'asymmetric'] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              className={`quant-toggle${mode === m ? ' is-active' : ''}`}
              onClick={() => setMode(m)}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="quant-legend" aria-hidden="true">
        <span className="quant-legend-item"><i className="quant-swatch quant-swatch-original" /> original weight</span>
        <span className="quant-legend-item"><i className="quant-swatch quant-swatch-quantized" /> after quantize → dequantize</span>
        <span className="quant-legend-item quant-legend-worst"><i className="quant-swatch quant-swatch-worst" /> worst rounding error</span>
      </div>

      <div className="quant-chart" role="img" aria-label={`Weights quantized to ${bits}-bit ${mode} values`}>
        {WEIGHTS.map((x, i) => {
          const deq = result.dequantized[i]
          const h = (v: number) => `${(Math.abs(v) / maxAbs) * 100}%`
          const isWorst = i === worstIndex && maxError > 0
          return (
            <div className={`quant-column${isWorst ? ' is-worst' : ''}`} key={i}>
              <span className="quant-value">{x.toFixed(2)}</span>
              <div className="quant-bars">
                <div
                  className="quant-bar quant-bar-original"
                  style={{ height: h(x) }}
                  title={`original ${x.toFixed(4)}`}
                />
                <div
                  className="quant-bar quant-bar-quantized"
                  style={{ height: h(deq) }}
                  title={`after round-trip ${deq.toFixed(4)}`}
                />
              </div>
              <span className="quant-value quant-value-q">{deq.toFixed(2)}</span>
              <span className="quant-int">stored: {result.q[i]}</span>
            </div>
          )
        })}
      </div>

      <p className="quant-hint" role="status">{hintFor(bits, mode, maxError)}</p>

      <figcaption className="quant-readout">
        <span>scale {result.scale.toFixed(4)} — the size of one step</span>
        <span>zero point {result.zeroPoint} — where real 0 lands on the grid</span>
        <span>max error {maxError.toFixed(4)}</span>
      </figcaption>
    </figure>
  )
}
