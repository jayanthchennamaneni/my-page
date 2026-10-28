import type { FigureId } from '../data/content'

const INK = '#1c1714'
const SOFT = '#3e3733'
const MUTED = '#5f5750'
const LINE = '#d6d3d1'
const FAINT = '#eceae8'
const PANEL = '#f5f5f4'
const GREEN = '#008a3d'
const GREEN_SOFT = '#e3f5e9'
const GRAY = '#a8a29e'
const MONO = "'IBM Plex Mono', 'SFMono-Regular', Consolas, monospace"

function FigureFrame({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <figure className="post-figure">
      <span className="post-figure-title">{title}</span>
      <div className="post-figure-scroll">{children}</div>
      {note && <figcaption className="post-figure-note">{note}</figcaption>}
    </figure>
  )
}

function DecisionLoopFigure() {
  return (
    <FigureFrame
      title="on-device decision loop"
      note="The state enters the model on the device; one forward pass returns every answer, and a threshold turns probabilities into action. Fine-tuning supplies new weights."
    >
      <svg viewBox="0 44 880 200" role="img" aria-label="Input state goes to d1-2B on the device, which returns probabilities that become an action; fine-tuning supplies new weights.">
        <defs>
          <marker id="fig-loop-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill={MUTED} />
          </marker>
          <marker id="fig-loop-arrow-gray" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill={GRAY} />
          </marker>
        </defs>

        <rect x="20" y="64" width="160" height="88" rx="10" fill={PANEL} stroke={LINE} />
        <text x="36" y="92" fontSize="13" fontWeight="600" fill={INK}>Input state</text>
        <text x="36" y="114" fontSize="12" fill={MUTED}>text · photo</text>
        <text x="36" y="133" fontSize="12" fill={MUTED}>JSON · audio</text>

        <rect x="240" y="64" width="185" height="88" rx="10" fill={GREEN_SOFT} stroke={GREEN} strokeWidth="1.6" />
        <text x="256" y="92" fontSize="13" fontWeight="600" fill={INK}>d1-2B, on device</text>
        <text x="256" y="114" fontSize="12" fill={MUTED}>4-bit · ~1 GB file</text>
        <text x="256" y="133" fontSize="12" fill={MUTED}>one forward pass</text>

        <rect x="485" y="64" width="175" height="88" rx="10" fill={PANEL} stroke={LINE} />
        <text x="499" y="92" fontSize="13" fontWeight="600" fill={INK}>Probabilities</text>
        <text x="499" y="114" fontSize="11.5" fill={MUTED}>yes/no · choice · score</text>
        <text x="499" y="133" fontSize="11.5" fill={MUTED}>calibrated, 0…1</text>

        <rect x="720" y="64" width="140" height="88" rx="10" fill={PANEL} stroke={LINE} />
        <text x="734" y="92" fontSize="13" fontWeight="600" fill={INK}>Action</text>
        <text x="734" y="114" fontSize="11.5" fill={MUTED}>act · send ·</text>
        <text x="734" y="133" fontSize="11.5" fill={MUTED}>ask a human</text>

        <line x1="184" y1="108" x2="234" y2="108" stroke={MUTED} strokeWidth="1.8" markerEnd="url(#fig-loop-arrow)" />
        <line x1="429" y1="108" x2="479" y2="108" stroke={MUTED} strokeWidth="1.8" markerEnd="url(#fig-loop-arrow)" />
        <line x1="664" y1="108" x2="714" y2="108" stroke={MUTED} strokeWidth="1.8" markerEnd="url(#fig-loop-arrow)" />

        <rect x="330" y="196" width="220" height="38" rx="8" fill="none" stroke={GRAY} strokeDasharray="5 4" />
        <text x="440" y="219" textAnchor="middle" fontSize="11.5" fill={MUTED}>fine-tune → new weights</text>
        <line x1="440" y1="194" x2="440" y2="160" stroke={GRAY} strokeWidth="1.8" strokeDasharray="5 4" markerEnd="url(#fig-loop-arrow-gray)" />
      </svg>
    </FigureFrame>
  )
}

function EdgeLimitsFigure() {
  const panels = [
    { x: 25, title: 'RAM', lines: ['model + runtime', 'must fit at once'] },
    { x: 222, title: 'Storage', lines: ['weights in flash;', 'updates need room'] },
    { x: 419, title: 'Energy', lines: ['small battery,', 'no cooling headroom'] },
    { x: 616, title: 'Response time', lines: ['the answer must come', 'before the wait'] },
  ]
  return (
    <FigureFrame title="the four limits of an edge device">
      <svg viewBox="0 12 800 148" role="img" aria-label="Four limits: RAM, storage, energy, response time.">
        {panels.map((p) => (
          <g key={p.title}>
            <rect x={p.x} y="28" width="170" height="118" rx="10" fill={PANEL} stroke={LINE} />
            <text x={p.x + 85} y="62" textAnchor="middle" fontSize="14" fontWeight="600" fill={INK}>{p.title}</text>
            <text x={p.x + 17} y="96" fontSize="12" fill={MUTED}>{p.lines[0]}</text>
            <text x={p.x + 17} y="116" fontSize="12" fill={MUTED}>{p.lines[1]}</text>
          </g>
        ))}
      </svg>
    </FigureFrame>
  )
}

