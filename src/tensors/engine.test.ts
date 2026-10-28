import { describe, expect, it } from 'vitest'
import { FakeTensor } from './engine'

describe('FakeTensor.create', () => {
  it('computes row-major strides for a 2D tensor', () => {
    const t = FakeTensor.create([1, 2, 3, 4, 5, 6], [2, 3])
    expect(t.strides).toEqual([3, 1])
    expect(t.shape).toEqual([2, 3])
    expect(t.storageId).toBe(1)
    expect(t.offset).toBe(0)
  })

  it('computes row-major strides for a 3D tensor', () => {
    const t = FakeTensor.create([0, 1, 2, 3, 4, 5, 6, 7], [2, 2, 2])
    expect(t.strides).toEqual([4, 2, 1])
  })

  it('rejects data that does not match the shape', () => {
    expect(() => FakeTensor.create([1, 2, 3], [2, 2])).toThrow()
  })
})

describe('basic reads', () => {
  it('reads logical values through the stride formula', () => {
    const t = FakeTensor.create([1, 2, 3, 4, 5, 6], [2, 3])
    expect(t.get(0, 0)).toBe(1)
    expect(t.get(0, 2)).toBe(3)
    expect(t.get(1, 0)).toBe(4)
    expect(t.get(1, 2)).toBe(6)
  })

  it('toArray returns row-major read order', () => {
    const t = FakeTensor.create([1, 2, 3, 4, 5, 6], [2, 3])
    expect(t.toArray()).toEqual([1, 2, 3, 4, 5, 6])
  })

  it('reports contiguity for fresh tensors', () => {
    const t = FakeTensor.create([1, 2, 3, 4, 5, 6], [2, 3])
    expect(t.isContiguous()).toBe(true)
  })
})

describe('transpose', () => {
  it('swaps shape and strides without touching storage', () => {
    const t = FakeTensor.create([1, 2, 3, 4, 5, 6], [2, 3])
    const before = t.snapshot()
    const tt = t.transpose(0, 1)

    expect(tt.shape).toEqual([3, 2])
    expect(tt.strides).toEqual([1, 3])
    expect(tt.storageId).toBe(before.storageId)
    expect(tt.offset).toBe(before.offset)
    expect(tt.isContiguous()).toBe(false)
  })

  it('reads through swapped strides correctly', () => {
    const t = FakeTensor.create([1, 2, 3, 4, 5, 6], [2, 3])
    const tt = t.transpose(0, 1)
    // transposed grid: [[1, 4], [2, 5], [3, 6]]
    expect(tt.get(0, 0)).toBe(1)
    expect(tt.get(1, 0)).toBe(2)
    expect(tt.get(0, 1)).toBe(4)
    expect(tt.get(2, 1)).toBe(6)
  })

  it('toArray shows the zig-zag read order', () => {
    const t = FakeTensor.create([1, 2, 3, 4, 5, 6], [2, 3])
    expect(t.transpose(0, 1).toArray()).toEqual([1, 4, 2, 5, 3, 6])
  })

  it('double transpose returns to contiguous', () => {
    const t = FakeTensor.create([1, 2, 3, 4, 5, 6], [2, 3])
    expect(t.transpose(0, 1).transpose(0, 1).isContiguous()).toBe(true)
  })

  it('accepts negative dims like PyTorch', () => {
    const t = FakeTensor.create([1, 2, 3, 4, 5, 6], [2, 3])
    expect(t.transpose(-1, -2).shape).toEqual([3, 2])
  })
})

describe('permute', () => {
  it('reorders dims of a 3D tensor, sharing storage', () => {
    const t = FakeTensor.create([0, 1, 2, 3, 4, 5, 6, 7], [2, 2, 2])
    const p = t.permute([2, 0, 1])
    expect(p.shape).toEqual([2, 2, 2])
    expect(p.strides).toEqual([1, 4, 2])
    expect(p.storageId).toBe(t.storageId)
    expect(p.isContiguous()).toBe(false)
  })

  it('round-trips back to the original layout', () => {
    const t = FakeTensor.create([0, 1, 2, 3, 4, 5, 6, 7], [2, 2, 2])
    const p = t.permute([2, 0, 1])
    const back = p.permute([1, 2, 0])
    expect(back.shape).toEqual([2, 2, 2])
    expect(back.strides).toEqual([4, 2, 1])
    expect(back.isContiguous()).toBe(true)
  })

  it('rejects non-permutations', () => {
    const t = FakeTensor.create([0, 1, 2, 3, 4, 5, 6, 7], [2, 2, 2])
    expect(() => t.permute([0, 0, 1])).toThrow()
    expect(() => t.permute([0, 1])).toThrow()
  })
})

