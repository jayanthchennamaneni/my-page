import { useEffect, useMemo, useState } from 'react'

export type TreeMode = 'b-tree' | 'b-plus-tree'

const INSERT_SEQUENCE = [7, 19, 31, 43, 58, 67, 82, 12, 25, 49, 91, 3, 55, 74]
const MAX_KEYS = 3

interface SnapshotNode {
  id: string
  keys: number[]
  children: SnapshotNode[]
}

interface TreeStep {
  root: SnapshotNode | null
  currentKey: number | null
  usedKeys: number[]
  promotedKey: number | null
  /** node ids visited during the descent for the current insertion */
  activePath: string[]
  /** node that currently holds too many keys */
  overflowId: string | null
  /** node that just absorbed a promoted key (animation target) */
  splitReceiverId: string | null
  explanation: string
}

let idCounter = 0
function newNode(): SnapshotNode {
  return { id: `n${idCounter++}`, keys: [], children: [] }
}

function clone(node: SnapshotNode): SnapshotNode {
  return { id: node.id, keys: [...node.keys], children: node.children.map(clone) }
}

function isLeaf(node: SnapshotNode): boolean {
  return node.children.length === 0
}

function childIndex(node: SnapshotNode, key: number): number {
  let i = 0
  while (i < node.keys.length && key >= node.keys[i]) i++
  return i
}

function insertSorted(node: SnapshotNode, key: number) {
  node.keys.push(key)
  node.keys.sort((a, b) => a - b)
}

/**
 * Simulates key-by-key insertion and records one snapshot per step:
 * an insert step, plus a split step whenever a node overflows.
 * B-Tree: on overflow the median key moves up; records live everywhere.
 * B+ Tree: on leaf overflow the separator is copied up; records stay in leaves.
 */
function simulate(mode: TreeMode, sequence: number[]): TreeStep[] {
  idCounter = 0
  let root: SnapshotNode | null = null
  const steps: TreeStep[] = []
  const usedKeys: number[] = []

  steps.push({
    root: null, currentKey: null, usedKeys: [], promotedKey: null,
    activePath: [], overflowId: null, splitReceiverId: null,
    explanation: mode === 'b-plus-tree'
      ? 'The tree starts empty. Records live in the leaves; internal nodes only hold separator keys that guide searches. Each node holds at most 3 keys.'
      : 'The tree starts empty. Each node holds at most 3 keys; when a 4th key arrives, the node splits and its median key moves up.',
  })

  for (const key of sequence) {
    usedKeys.push(key)

    if (!root) {
      root = newNode()
      root.keys.push(key)
      steps.push({
        root: clone(root), currentKey: key, usedKeys: [...usedKeys], promotedKey: null,
        activePath: [root.id], overflowId: null, splitReceiverId: null,
        explanation: `Insert ${key} into the empty root. It becomes the first ${mode === 'b-plus-tree' ? 'record in the first leaf' : 'key in the root'}.`,
      })
      continue
    }

    // descend to a leaf, recording the visited path
    const stack: { node: SnapshotNode; idx: number }[] = []
    let node: SnapshotNode = root
    while (!isLeaf(node)) {
      const idx = childIndex(node, key)
      stack.push({ node, idx })
      node = node.children[idx]
    }
    insertSorted(node, key)
    const overflow = node.keys.length > MAX_KEYS
    steps.push({
      root: clone(root), currentKey: key, usedKeys: [...usedKeys], promotedKey: null,
      activePath: [root.id, ...stack.map((entry) => entry.node.id), node.id],
      overflowId: overflow ? node.id : null, splitReceiverId: null,
      explanation: overflow
        ? `Insert ${key}. It lands in leaf [${node.keys.join(', ')}], which now overflows the 3-key limit, so it must split.`
        : `Insert ${key}. It follows the separators down and joins leaf [${node.keys.join(', ')}].`,
    })

    // split and propagate up the recorded path
    let cur: SnapshotNode = node
    while (cur.keys.length > MAX_KEYS) {
      const keys = cur.keys
      const leafSplit = cur.children.length === 0
      let promoted: number
      let leftKeys: number[]
      let rightKeys: number[]
      let leftChildCount: number
      if (mode === 'b-plus-tree') {
        promoted = keys[2]
        leftKeys = leafSplit ? keys.slice(0, 3) : keys.slice(0, 2)
        rightKeys = keys.slice(3)
      } else {
        promoted = keys[1]
        leftKeys = keys.slice(0, 1)
        rightKeys = keys.slice(2)
      }
      leftChildCount = leafSplit ? 0 : leftKeys.length + 1

      const left: SnapshotNode = { id: newNode().id, keys: leftKeys, children: cur.children.slice(0, leftChildCount) }
      const right: SnapshotNode = { id: newNode().id, keys: rightKeys, children: cur.children.slice(leftChildCount) }

      let receiver: SnapshotNode
      if (cur === root) {
        receiver = { id: newNode().id, keys: [promoted], children: [left, right] }
        root = receiver
      } else {
        const parentEntry = stack.pop()
        if (!parentEntry) break
        receiver = parentEntry.node
        insertSorted(receiver, promoted)
        receiver.children.splice(parentEntry.idx, 1, left, right)
      }

      steps.push({
        root: clone(root), currentKey: key, usedKeys: [...usedKeys], promotedKey: promoted,
        activePath: [], overflowId: null, splitReceiverId: receiver.id,
        explanation: leafSplit
          ? mode === 'b-plus-tree'
            ? `The full leaf splits. ${promoted} is copied up as a separator; the records stay in leaves [${leftKeys.join(', ')}] and [${rightKeys.join(', ')}].`
            : `The full node splits at median ${promoted}: ${promoted} moves up, leaving [${leftKeys.join(', ')}] and [${rightKeys.join(', ')}] as siblings.`
          : `The internal node [${keys.join(', ')}] splits. ${promoted} moves up; its children are divided between [${leftKeys.join(', ')}] and [${rightKeys.join(', ')}].`,
      })

      cur = receiver
    }
  }

  return steps
}

