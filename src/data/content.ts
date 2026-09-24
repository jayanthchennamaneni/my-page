export interface ContentBlock {
  heading: string
  paragraphs?: string[]
  bullets?: string[]
  code?: string
}

export interface Topic {
  id: string
  label: string
  title: string
  intro: string
  readTime: string
  blocks: ContentBlock[]
}

export const thoughtTopics: Topic[] = [
  {
    id: 'conflict-drives-progress',
    label: 'A thought',
    title: 'Conflict Drives Progress',
    intro: 'Constant conflict plays a critical role in our progress. Without resistance, we become comfortable and stagnant.',
    readTime: '1 min',
    blocks: [
      {
        heading: '',
        paragraphs: [
          'Constant conflict plays a critical role in our progress. Without resistance, we become comfortable and stagnant. Pollution pushed engineers to develop electric vehicles, environmental pressure pushes organisms to adapt and survive, and problems with existing theories push scientists to discover better explanations. Resistance creates problems, and problems create pressure to find better solutions.',
        ],
      },
    ],
  },
]

export const aiTopics: Topic[] = [
  {
    id: 'tokenizer',
    label: 'Tokenizer',
    title: 'Tokenizers, or why models see text in pieces',
    intro: 'Every prompt is chopped into tokens before a model sees it — the vocabulary, not the alphabet, is what a model actually reads.',
    readTime: '5 min',
    blocks: [
      {
        heading: 'The problem',
        paragraphs: [
          'Neural networks compute on numbers, not characters. So before anything reaches a model, raw text must become a sequence of integers — and the mapping has to be fixed, because the model is trained against one specific vocabulary.',
          'The obvious option is one token per character. It needs a tiny vocabulary, but a sentence becomes a very long sequence, and attention cost grows with sequence length. One token per word is the opposite: short sequences, but a vocabulary of millions with no way to handle a word it has never seen.',
        ],
      },
      {
        heading: 'The solution: subwords',
        paragraphs: [
          'Modern tokenizers sit in the middle: common words stay whole, rare words split into reusable pieces. "tokenizers" might become "token" + "izers"; a typo or a rare name still breaks into pieces the model has seen somewhere before.',
          'BPE (byte-pair encoding) is the workhorse. Start with single bytes, then repeatedly merge the most frequent adjacent pair into a new token until the vocabulary reaches a target size. The merge table is learned from data, so token length tracks how common a word is.',
        ],
        code: `"unbelievable" → ["un", "believ", "able"] → [72, 1043, 402]`,
      },
      {
        heading: 'What breaks',
        paragraphs: [
          'The quirks you meet in practice all come from the same place: the tokenizer splits text, not meaning.',
        ],
        bullets: [
          'Numbers: digits often split unpredictably, which is one reason models are shaky at arithmetic.',
          'Non-English text: vocabularies are trained mostly on English, so the same sentence can cost 2–3× more tokens.',
          'Whitespace: many tokenizers glue a leading space onto the next word, so "hello" and " hello" are different tokens.',
          'Code and YAML: indentation becomes its own tokens, and long identical prefixes waste context.',
        ],
      },
      {
        heading: 'Where it matters when building',
        paragraphs: [
          'Context limits, API pricing, and latency are all measured in tokens, not words — a rough rule is 1 token ≈ 4 characters of English. Cache behavior also depends on tokenization: prompts that share a token prefix can reuse the cached computation, while a single changed character in the first word can invalidate it.',
        ],
      },
    ],
  },
  {
    id: 'quantization',
    label: 'Quantization',
    title: 'Quantization, without the magic',
    intro: 'How floating-point weights become smaller integers — and what gets lost in the process.',
    readTime: '6 min',
    blocks: [
      {
        heading: 'The problem',
        paragraphs: [
          'A model stored with 32-bit floating point numbers uses a lot of memory. A 7-billion-parameter model needs roughly 28 GB just for its weights — more than most consumer GPUs have, and far more than a phone can hold.',
          'The weights are also surprisingly redundant. Neighbouring values differ by tiny amounts, and most of the 32 bits exist to preserve precision that the task does not actually need.',
        ],
      },
      {
        heading: 'The simple solution: fewer bits',
        paragraphs: [
          'Quantization represents each value with a smaller number of bits — usually 8 or 4 instead of 32. The model may still compute in floating point during inference, but the stored weights (and sometimes activations) shrink by 4–8×.',
          'To map values back and forth, you only need two numbers: a scale, which controls the size of each step, and a zero point, which controls where the range starts.',
        ],
        code: `x_int ≈ round(x / scale) + zero_point
x_real ≈ scale × (x_int - zero_point)`,
      },
      {
        heading: 'What breaks',
        paragraphs: [
          'With few bits, nearby values collapse into the same integer. One scale for an entire tensor works badly when a few weights are much larger than the rest — they stretch the range and crush everything else into a handful of integer values.',
          'Errors also compound: each layer quantizes slightly differently, and small deviations stack up across dozens of layers. That is why a quantized model must be compared with the original on a real evaluation set, not trusted on paper.',
        ],
      },
      {
        heading: 'Techniques you will meet in practice',
        paragraphs: [
          'These are the quantization methods you will actually encounter on Hugging Face. They all follow the same scale-and-zero-point idea above; they differ mainly in how carefully they choose the ranges.',
        ],
        bullets: [
          'bitsandbytes — runtime 8-bit (INT8) and 4-bit (NF4) quantization, applied when the model loads. NF4 assumes weights follow a normal distribution and quantizes accordingly. It is the default behind load_in_4bit in transformers and needs no calibration data.',
          'GPTQ — a post-training method that quantizes layers one at a time, using a small calibration set to minimize the error each layer introduces. Produces compact 4-bit models; popular for GPU inference.',
          'AWQ — activation-aware quantization: it protects the few weight channels that activations actually depend on. Usually more accurate than GPTQ at the same bit width, and hardware-friendly.',
          'GGUF (llama.cpp) — a file format and runtime for CPU and edge inference, with quantization levels from 8-bit down to 2-bit. Most downloadable "quantized" models on Hugging Face are GGUF files.',
        ],
      },
      {
        heading: 'Weight-only vs full quantization',
        paragraphs: [
          'Weight-only quantization keeps activations in floating point and is the easiest place to start — it is what most Hugging Face checkpoints provide.',
          'Quantizing activations too speeds up the arithmetic, but it requires knowing the value ranges that appear while the model runs, which is where a calibration set comes in.',
        ],
      },
      {
        heading: 'The trade-off',
        paragraphs: [
          'The gain is memory: smaller weights mean smaller downloads, better cache behaviour, and room for bigger models on the same hardware. On a phone or in a browser, it is often the only way a model fits at all.',
          'The cost is precision. My rule: compare the quantized model with the original on a real evaluation set before trusting the memory savings — and at 4 bits, prefer NF4 or AWQ over naive per-tensor scaling.',
        ],
      },
    ],
  },
]