describe('view', () => {
  it('reinterprets a contiguous tensor without copying', () => {
    const t = FakeTensor.create([1, 2, 3, 4, 5, 6], [2, 3])
    const v = t.view([3, 2])
    expect(v.shape).toEqual([3, 2])
    expect(v.strides).toEqual([2, 1])
    expect(v.storageId).toBe(t.storageId)
    expect(v.get(1, 0)).toBe(3)
  })

  it('flattens and reshapes freely while contiguous', () => {
    const t = FakeTensor.create([1, 2, 3, 4, 5, 6], [2, 3])
    expect(t.view([6]).toArray()).toEqual([1, 2, 3, 4, 5, 6])
    expect(t.view([6]).view([3, 2]).toArray()).toEqual([1, 2, 3, 4, 5, 6])
  })

  it('throws on a transposed tensor, like PyTorch', () => {
    const t = FakeTensor.create([1, 2, 3, 4, 5, 6], [2, 3])
    const tt = t.transpose(0, 1)
    expect(() => tt.view([2, 3])).toThrow(/non-contiguous/)
  })

  it('throws when element counts mismatch', () => {
    const t = FakeTensor.create([1, 2, 3, 4, 5, 6], [2, 3])
    expect(() => t.view([4, 2])).toThrow()
  })

  it('view of a 1-slice still works on sliced tensors that stay contiguous', () => {
    const t = FakeTensor.create([1, 2, 3, 4, 5, 6], [2, 3])
    const row = t.slice([[1, 2], null]) // second row: [4, 5, 6]
    expect(row.isContiguous()).toBe(true)
    expect(row.view([3]).toArray()).toEqual([4, 5, 6])
  })
})

describe('reshape', () => {
  it('behaves like view when contiguous', () => {
    const t = FakeTensor.create([1, 2, 3, 4, 5, 6], [2, 3])
    const r = t.reshape([3, 2])
    expect(r.storageId).toBe(t.storageId)
  })

  it('falls back to a copy when non-contiguous', () => {
    const t = FakeTensor.create([1, 2, 3, 4, 5, 6], [2, 3])
    const tt = t.transpose(0, 1)
    const r = tt.reshape([2, 3])
    expect(r.shape).toEqual([2, 3])
    expect(r.storageId).not.toBe(t.storageId)
    expect(r.isContiguous()).toBe(true)
    // logical content preserved through the copy
    expect(r.toArray()).toEqual(tt.toArray())
  })
})

describe('contiguous', () => {
  it('is a no-op (same storage) when already contiguous', () => {
    const t = FakeTensor.create([1, 2, 3, 4, 5, 6], [2, 3])
    const c = t.contiguous()
    expect(c.storageId).toBe(t.storageId)
    expect(c.strides).toEqual(t.strides)
  })

  it('copies into row-major storage when non-contiguous', () => {
    const t = FakeTensor.create([1, 2, 3, 4, 5, 6], [2, 3])
    const tt = t.transpose(0, 1)
    const c = tt.contiguous()
    expect(c.storageId).not.toBe(t.storageId)
    expect(c.shape).toEqual([3, 2])
    expect(c.strides).toEqual([2, 1])
    expect(c.toArray()).toEqual([1, 4, 2, 5, 3, 6])
    expect(c.isContiguous()).toBe(true)
  })

  it('preserves logical reads through the copy', () => {
    const t = FakeTensor.create([1, 2, 3, 4, 5, 6], [2, 3])
    const tt = t.transpose(0, 1)
    const c = tt.contiguous()
    expect(c.get(2, 1)).toBe(tt.get(2, 1))
  })
})

describe('clone and detach', () => {
  it('clone creates new storage with the same logical values', () => {
    const t = FakeTensor.create([1, 2, 3, 4, 5, 6], [2, 3])
    const c = t.clone()
    expect(c.storageId).not.toBe(t.storageId)
    expect(c.toArray()).toEqual(t.toArray())
    expect(c.isContiguous()).toBe(true)
  })

  it('clone of a transposed tensor materializes row-major', () => {
    const t = FakeTensor.create([1, 2, 3, 4, 5, 6], [2, 3])
    const c = t.transpose(0, 1).clone()
    expect(c.strides).toEqual([2, 1])
    expect(c.toArray()).toEqual([1, 4, 2, 5, 3, 6])
  })

  it('detach shares storage and metadata', () => {
    const t = FakeTensor.create([1, 2, 3, 4, 5, 6], [2, 3])
    const d = t.detach()
    expect(d.storageId).toBe(t.storageId)
    expect(d.shape).toEqual(t.shape)
    expect(d.strides).toEqual(t.strides)
    expect(d.offset).toBe(t.offset)
  })
})

describe('copy_', () => {
  it('overwrites storage in place from another view', () => {
    const a = FakeTensor.create([1, 2, 3, 4, 5, 6], [2, 3])
    const before = a.storageId
    const b = FakeTensor.create([10, 11, 12, 13, 14, 15], [2, 3])
    a.copy_(b)
    expect(a.toArray()).toEqual([10, 11, 12, 13, 14, 15])
    expect(a.storageId).toBe(before) // in place: storage identity unchanged
    expect(a.storageId).not.toBe(b.storageId)
  })

  it('copies across different layouts, preserving the destination layout', () => {
    const a = FakeTensor.create([1, 2, 3, 4, 5, 6], [2, 3])
    const transposedSource = a.transpose(0, 1)
    const dest = FakeTensor.create([0, 0, 0, 0, 0, 0], [3, 2])
    dest.copy_(transposedSource)
    expect(dest.toArray()).toEqual([1, 4, 2, 5, 3, 6])
    expect(dest.strides).toEqual([2, 1])
  })

  it('rejects mismatched shapes', () => {
    const a = FakeTensor.create([1, 2, 3, 4, 5, 6], [2, 3])
    const b = FakeTensor.create([1, 2, 3, 4], [2, 2])
    expect(() => a.copy_(b)).toThrow()
  })
})