function TreeNode({ node, step }: { node: SnapshotNode; step: TreeStep }) {
  const classes: string[] = []
  if (step.activePath.includes(node.id)) classes.push('is-path')
  if (node.id === step.overflowId) classes.push('is-overflow')
  if (node.id === step.splitReceiverId) classes.push('is-split')
  return (
    <div className={`explorer-node${classes.length ? ` ${classes.join(' ')}` : ''}`}>
      {node.keys.length ? node.keys.join(' | ') : 'empty'}
    </div>
  )
}

function KeyRail({ step }: { step: TreeStep }) {
  return (
    <ul className="explorer-key-rail" aria-hidden="true">
      {INSERT_SEQUENCE.map((key) => {
        const isCurrent = key === step.currentKey
        const isPromoted = key === step.promotedKey
        const isDone = step.usedKeys.includes(key)
        const className = [
          isCurrent ? 'is-current' : '',
          isPromoted ? 'is-promoted' : '',
          !isCurrent && !isPromoted && isDone ? 'is-done' : '',
        ].filter(Boolean).join(' ')

        return (
          <li key={key} className={className}>
            {key}{isPromoted ? ' ↑' : isCurrent ? ' ·' : ''}
          </li>
        )
      })}
    </ul>
  )
}

function Branch({ node, step, mode }: { node: SnapshotNode; step: TreeStep; mode: TreeMode }) {
  const hasChildren = node.children.length > 0

  return (
    <div className="explorer-branch">
      <TreeNode node={node} step={step} />
      {hasChildren && (
        <>
          <span className="explorer-stem" aria-hidden="true" />
          <div className="explorer-edges">
            {node.children.map((child) => (
              <span
                key={child.id}
                className={`explorer-edge${step.activePath.includes(child.id) ? ' is-active' : ''}`}
              />
            ))}
          </div>
          <div className="explorer-children">
            {node.children.map((child, index) => {
              const childIsLeaf = isLeaf(child)
              const nextIsLeafSibling =
                mode === 'b-plus-tree' &&
                childIsLeaf &&
                index < node.children.length - 1 &&
                isLeaf(node.children[index + 1])
              return (
                <span className="explorer-child-group" key={child.id}>
                  <Branch node={child} step={step} mode={mode} />
                  {nextIsLeafSibling && <span className="explorer-leaf-link" aria-hidden="true">→</span>}
                </span>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

function ExplorerDiagram({ mode, step }: { mode: TreeMode; step: TreeStep }) {
  const isEmpty = !step.root
  return (
    <div className="explorer-diagram" aria-hidden="true">
      {isEmpty || !step.root ? (
        <div className="explorer-single-row is-empty">
          <div className="explorer-node">empty</div>
        </div>
      ) : (
        <Branch node={step.root} step={step} mode={mode} />
      )}
    </div>
  )
}

export default function BTreeVisual({ mode }: { mode: TreeMode }) {
  const [stepIndex, setStepIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const steps = useMemo(() => simulate(mode, INSERT_SEQUENCE), [mode])
  const step = steps[stepIndex]
  const label = mode === 'b-tree' ? 'B-Tree' : 'B+ Tree'

  useEffect(() => {
    if (!playing) return undefined
    const timer = window.setInterval(() => {
      setStepIndex((current) => {
        if (current >= steps.length - 1) {
          setPlaying(false)
          return current
        }
        return current + 1
      })
    }, 1100)
    return () => window.clearInterval(timer)
  }, [playing, steps.length])

  useEffect(() => {
    setStepIndex(0)
    setPlaying(false)
  }, [mode])

  function previous() {
    setPlaying(false)
    setStepIndex((current) => Math.max(0, current - 1))
  }

  function next() {
    setPlaying(false)
    setStepIndex((current) => Math.min(steps.length - 1, current + 1))
  }

  function reset() {
    setPlaying(false)
    setStepIndex(0)
  }

  return (
    <div className="tree-explorer" aria-label={`${label} insertion animation`}>
      <div className="explorer-toolbar">
        <span className="explorer-tree-label">{label}</span>
        <span className="explorer-limit">max {MAX_KEYS} keys / node</span>
        <span className="explorer-progress">step {stepIndex + 1} / {steps.length}</span>
      </div>

      <div className={`explorer-stage${step.overflowId ? ' has-overflow' : ''}`}>
        <KeyRail step={step} />
        <ExplorerDiagram mode={mode} step={step} />
        <p className="explorer-explanation">{step.explanation}</p>
        <p className="visually-hidden" role="status">{`${label}: ${step.explanation}`}</p>
      </div>

      <div className="explorer-controls" aria-label="Animation controls">
        <button type="button" onClick={reset}>Reset</button>
        <button type="button" onClick={previous} disabled={stepIndex === 0}>← Previous</button>
        <button className="explorer-play" type="button" onClick={() => setPlaying((current) => !current)}>
          {playing ? 'Pause' : 'Play'}
        </button>
        <button type="button" onClick={next} disabled={stepIndex === steps.length - 1}>Next →</button>
      </div>
    </div>
  )
}
