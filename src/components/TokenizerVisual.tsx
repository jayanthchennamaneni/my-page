import { useEffect, useMemo, useState } from 'react'

type Scheme = 'word' | 'char' | 'bpe'

const PRESETS = [
  { label: 'english', text: 'Unbelievable! The tokenizer splits this quickly.' },
  { label: 'code', text: 'def train(model, data):\n    return model.fit(data)' },
  { label: 'numbers', text: 'In 2024, GPT-4 cost $0.03 per 1000 tokens.' },
  { label: 'hindi', text: 'टोकन भाषा को संख्याओं में बदलते हैं।' },
]

// Words the "word-level" demo vocabulary knows; everything else becomes <UNK>.
const KNOWN_WORDS = new Set([
  'the', 'this', 'a', 'an', 'is', 'are', 'was', 'in', 'on', 'of', 'to', 'and',
  'tokenizer', 'token', 'tokens', 'model', 'data', 'cost', 'per', 'splits',
  'def', 'return', 'train', 'fit',
])

// Pieces for the simplified BPE demo, roughly ordered longest-first at lookup time.
const BPE_PIECES = [
  'unbeliev', 'tokenizer', 'token', 'quickly', 'return', 'per', 'un', 'ing', 'tion',
  'izer', 'able', 'the', 'split', 'splits', 'this', 'def', 'train', 'model', 'data',
  'cost', '2024', '1000', '0.03', 'ed', 'er', 'ly', 's', 're',
]

interface Token {
  text: string
  id: number
  merged: boolean
  unknown: boolean
  whitespace: boolean
}

function whitespaceToken(text: string, id: number): Token {
  return { text, id, merged: false, unknown: false, whitespace: true }
}

function tokenizeWord(text: string, nextId: () => number): Token[] {
  const tokens: Token[] = []
  for (const part of text.split(/(\s+)/)) {
    if (!part) continue
    if (/^\s+$/.test(part)) {
      tokens.push(whitespaceToken(part, nextId()))
      continue
    }
    const known = KNOWN_WORDS.has(part.toLowerCase().replace(/[^a-z]/g, ''))
    tokens.push({
      text: known ? part : '<UNK>',
      id: nextId(),
      merged: false,
      unknown: !known,
      whitespace: false,
    })
  }
  return tokens
}

function tokenizeChar(text: string, nextId: () => number): Token[] {
  return [...text].map((ch) =>
    /\s/.test(ch)
      ? whitespaceToken(ch, nextId())
      : { text: ch, id: nextId(), merged: false, unknown: false, whitespace: false },
  )
}

/** Simplified BPE: longest known piece wins; otherwise fall back to single characters. */
function tokenizeBPE(text: string, nextId: () => number): Token[] {
  const pieces = [...BPE_PIECES].sort((a, b) => b.length - a.length)
  const tokens: Token[] = []
  let i = 0
  while (i < text.length) {
    if (/\s/.test(text[i])) {
      let j = i
      while (j < text.length && /\s/.test(text[j])) j++
      tokens.push(whitespaceToken(text.slice(i, j), nextId()))
      i = j
      continue
    }
    const rest = text.slice(i).toLowerCase()
    const match = pieces.find((piece) => rest.startsWith(piece))
    if (match) {
      tokens.push({ text: text.slice(i, i + match.length), id: nextId(), merged: match.length > 1, unknown: false, whitespace: false })
      i += match.length
    } else {
      tokens.push({ text: text[i], id: nextId(), merged: false, unknown: false, whitespace: false })
      i += 1
    }
  }
  return tokens
}

function tokenize(text: string, scheme: Scheme): Token[] {
  let counter = 48
  const nextId = () => {
    counter += 7
    return counter
  }
  if (scheme === 'word') return tokenizeWord(text, nextId)
  if (scheme === 'char') return tokenizeChar(text, nextId)
  return tokenizeBPE(text, nextId)
}

const SCHEMES: { id: Scheme; label: string; note: string }[] = [
  { id: 'word', label: 'word-level', note: 'short sequences, huge vocabulary, unseen words become <UNK>' },
  { id: 'char', label: 'character', note: 'tiny vocabulary, very long sequences' },
  { id: 'bpe', label: 'bpe subword', note: 'common words stay whole, rare words split into learned pieces' },
]

export default function TokenizerVisual() {
  const [text, setText] = useState(PRESETS[0].text)
  const [scheme, setScheme] = useState<Scheme>('bpe')
  const [revealed, setRevealed] = useState(0)
  const [playing, setPlaying] = useState(true)

  const tokens = useMemo(() => tokenize(text, scheme), [text, scheme])

  // restart the animation whenever the input or scheme changes
  useEffect(() => {
    setRevealed(0)
    setPlaying(true)
  }, [text, scheme])

  useEffect(() => {
    if (!playing) return undefined
    const timer = window.setInterval(() => {
      setRevealed((current) => {
        if (current >= tokens.length) {
          setPlaying(false)
          return current
        }
        return current + 1
      })
    }, 220)
    return () => window.clearInterval(timer)
  }, [playing, tokens.length])

  const visible = tokens.slice(0, revealed)
  const chars = text.length
  const done = revealed >= tokens.length

  return (
    <figure className="tok-visual">
      <div className="tok-input-row">
        <label className="tok-input-label" htmlFor="tokenizer-input">input</label>
        <textarea
          id="tokenizer-input"
          className="tok-input"
          value={text}
          rows={2}
          spellCheck={false}
          onChange={(event) => {
            setText(event.target.value)
            setPlaying(false)
            setRevealed(Number.MAX_SAFE_INTEGER)
          }}
        />
      </div>

      <div className="tok-controls">
        <div className="tok-group" role="group" aria-label="Tokenization scheme">
          <span>scheme</span>
          {SCHEMES.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`tok-toggle${scheme === item.id ? ' is-active' : ''}`}
              onClick={() => setScheme(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="tok-group" role="group" aria-label="Examples">
          <span>examples</span>
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              className={`tok-toggle${text === preset.text ? ' is-active' : ''}`}
              onClick={() => setText(preset.text)}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <p className="tok-note" role="status">
        {SCHEMES.find((item) => item.id === scheme)?.note}
      </p>

      <div className="tok-stage" aria-label="Token stream" aria-live="polite">
        {visible.map((token, index) => {
          const classes = [
            'tok-chip',
            token.whitespace ? 'is-ws' : '',
            token.unknown ? 'is-unk' : '',
            token.merged ? 'is-merged' : '',
          ].filter(Boolean).join(' ')
          return (
            <span className={classes} key={`${index}-${token.text}`}>
              <span className="tok-text">{token.whitespace ? '␣' : token.text}</span>
              <span className="tok-id">{token.id}</span>
            </span>
          )
        })}
        {!done && <span className="tok-cursor" aria-hidden="true" />}
        {!tokens.length && <span className="tok-empty">no input</span>}
      </div>

      <figcaption className="tok-readout">
        <span>tokens {visible.length}{done ? '' : ` / ${tokens.length}`}</span>
        <span>characters {chars}</span>
        <span>vocab {scheme === 'word' ? '~500k, closed' : scheme === 'char' ? '~100 bytes' : '~50k merges'}</span>
      </figcaption>
    </figure>
  )
}