describe('slice', () => {
  it('takes a storage offset for row slices, sharing storage', () => {
    const t = FakeTensor.create([1, 2, 3, 4, 5, 6], [2, 3])
    const s = t.slice([[1, 2], null])
    expect(s.shape).toEqual([1, 3])
    expect(s.offset).toBe(3)
    expect(s.storageId).toBe(t.storageId)
    expect(s.toArray()).toEqual([4, 5, 6])
  })

  it('takes a column slice with a stride > 1', () => {
    const t = FakeTensor.create([1, 2, 3, 4, 5, 6], [2, 3])
    const s = t.slice([null, [0, 2]]) // first two columns
    expect(s.shape).toEqual([2, 2])
    expect(s.strides).toEqual([3, 1])
    expect(s.offset).toBe(0)
    expect(s.toArray()).toEqual([1, 2, 4, 5])
    expect(s.isContiguous()).toBe(false) // row stride 3, but row length 2
  })

  it('an inner column slice is non-contiguous and offset', () => {
    const t = FakeTensor.create([1, 2, 3, 4, 5, 6], [2, 3])
    const s = t.slice([null, [1, 3]]) // columns 1..2
    expect(s.shape).toEqual([2, 2])
    expect(s.offset).toBe(1)
    expect(s.isContiguous()).toBe(false)
    expect(s.toArray()).toEqual([2, 3, 5, 6])
  })

  it('keeps clamping sane for out-of-range ranges', () => {
    const t = FakeTensor.create([1, 2, 3, 4, 5, 6], [2, 3])
    const s = t.slice([[0, 99], null])
    expect(s.shape).toEqual([2, 3])
  })
})

describe('expand (broadcasting)', () => {
  it('gives a stride of 0 to expanded dims, sharing storage', () => {
    const t = FakeTensor.create([7, 8, 9], [1, 3])
    const e = t.expand([2, null])
    expect(e.shape).toEqual([2, 3])
    expect(e.strides).toEqual([0, 1])
    expect(e.storageId).toBe(t.storageId)
    expect(e.get(0, 0)).toBe(7)
    expect(e.get(1, 0)).toBe(7) // same storage slot, many logical names
  })

  it('broadcasts both dims of a scalar-shaped row', () => {
    const t = FakeTensor.create([5], [1, 1])
    const e = t.expand([2, 3])
    expect(e.strides).toEqual([0, 0])
    expect(e.toArray()).toEqual([5, 5, 5, 5, 5, 5])
  })

  it('leaves matching dims untouched', () => {
    const t = FakeTensor.create([1, 2, 3, 4, 5, 6], [2, 3])
    const e = t.expand([null, 3])
    expect(e.strides).toEqual([3, 1])
    expect(e.isContiguous()).toBe(true)
  })

  it('refuses to expand a non-1 dim', () => {
    const t = FakeTensor.create([1, 2, 3, 4, 5, 6], [2, 3])
    expect(() => t.expand([3, null])).toThrow()
  })
})

describe('shared storage through chains', () => {
  it('transpose → contiguous → view preserves values', () => {
    const t = FakeTensor.create([1, 2, 3, 4, 5, 6], [2, 3])
    const result = t.transpose(0, 1).contiguous().view([6])
    expect(result.toArray()).toEqual([1, 4, 2, 5, 3, 6])
    expect(result.isContiguous()).toBe(true)
    expect(result.storageId).not.toBe(t.storageId)
  })

  it('slices of transposed tensors share original storage', () => {
    const t = FakeTensor.create([1, 2, 3, 4, 5, 6], [2, 3])
    const col = t.transpose(0, 1).slice([[1, 2], null])
    // transposed grid is [[1, 4], [2, 5], [3, 6]]; row 1 is [2, 5]
    expect(col.toArray()).toEqual([2, 5])
    expect(col.storageId).toBe(t.storageId)
    expect(col.offset).toBe(1)
    expect(col.strides).toEqual([1, 3])
  })

  it('writing through copy_ is visible through views sharing storage', () => {
    const base = FakeTensor.create([1, 2, 3, 4, 5, 6], [2, 3])
    const view = base.transpose(0, 1)
    const fresh = FakeTensor.create([90, 91, 92, 93, 94, 95], [2, 3])
    base.copy_(fresh)
    // view shares storage, so it sees the new values through the same slots
    expect(view.toArray()).toEqual([90, 93, 91, 94, 92, 95])
  })

  it('span covers the touched range for strided views', () => {
    const t = FakeTensor.create([1, 2, 3, 4, 5, 6], [2, 3])
    expect(t.span()).toBe(6)
    expect(t.slice([null, [0, 2]]).span()).toBe(5) // touches flats 0..4 (skips 2 and 5)
  })
})