export const algorithmTopics: Topic[] = [
  {
    id: 'b-tree',
    label: 'B-Tree',
    title: 'B-Tree',
    intro: 'A balanced tree that keeps sorted keys in every node, keeping lookups short even when the data is huge.',
    readTime: '2 min',
    blocks: [
      {
        heading: 'Where it is used',
        bullets: [
          'Database indexes that need predictable tree height.',
          'File-system indexes that store metadata on disk.',
          'Ordered search structures in in-memory and persistent data systems.',
        ],
      },
      {
        heading: 'How it works',
        paragraphs: [
          'Every node holds sorted keys and pointers to children between them. A search descends from the root, choosing the interval the key falls into. The tree stays balanced because nodes split when they overflow, so height grows only when an entire level is full.',
        ],
      },
    ],
  },
  {
    id: 'b-plus-tree',
    label: 'B+ Tree',
    title: 'B+ Tree',
    intro: 'A B-Tree variant that keeps all records in linked leaves, making ordered range scans cheap.',
    readTime: '2 min',
    blocks: [
      {
        heading: 'Where it is used',
        bullets: [
          'Database indexes that support fast point lookups and range queries.',
          'Storage engines that scan ranges of ordered records.',
          'Key-value and time-series indexes that rely on ordered keys.',
        ],
      },
      {
        heading: 'How it works',
        paragraphs: [
          'Internal nodes hold only separator keys copied from the leaves, so they stay small and fit more of the tree in cache. The leaves themselves hold the records, linked left to right — which is why B+ Trees dominate storage engines.',
        ],
      },
    ],
  },
]

export const toolTopics: Topic[] = [
  {
    id: 'coolify',
    label: 'Coolify',
    title: 'Coolify',
    intro: 'Self-hosting and deployment platform for running applications on my own servers.',
    readTime: '',
    blocks: [],
  },
  {
    id: 'docker',
    label: 'Docker',
    title: 'Docker',
    intro: 'A container tool for packaging applications and their dependencies consistently.',
    readTime: '',
    blocks: [],
  },
  {
    id: 'hugging-face',
    label: 'Hugging Face',
    title: 'Hugging Face',
    intro: 'A home for sharing models, datasets, and the code that runs them.',
    readTime: '',
    blocks: [],
  },
  {
    id: 'pytorch',
    label: 'PyTorch',
    title: 'PyTorch',
    intro: 'The deep learning framework I use to build and experiment with neural networks.',
    readTime: '',
    blocks: [],
  },
  {
    id: 'chromadb',
    label: 'chromaDB',
    title: 'chromaDB',
    intro: 'A vector database for storing and searching embeddings.',
    readTime: '',
    blocks: [],
  },
  {
    id: 'sqlite',
    label: 'sqlite',
    title: 'sqlite',
    intro: 'A lightweight embedded database for local state and structured data.',
    readTime: '',
    blocks: [],
  },
  {
    id: 'livekit',
    label: 'LiveKit',
    title: 'LiveKit',
    intro: 'Infrastructure for real-time audio and video in interactive applications.',
    readTime: '',
    blocks: [],
  },
  {
    id: 'n8n',
    label: 'n8n',
    title: 'n8n',
    intro: 'A workflow automation tool that connects services through visible pipelines.',
    readTime: '',
    blocks: [],
  },
  {
    id: 'pi',
    label: 'Pi',
    title: 'Pi',
    intro: 'A small personal AI interface for experimenting with models and tools.',
    readTime: '',
    blocks: [],
  },
  {
    id: 'opencode',
    label: 'OpenCode',
    title: 'OpenCode',
    intro: 'An open-source coding agent for working directly with code and tooling.',
    readTime: '',
    blocks: [],
  },
  {
    id: 'openrouter',
    label: 'OpenRouter',
    title: 'OpenRouter',
    intro: 'A model gateway for comparing and routing between different model providers.',
    readTime: '',
    blocks: [],
  },
]
