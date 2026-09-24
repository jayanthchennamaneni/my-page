# Jayanth Chennamaneni — Personal Site

A small personal engineering notebook for thoughts, AI systems, algorithms, and tools.

Built with React, TypeScript, Vite, and Cloudflare Workers.

## Sections

- `/` — Compact introduction and section index
- `/thoughts` — Personal ideas, observations, and unfinished notes
- `/ai` — Engineering explanations for vLLM, prefill/decode, and quantization
- `/algorithms` — B-Tree vs B+ Tree with a visual comparison
- `/tools` — Lightweight notes about tools used and learned

The design follows `AGENTS.md`: minimal, readable, calm, and easy to maintain.

## Local development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run preview
```

## Content

Content lives in `src/data/content.ts`.

- **Thoughts** should express personal perspectives and can remain unfinished.
- **AI** should explain technical systems from an engineering perspective.
- **Algorithms** should show what is happening visually when it improves understanding.
- **Tools** should stay lightweight and reflect actual use or learning.

## Structure

```text
src/
├── components/  # Header, footer, selectors, and visual helpers
├── data/        # Site content
├── hooks/       # Page metadata helpers
├── pages/       # Route components
├── App.tsx      # Routes and shared layout
├── main.tsx     # Browser entry point
└── index.css    # Visual system and responsive styles
```
