/**
 * FakeTensor — a small engine mirroring PyTorch's tensor metadata semantics.
 *
 * A tensor is a view over a 1D storage plus four pieces of metadata:
 *   storageId — which underlying buffer the data lives in
 *   shape     — logical dimensions
 *   strides   — how many storage slots to jump per axis increment
 *   offset    — where this view starts inside the storage
 *
 * Every operation recomputes shape/strides/offset and sometimes swaps the
 * storageId. Copy-vs-view is therefore a pure data question, which the UI
 * computes by diffing before/after state.
 *
 * Row-major (C-contiguous) layout is assumed throughout, matching PyTorch's
 * default. Strides are in elements, not bytes.
 */

export interface TensorState {
  storageId: number
  data: number[]
  shape: number[]
  strides: number[]
  offset: number
}

export interface FlatCell {
  /** index into the storage array */
  flat: number
  /** value stored there, or NaN for out-of-storage padding slots */
  value: number
  /** true when this slot belongs to the tensor's view */
  inView: boolean
}

let nextStorageId = 1

function computeStrides(shape: number[]): number[] {
  const strides = new Array<number>(shape.length)
  let acc = 1
  for (let i = shape.length - 1; i >= 0; i--) {
    strides[i] = acc
    acc *= shape[i]
  }
  return strides
}

function numel(shape: number[]): number {
  return shape.reduce((acc, dim) => acc * dim, 1)
}

/** Indices for iterating a shape in row-major order. */
export function rowMajorIndices(shape: number[]): number[][] {
  if (shape.length === 0) return [[]]
  const out: number[][] = []
  const total = numel(shape)
  const idx = new Array<number>(shape.length).fill(0)
  for (let n = 0; n < total; n++) {
    out.push([...idx])
    // increment like an odometer, last axis fastest
    for (let d = shape.length - 1; d >= 0; d--) {
      idx[d] += 1
      if (idx[d] < shape[d]) break
      idx[d] = 0
    }
  }
  return out
}

export function flatIndex(state: TensorState, idx: number[]): number {
  let flat = state.offset
  for (let d = 0; d < idx.length; d++) {
    flat += idx[d] * state.strides[d]
  }
  return flat
}

/** Cells of a state in row-major logical order: grid position → storage position. */
export function cellsOf(state: TensorState): { idx: number[]; flat: number; value: number }[] {
  return rowMajorIndices(state.shape).map((idx) => {
    const flat = flatIndex(state, idx)
    return { idx, flat, value: state.data[flat] }
  })
}

export class FakeTensor {
  private state: TensorState

  private constructor(state: TensorState) {
    this.state = state
  }

  /** Create a fresh contiguous tensor from row-major data. */
  static create(data: number[], shape: number[]): FakeTensor {
    if (numel(shape) !== data.length) {
      throw new Error(`shape ${JSON.stringify(shape)} expects ${numel(shape)} values, got ${data.length}`)
    }
    const storageId = nextStorageId++
    return new FakeTensor({
      storageId,
      data: [...data],
      shape: [...shape],
      strides: computeStrides(shape),
      offset: 0,
    })
  }

  /** Internal: wrap a new state without touching the storage counter. */
  private wrap(state: TensorState): FakeTensor {
    return new FakeTensor(state)
  }

  /** Current immutable snapshot of the metadata + data. */
  snapshot(): TensorState {
    return {
      storageId: this.state.storageId,
      data: [...this.state.data],
      shape: [...this.state.shape],
      strides: [...this.state.strides],
      offset: this.state.offset,
    }
  }

  get shape(): number[] {
    return [...this.state.shape]
  }

  get strides(): number[] {
    return [...this.state.strides]
  }

  get offset(): number {
    return this.state.offset
  }

  get storageId(): number {
    return this.state.storageId
  }

