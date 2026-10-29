# Jayanth Chennamaneni — Personal Blog

A small, personal engineering notebook. One page lists every post; every post has its own page.

Built with React, TypeScript, Vite, and Cloudflare Workers. Fonts (Inter, IBM Plex Mono) are self-hosted via `@fontsource` — no runtime dependency on external font CDNs.

## Pages

- `/` — Nameplate bar, masthead with the name, and the numbered index of all posts, newest first
- `/post/:id` — One page per post: meta line, title, article, and older/newer navigation

Any other URL redirects to `/`.

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

## Deployment

The site deploys to Cloudflare Workers. Configuration is in `wrangler.jsonc`; pushing to `main` triggers the deploy.

## Content

All posts live in `src/data/content.ts` as one `posts` array, ordered newest first (`01` in the index is the newest). A post has an `id`, `label`, `title`, `intro`, `date`, and content `blocks` — paragraphs, bullets, code, tables, and figure slots.

Post-specific interactive visuals (the tokenizer and quantization demos) are attached in `src/pages/PostPage.tsx`. Static figures are dependency-free SVG components in `src/components/PostFigure.tsx`.

## Structure

```text
src/
├── components/  # Article renderer, figures, interactive visuals, footer
├── data/        # All post content (content.ts)
├── hooks/       # Page metadata helper
├── pages/       # Home (index) and PostPage routes
├── App.tsx      # Routes, nameplate header, layout
├── main.tsx     # Entry point, self-hosted font imports
└── index.css    # Design system and responsive styles
```
