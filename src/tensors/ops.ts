import { FakeTensor } from './engine'

export interface OpVariant {
  label: string
  /** what to look for in the visualization */
  note?: string
  /** may mutate the base (copy_) — return the result tensor */
  apply: (base: FakeTensor) => FakeTensor
  /** snapshot of the base after the variant ran, when the variant wrote to it */
  captureBaseAfter?: boolean
}

export interface OpDef {
  id: string
  name: string
  oneLiner: string
  blurb: string[]
  snippet: string
  baseShape: number[]
  baseData: number[]
  variants: OpVariant[]
}

export const tensorOps: OpDef[] = [
  {
    id: 'transpose',
    name: 'transpose',
    oneLiner: 'Swaps two axes in the metadata — memory does not move.',
    blurb: [
      'A tensor is a lens over a 1D buffer: shape says how to fold the buffer into a grid, strides say how far to jump in memory per axis. Transposing swaps two entries of shape and two entries of strides — nothing else.',
      'Watch the storage strip while pressing the button: it does not move a pixel. The grid re-labels its cells (each still points at the same storage box), and the read-order line over the strip stops being a clean walk — that zig-zag is what non-contiguous means.',
    ],
    snippet: `t = torch.arange(1, 7).view(2, 3)\nt.t()          # same storage, shape [3, 2], strides (1, 3)`,
    baseShape: [2, 3],
    baseData: [1, 2, 3, 4, 5, 6],
    variants: [
      {
        label: 't.transpose(0, 1)',
        note: 'The strip is untouched. Every cell points at the same storage box as before — only its grid position changed.',
        apply: (t) => t.transpose(0, 1),
      },
      {
        label: 'transpose twice',
        note: 'Two swaps cancel out: strides are row-major again, so the read-order line becomes clean.',
        apply: (t) => t.transpose(0, 1).transpose(0, 1),
      },
    ],
  },
  {
    id: 'permute',
    name: 'permute',
    oneLiner: 'transpose for any number of axes at once.',
    blurb: [
      'permute is the general version of transpose: hand it a full ordering of the axes and it reorders shape and strides in one go. Storage is never touched.',
      'This demo uses a 3D tensor rendered as stacked slices, so you can watch which slice a cell lands in after the axes are reshuffled.',
    ],
    snippet: `t = torch.arange(8).view(2, 2, 2)\nt.permute(2, 0, 1)   # same storage, strides (1, 4, 2)`,
    baseShape: [2, 2, 2],
    baseData: [0, 1, 2, 3, 4, 5, 6, 7],
    variants: [
      {
        label: 'permute(2, 0, 1)',
        note: 'The last axis becomes the first: stride 1 now leads the shape.',
        apply: (t) => t.permute([2, 0, 1]),
      },
      {
        label: 'permute(1, 0, 2)',
        note: 'Swapping only the first two axes — identical to transpose(0, 1) in 3D.',
        apply: (t) => t.permute([1, 0, 2]),
      },
    ],
  },
  {
    id: 'view',
    name: 'view',
    oneLiner: 'Re-reads the same storage with a new shape — only works when the layout allows it.',
    blurb: [
      'view reinterprets the buffer with a new shape. It can only do this without moving data when the current layout is row-major (contiguous): the read order must match the storage order, or cells would have to point at boxes they cannot reach.',
      'The last variant deliberately refuses: after a transpose the layout no longer lines up, and PyTorch raises instead of silently copying. That refusal is the whole contract of view.',
    ],
    snippet: `t = torch.arange(1, 7).view(2, 3)\nt.view(3, 2)     # same storage\n\n# after t.t(), this raises:\n# RuntimeError: view size is not compatible...`,
    baseShape: [2, 3],
    baseData: [1, 2, 3, 4, 5, 6],
    variants: [
      {
        label: 't.view(6)',
        note: 'Flattening a contiguous tensor: the grid becomes one row, cells keep their boxes.',
        apply: (t) => t.view([6]),
      },
      {
        label: 't.view(3, 2)',
        note: 'Refolding the same 6 boxes into a different grid — still zero copies.',
        apply: (t) => t.view([3, 2]),
      },
      {
        label: 'transpose, then view',
        note: 'PyTorch refuses here — the read order does not line up with memory.',
        apply: (t) => t.transpose(0, 1).view([2, 3]),
      },
    ],
  },
  {
    id: 'reshape',
    name: 'reshape',
    oneLiner: 'view when it can, a hidden copy when it must.',
    blurb: [
      'reshape is view with an escape hatch: if the layout is compatible it reinterprets in place, and if not it silently copies into fresh row-major storage first.',
      'That silent copy is easy to miss in real code. The second variant shows it: the result is backed by a different storage buffer than the original.',
    ],
    snippet: `t = torch.arange(1, 7).view(2, 3)\nt.reshape(3, 2)          # view, same storage\n\n# after t.t():\nt.reshape(2, 3)          # COPY — new storage, contiguous`,
    baseShape: [2, 3],
    baseData: [1, 2, 3, 4, 5, 6],
    variants: [
      {
        label: 't.reshape(3, 2)',
        note: 'Contiguous input, so reshape is exactly view: one strip, no new memory.',
        apply: (t) => t.reshape([3, 2]),
      },
      {
        label: 'transpose, then reshape',
        note: 'A second strip slides in — the copy PyTorch made for you. Check the answer panel.',
        apply: (t) => t.transpose(0, 1).reshape([2, 3]),
      },
    ],
  },
  {
    id: 'contiguous',
    name: 'contiguous',
    oneLiner: 'Copies only when the layout is not row-major — otherwise does nothing.',
    blurb: [
      'contiguous() promises the read order matches memory order. When the tensor already qualifies it is a no-op; otherwise it materializes a fresh buffer in one clean walk.',
      'This is the operation that pays for every transpose before a view can work again.',
    ],
    snippet: `t = torch.arange(1, 7).view(2, 3).t()\nt.is_contiguous()        # False\nt.contiguous()           # copy, strides (2, 1)`,
    baseShape: [2, 3],
    baseData: [1, 2, 3, 4, 5, 6],
    variants: [
      {
        label: 'contiguous on a fresh tensor',
        note: 'Already row-major, so nothing happens: same storage, same strides.',
        apply: (t) => t.contiguous(),
      },
      {
        label: 'transpose, then contiguous',
        note: 'The zig-zag read path is straightened out into a second buffer.',
        apply: (t) => t.transpose(0, 1).contiguous(),
      },
    ],
  },
  {
    id: 'clone',
    name: 'clone',
    oneLiner: 'Always a new buffer — the one op that guarantees independence.',
    blurb: [
      'clone copies the values into new storage no matter what. After cloning, writing into the original cannot touch the copy — which the third variant demonstrates by overwriting the original after cloning.',
      'detach, by contrast, shares storage and only drops autograd history — it is on this page because the two are easy to confuse.',
    ],
    snippet: `c = t.clone()            # new storage, same values\n\nt.copy_(torch.full((2, 3), 7.0))\nc[0][0]                  # unchanged — clone is independent\n\n# detach() shares storage; only autograd differs`,
    baseShape: [2, 3],
    baseData: [1, 2, 3, 4, 5, 6],
    variants: [
      {
        label: 't.clone()',
        note: 'A second strip appears immediately. Both grids show the same values from different memory.',
        apply: (t) => t.clone(),
      },
      {
        label: 'clone, then overwrite the original',
        note: 'The original grid now reads 7s; the clone keeps the old values. Independence, visualized.',
        apply: (t) => {
          const c = t.clone()
          const overwrites = FakeTensor.create([7, 7, 7, 7, 7, 7], [2, 3])
          t.copy_(overwrites)
          return c
        },
        captureBaseAfter: true,
      },
      {
        label: 't.detach()',
        note: 'Nothing changes anywhere — same storage, same values. Only autograd tracking is dropped.',
        apply: (t) => t.detach(),
      },
    ],
  },
]