  /** Read the logical value at multi-dimensional indices. */
  get(...idx: number[]): number {
    if (idx.length !== this.state.shape.length) {
      throw new Error(`expected ${this.state.shape.length} indices, got ${idx.length}`)
    }
    return this.state.data[flatIndex(this.state, idx)]
  }

  isContiguous(): boolean {
    return this.state.strides.join(',') === computeStrides(this.state.shape).join(',')
  }

  /** Number of storage slots this view touches. */
  span(): number {
    if (!this.state.shape.length) return 1
    let max = 0
    for (const idx of rowMajorIndices(this.state.shape)) {
      max = Math.max(max, flatIndex(this.state, idx) - this.state.offset + 1)
    }
    return max
  }

  /** Cells of this view in row-major logical order, with their storage positions. */
  cells(): { idx: number[]; flat: number; value: number }[] {
    return cellsOf(this.state)
  }

  /**
   * The storage buffer as rendered slots. Slots outside the view range are
   * padded with NaN so the strip can show "allocated but not owned".
   */
  storageCells(): FlatCell[] {
    const start = this.state.offset
    const end = start + this.span()
    const cells: FlatCell[] = []
    for (let flat = 0; flat < end; flat++) {
      cells.push({
        flat,
        value: this.state.data[flat],
        inView: flat >= start && flat < end,
      })
    }
    return cells
  }

  /** Row-major read of the view into a flat array (what flatten() returns). */
  toArray(): number[] {
    return this.cells().map((cell) => cell.value)
  }

  // --- operations ---------------------------------------------------------

  /**
   * Reinterpret the same storage with a new shape. Only possible when the
   * current layout is contiguous — otherwise the flat read order does not
   * match the storage order and PyTorch refuses.
   */
  view(shape: number[]): FakeTensor {
    if (numel(shape) !== numel(this.state.shape)) {
      throw new Error(`view: shape ${JSON.stringify(shape)} has ${numel(shape)} elements, tensor has ${numel(this.state.shape)}`)
    }
    if (!this.isContiguous()) {
      throw new Error(
        `view: size changes are not allowed on a non-contiguous tensor (strides ${JSON.stringify(this.state.strides)}). Use reshape or .contiguous().view(...)`,
      )
    }
    return this.wrap({
      ...this.state,
      shape: [...shape],
      strides: computeStrides(shape),
    })
  }

  /** Like view, but falls back to a copy when the layout is incompatible. */
  reshape(shape: number[]): FakeTensor {
    if (numel(shape) !== numel(this.state.shape)) {
      throw new Error(`reshape: shape ${JSON.stringify(shape)} has ${numel(shape)} elements, tensor has ${numel(this.state.shape)}`)
    }
    if (this.isContiguous()) {
      return this.view(shape)
    }
    return this.contiguous().view(shape)
  }

  /** Swap two dimensions — strides swap, storage untouched. */
  transpose(dim0: number, dim1: number): FakeTensor {
    const rank = this.state.shape.length
    const normalize = (d: number) => {
      const n = d < 0 ? d + rank : d
      if (n < 0 || n >= rank) throw new Error(`transpose: dim ${d} out of range for rank ${rank}`)
      return n
    }
    const a = normalize(dim0)
    const b = normalize(dim1)
    const shape = [...this.state.shape]
    const strides = [...this.state.strides]
    ;[shape[a], shape[b]] = [shape[b], shape[a]]
    ;[strides[a], strides[b]] = [strides[b], strides[a]]
    return this.wrap({ ...this.state, shape, strides })
  }

  /** Rearrange all dimensions. dims is a permutation of 0..rank-1. */
  permute(dims: number[]): FakeTensor {
    const rank = this.state.shape.length
    if (dims.length !== rank) throw new Error(`permute: expected ${rank} dims, got ${dims.length}`)
    const seen = new Set<number>()
    const shape: number[] = []
    const strides: number[] = []
    for (const d of dims) {
      const n = d < 0 ? d + rank : d
      if (n < 0 || n >= rank || seen.has(n)) throw new Error(`permute: dims ${JSON.stringify(dims)} is not a permutation of 0..${rank - 1}`)
      seen.add(n)
      shape.push(this.state.shape[n])
      strides.push(this.state.strides[n])
    }
    return this.wrap({ ...this.state, shape, strides })
  }