function ParamsScoreFigure() {
  return (
    <FigureFrame
      title="fewer parameters, better score"
      note="ImajevBench: d1-2B scores 75.5 against d1-3B at 64.0 — with about a third fewer parameters. Source: Liquid AI, October 2026."
    >
      <svg viewBox="0 22 800 270" role="img" aria-label="Chart of benchmark score against parameter count: d1-2B at 2 billion parameters scores 75.5, beating d1-3B at 3 billion parameters with 64.0.">
        <defs>
          <marker id="fig-score-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill={GRAY} />
          </marker>
        </defs>

        <text x="120" y="36" fontFamily={MONO} fontSize="9.5" fill={GRAY}>SCORE ↑</text>

        <line x1="120" y1="210" x2="740" y2="210" stroke={FAINT} />
        <line x1="120" y1="170" x2="740" y2="170" stroke={FAINT} />
        <line x1="120" y1="130" x2="740" y2="130" stroke={FAINT} />
        <line x1="120" y1="90" x2="740" y2="90" stroke={FAINT} />
        <line x1="120" y1="50" x2="740" y2="50" stroke={FAINT} />

        <line x1="120" y1="250" x2="740" y2="250" stroke={LINE} strokeWidth="1.5" />
        <line x1="120" y1="250" x2="120" y2="50" stroke={LINE} strokeWidth="1.5" />

        <text x="108" y="254" textAnchor="end" fontSize="11" fill={GRAY}>55</text>
        <text x="108" y="214" textAnchor="end" fontSize="11" fill={GRAY}>60</text>
        <text x="108" y="174" textAnchor="end" fontSize="11" fill={GRAY}>65</text>
        <text x="108" y="134" textAnchor="end" fontSize="11" fill={GRAY}>70</text>
        <text x="108" y="94" textAnchor="end" fontSize="11" fill={GRAY}>75</text>
        <text x="108" y="54" textAnchor="end" fontSize="11" fill={GRAY}>80</text>

        <line x1="430" y1="86" x2="585" y2="178" stroke={GRAY} strokeWidth="1.5" strokeDasharray="4 4" markerEnd="url(#fig-score-arrow)" />
        <text x="556" y="112" fontSize="11.5" fill={MUTED}>−33% params · +11.5 pts</text>

        <circle cx="585" cy="178" r="8" fill={LINE} stroke={MUTED} strokeWidth="1.5" />
        <text x="600" y="202" fontSize="12" fill={SOFT}>d1-3B · older</text>

        <circle cx="430" cy="86" r="10" fill={GREEN} />
        <text x="430" y="64" textAnchor="middle" fontSize="13" fontWeight="600" fill={INK}>d1-2B · new</text>

        <text x="430" y="284" textAnchor="middle" fontFamily={MONO} fontSize="9.5" fill={GRAY}>PARAMETERS (BILLIONS) →</text>
      </svg>
    </FigureFrame>
  )
}

function DeployPipelineFigure() {
  const boxes = [
    { x: 10, title: '1 · Fine-tune', emphasized: false, lines: ['your data, one GPU'] },
    { x: 220, title: '2 · Export 4-bit', emphasized: false, lines: ['Q4 GGUF,', '~1 GB file'] },
    { x: 430, title: '3 · Test on device', emphasized: true, lines: ['llama.cpp · Ollama', 'MLX · RAM · energy'] },
    { x: 640, title: '4 · Ship + watch', emphasized: false, lines: ['log low-confidence', 'cases'] },
  ]
  return (
    <FigureFrame
      title="the deployment pipeline"
      note="One GPU for tuning, a 4-bit export for the device, measurement on real hardware, and a loop that feeds edge cases back into fine-tuning."
    >
      <svg viewBox="0 30 800 185" role="img" aria-label="Pipeline: fine-tune on one GPU, export 4-bit weights, test on device, ship and watch, with edge cases fed back to fine-tuning.">
        <defs>
          <marker id="fig-pipe-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill={MUTED} />
          </marker>
        </defs>

        {boxes.map((b) => (
          <g key={b.title}>
            <rect
              x={b.x} y="48" width="168" height="90" rx="10"
              fill={b.emphasized ? GREEN_SOFT : PANEL}
              stroke={b.emphasized ? GREEN : LINE}
              strokeWidth={b.emphasized ? 1.6 : 1}
            />
            <text x={b.x + 15} y="76" fontSize="13" fontWeight="600" fill={INK}>{b.title}</text>
            {b.lines.map((line, i) => (
              <text key={line} x={b.x + 15} y={98 + i * 19} fontSize="11.5" fill={MUTED}>{line}</text>
            ))}
          </g>
        ))}

        <line x1="182" y1="93" x2="214" y2="93" stroke={MUTED} strokeWidth="1.8" markerEnd="url(#fig-pipe-arrow)" />
        <line x1="392" y1="93" x2="424" y2="93" stroke={MUTED} strokeWidth="1.8" markerEnd="url(#fig-pipe-arrow)" />
        <line x1="602" y1="93" x2="634" y2="93" stroke={MUTED} strokeWidth="1.8" markerEnd="url(#fig-pipe-arrow)" />

        <path d="M 724 142 L 724 192 L 94 192 L 94 147" fill="none" stroke={GRAY} strokeWidth="1.8" strokeDasharray="5 4" markerEnd="url(#fig-pipe-arrow)" />
        <text x="409" y="209" textAnchor="middle" fontSize="11" fill={MUTED}>edge cases back to fine-tuning</text>
      </svg>
    </FigureFrame>
  )
}

const figures: Record<FigureId, () => React.ReactNode> = {
  'decision-loop': DecisionLoopFigure,
  'edge-limits': EdgeLimitsFigure,
  'params-score': ParamsScoreFigure,
  'deploy-pipeline': DeployPipelineFigure,
}

export default function PostFigure({ id }: { id: FigureId }) {
  const Figure = figures[id]
  return <Figure />
}
