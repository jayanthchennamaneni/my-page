export type FigureId = 'decision-loop' | 'edge-limits' | 'params-score' | 'deploy-pipeline'

export interface ContentBlock {
  heading: string
  paragraphs?: string[]
  bullets?: string[]
  code?: string
  table?: { headers: string[]; rows: string[][] }
  figure?: FigureId
}

export interface Post {
  id: string
  label: string
  title: string
  intro: string
  date?: string
  introFigure?: FigureId
  blocks: ContentBlock[]
}

// Newest first: October 2026 → June 2026.
export const posts: Post[] = [
  {
    id: 'decisions-on-edge',
    label: 'Decision models',
    title: 'Decisions, not tokens: a decision model on a small device',
    intro: 'Many apps do not need chat. They need a verdict: is this part faulty, is this action allowed, how urgent is this ticket? A small decision model answers on the device, with no network call.',
    date: 'October 2026',
    introFigure: 'decision-loop',
    blocks: [
      {
        heading: 'What a decision model is',
        paragraphs: [
          'A chat model writes text. A decision model is different. You give it a state — text, an image, JSON, or audio — and a list of typed questions: yes/no, a choice from a list, or a score.',
          'It returns every answer in a single forward pass, each with a calibrated probability between 0 and 1. It does not generate tokens. The output is small, fast, and easy to audit or unit-test.',
        ],
      },
      {
        heading: 'The four limits of an edge device',
        paragraphs: [
          'An edge device is a small computer in the field: a phone, a robot, a camera. Four limits define the budget there.',
        ],
        bullets: [
          'RAM — the model, the runtime, and the data must fit at the same time.',
          'Storage — the weights live in flash, and updates need room too.',
          'Energy — a small battery with no fan; every operation costs charge.',
          'Response time — the answer must arrive before the user or the process waits.',
        ],
        figure: 'edge-limits',
      },
      {
        heading: 'Why a decision model wins here',
        paragraphs: [
          'The cloud has none of these limits; the device has all of them. But a general LLM spends most of its compute writing prose you did not ask for. A decision model does not — that is the whole trick, and it changes the math on three fronts.',
        ],
        bullets: [
          'One pass, zero generated tokens — the cost per decision stays flat, even with many questions.',
          'Calibrated probabilities — set a threshold, and only low-confidence cases travel to the cloud. The device stays quiet and cheap.',
          'One specialist model per modality — you pay for vision, audio, or text, not for all three at once.',
        ],
      },
      {
        heading: 'The LFM3 recipe',
        paragraphs: [
          'LFM3 (Liquid AI, October 2026) puts this on one shared 1.7B backbone. Six 2B-class variants branch from it: text, vision, audio, omni — and two decision models, d1-2B and d1-omni-2B.',
          'd1-2B replaces the older d1-3B with about a third fewer parameters and scores 75.5 against 64.0 on the ImajevBench benchmark. Smaller and better is rare; it happened here because the architecture improved, not because the task got easier.',
        ],
        figure: 'params-score',
      },
      {
        heading: 'The footprint',
        paragraphs: [
          'At 4-bit quantization (Q4 GGUF), the base model is about a 1 GB file. On an iPhone 17 Pro, LFM3-1.7B runs with peak memory near 1.9 GB and decodes at 43.6 tokens per second — Liquid\u2019s own llama.cpp measurement.',
          'A decision pass does less work than that: the model reads your state once and answers. No generated sequence, no growing KV cache.',
          'Target hardware includes recent Samsung and OnePlus phones, Raspberry Pi 5, Apple silicon, AMD Ryzen AI, and Qualcomm NPU chips.',
        ],
      },
      {
        heading: 'Deploy it in five steps',
        paragraphs: [
          '1. Pick the variant that matches your inputs: vision, audio, omni, or text.',
          '2. Fine-tune d1-2B on your own data. One GPU is enough, with LEAP or TRL.',
          '3. Export the weights to 4-bit GGUF.',
          '4. Test on a real device with llama.cpp, Ollama, or MLX. Measure RAM, energy, and time.',
          '5. Ship, log the low-confidence cases, and re-tune.',
        ],
        figure: 'deploy-pipeline',
      },
      {
        heading: 'The checklist',
        bullets: [
          'Keep the state small. Cut fields that do not change the answer.',
          'Ask fewer questions. Each extra question costs compute.',
          'Set the threshold before launch. Decide what score means \u201cact\u201d and what score means \u201cask a human\u201d.',
          'Test the worst case, not the best case: cold start, low battery, offline.',
          'Loop your edge cases back into fine-tuning. The model improves where it fails.',
        ],
      },
      {
        heading: 'Summary',
        paragraphs: [
          'Put the decision on the device when you need speed, privacy, or offline work. A decision model answers with probabilities in one pass, so it costs little compute and little energy.',
          'LFM3 d1-2B is the current recipe: about a 2B specialist, about a 1 GB file at 4 bits, and one GPU to tune it. Small model, small device, clear answer.',
        ],
      },
    ],
  },
  {
    id: 'quantization',
    label: 'Quantization',
    title: 'Quantization, without the magic',
    intro: 'How floating-point weights become smaller integers — and what gets lost in the process.',
    date: 'September 2026',
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
          'GGUF (llama.cpp) — a file format and runtime for CPU and edge inference, with quantization levels from 8-bit down to 2-bit. Most downloadable \u201cquantized\u201d models on Hugging Face are GGUF files.',
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
  {
    id: 'tokenizer',
    label: 'Tokenizer',
    title: 'Tokenizers, or why models see text in pieces',
    intro: 'Every prompt is chopped into tokens before a model sees it — the vocabulary, not the alphabet, is what a model actually reads.',
    date: 'August 2026',
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
          'Modern tokenizers sit in the middle: common words stay whole, rare words split into reusable pieces. \u201ctokenizers\u201d might become \u201ctoken\u201d + \u201cizers\u201d; a typo or a rare name still breaks into pieces the model has seen somewhere before.',
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
          'Whitespace: many tokenizers glue a leading space onto the next word, so \u201chello\u201d and \u201c hello\u201d are different tokens.',
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
    id: 'inference-economics',
    label: 'Inference',
    title: 'The economics of running a model yourself',
    intro: 'Running a model yourself trades service fees for hardware, power, and operations — whether that pays off depends on the workload.',
    date: 'July 2026',
    blocks: [
      {
        heading: 'What inference costs',
        paragraphs: [
          'Training a model needs large amounts of compute and data, but it happens a few times. Inference happens constantly, and it has a different cost structure.',
          'When you run a model yourself, you replace part of the service cost with hardware, power, and operations. The result depends on the workload. The main costs are:',
        ],
        bullets: [
          'model memory',
          'compute',
          'power',
          'storage',
          'network transfer',
          'hardware',
          'system operation',
        ],
      },
      {
        heading: 'The model must fit in memory',
        paragraphs: [
          'Model weights are only one part of the cost. During inference, the system also needs memory for the runtime, the activations, and the KV cache. For a language model, the KV cache grows as the context and the generated sequence grow — model size alone does not define total inference memory.',
          'A basic estimate for model weight memory:',
        ],
        code: 'memory = parameters × bytes per parameter',
        table: {
          headers: ['Precision', 'Bytes per parameter', 'Weight memory, 1B parameters'],
          rows: [
            ['fp32', '4', '4 GB'],
            ['fp16', '2', '2 GB'],
            ['int8', '1', '1 GB'],
            ['int4', '0.5', '0.5 GB'],
          ],
        },
      },
      {
        heading: 'Quantization is the lever',
        paragraphs: [
          'These numbers describe weights only. The runtime and the KV cache need additional memory.',
          'Quantization reduces weight memory and makes local inference possible on smaller hardware. It can also reduce model quality. The effect depends on the model, the quantization method, and the task.',
        ],
      },
      {
        heading: 'Hardware changes the cost',
        paragraphs: [
          'Cloud inference gives you access to hardware without buying it. You pay for the service instead. With local inference, you own or rent the hardware, and the cost then includes:',
        ],
        bullets: [
          'hardware',
          'electricity',
          'storage',
          'maintenance',
          'software',
        ],
      },
      {
        heading: 'The utilization question',
        paragraphs: [
          'A local system has a high initial cost. After that, additional requests have a low incremental cost when the hardware is already available. Cloud inference has less initial hardware cost and more flexible capacity.',
          'Utilization decides which side wins. A GPU that processes one request at a time wastes much of its capacity; many requests can share the cost of the same GPU.',
          'Batching increases throughput — and the waiting time for individual requests. Interactive applications care about latency. Batch workloads care about throughput.',
        ],
      },
      {
        heading: 'Tokens affect inference',
        paragraphs: [
          'Language-model inference has two stages. The first stage processes the input context. The second stage generates output tokens.',
          'Longer inputs and outputs require more computation, and a large context also grows the KV cache. This is why token usage and context length matter when comparing inference systems.',
        ],
      },
      {
        heading: 'Small models change the calculation',
        paragraphs: [
          'A smaller model needs less memory than a larger model at the same precision, and it needs less compute. That can reduce the hardware required for inference and make local deployment possible.',
          'But a smaller model is not automatically cheaper. If it needs more retries, or cannot complete the task reliably, the total system cost goes up. The correct comparison is the cost of completing the task.',
        ],
      },
      {
        heading: 'Small and large models can work together',
        paragraphs: [
          'A production system does not always need one model. A small model can handle the simple requests — classification, routing, extraction, or simple tool selection — and only the hard cases reach the larger model.',
        ],
        code: 'request → small model → large model when required',
      },
      {
        heading: 'When local inference makes sense',
        bullets: [
          'traffic is stable',
          'the model fits the hardware',
          'hardware utilization is high',
          'data should remain local',
          'latency is important',
          'network access should not be required',
          'you already have suitable hardware',
        ],
        paragraphs: [
          'Cloud inference fits better when traffic is unpredictable, the hardware requirements are large, or operating the system yourself is not worth the effort.',
        ],
      },
      {
        heading: 'The real question',
        paragraphs: [
          'The question is not: \u201cis local inference cheaper?\u201d The better question is: \u201cwhat is the lowest total cost for the required task?\u201d The bill includes:',
        ],
        bullets: [
          'model quality',
          'hardware',
          'memory',
          'latency',
          'throughput',
          'power',
          'network',
          'utilization',
          'operations',
        ],
      },
      {
        heading: 'The rule I use',
        paragraphs: [
          'A small model reduces several of these costs at once. A cloud service removes hardware and operations work. A local system removes network dependence and recurring charges.',
          'Pick the system that matches the workload — and compare the cost of finishing the task, not the cost per token.',
        ],
      },
    ],
  },
  {
    id: 'conflict-drives-progress',
    label: 'A thought',
    title: 'Conflict drives progress',
    intro: 'Constant conflict plays a critical role in our progress. Without resistance, we become comfortable and stagnant.',
    date: 'June 2026',
    blocks: [
      {
        heading: '',
        paragraphs: [
          'Pollution pushed engineers to develop electric vehicles, environmental pressure pushes organisms to adapt and survive, and problems with existing theories push scientists to discover better explanations. Resistance creates problems, and problems create pressure to find better solutions.',
        ],
      },
    ],
  },
]