  /** No-op when already contiguous; otherwise copies into fresh row-major storage. */
  contiguous(): FakeTensor {
    if (this.isContiguous()) return this.wrap({ ...this.state })
    const data = this.toArray()
    const storageId = nextStorageId++
    return new FakeTensor({
      storageId,
      data,
      shape: [...this.state.shape],
      strides: computeStrides(this.state.shape),
      offset: 0,
    })
  }

  /** New storage, same logical content (and same strides). */
  clone(): FakeTensor {
    const storageId = nextStorageId++
    // clone materializes just the view's slots into a fresh packed buffer
    const data = this.toArray()
    return new FakeTensor({
      storageId,
      data,
      shape: [...this.state.shape],
      strides: this.isContiguous() ? [...this.state.strides] : computeStrides(this.state.shape),
      offset: 0,
    })
  }

  /**
   * Autograd bookkeeping only — metadata identical, storage shared.
   * The grad-tracking flag is conceptual here; the engine has no autograd.
   */
  detach(): FakeTensor {
    return this.wrap({ ...this.state })
  }

  /** Overwrite this tensor's storage with the values of another view, in place. */
  copy_(other: FakeTensor): this {
    if (numel(other.shape) !== numel(this.state.shape)) {
      throw new Error(`copy_: shape mismatch ${JSON.stringify(other.shape)} vs ${JSON.stringify(this.state.shape)}`)
    }
    const values = other.toArray()
    const cells = this.cells()
    cells.forEach((cell, i) => {
      this.state.data[cell.flat] = values[i]
    })
    return this
  }

  /** Slice with [start, end) ranges per dimension (null = keep all). Same storage. */
  slice(ranges: (readonly [number, number] | null)[]): FakeTensor {
    const rank = this.state.shape.length
    if (ranges.length !== rank) throw new Error(`slice: expected ${rank} ranges, got ${ranges.length}`)
    const shape: number[] = []
    const strides: number[] = []
    let offset = this.state.offset
    for (let d = 0; d < rank; d++) {
      const range = ranges[d]
      if (!range) {
        shape.push(this.state.shape[d])
        strides.push(this.state.strides[d])
        continue
      }
      const [start, end] = range
      const size = this.state.shape[d]
      const s = Math.max(0, Math.min(start, size))
      const e = Math.max(s, Math.min(end, size))
      shape.push(e - s)
      strides.push(this.state.strides[d])
      offset += s * this.state.strides[d]
    }
    return this.wrap({ ...this.state, shape, strides, offset })
  }

  /**
   * Broadcast a dimension of size 1 to `size` by setting its stride to 0 —
   * many logical positions, one storage slot. null dims are left untouched.
   */
  expand(sizes: (number | null)[]): FakeTensor {
    const rank = this.state.shape.length
    if (sizes.length !== rank) throw new Error(`expand: expected ${rank} sizes, got ${sizes.length}`)
    const shape: number[] = []
    const strides: number[] = []
    for (let d = 0; d < rank; d++) {
      const size = sizes[d]
      if (size === null) {
        shape.push(this.state.shape[d])
        strides.push(this.state.strides[d])
        continue
      }
      if (this.state.shape[d] === 1) {
        shape.push(size)
        strides.push(0)
      } else if (this.state.shape[d] === size) {
        shape.push(size)
        strides.push(this.state.strides[d])
      } else {
        throw new Error(`expand: cannot expand dim ${d} of size ${this.state.shape[d]} to ${size}`)
      }
    }
    return this.wrap({ ...this.state, shape, strides })
  }
}
