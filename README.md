# A2 Key Mock Test

Mobile-first Cambridge A2 Key Reading & Writing practice test. Students complete all 7 parts under timed conditions, then review scored results with answer rationales.

**Live:** https://ehames.github.io/mocktest/

## Stack

Vite · React 18 · TypeScript · Tailwind CSS v4 · vite-plugin-pwa

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173/mocktest/
npm run build      # production build → dist/
npm test           # Playwright smoke tests (requires dev server)
npm run test:unit  # Vitest unit tests
```

First-time Playwright setup:

```bash
npm run test:install   # downloads Chromium
```

## Add questions

Question banks live in `public/questions/schools/` — one JSON file per part. To add questions, append to the relevant file and push; no code changes needed.

| File | Format | Selection |
|---|---|---|
| `part1.json` | `{ items: Part1Item[] }` | shuffle, take 6 |
| `part2.json` | `{ sets: Part2Set[] }` | pick 1 random set |
| `part3.json` | `{ sets: Part3Set[] }` | pick 1 random set |
| `part4.json` | `{ sets: Part4Set[] }` | pick 1 random set |
| `part5.json` | `{ sets: Part5Set[] }` | pick 1 random set |
| `part6.json` | `{ prompts: Part6Prompt[] }` | pick 1 random prompt |
| `part7.json` | `{ prompts: Part7Prompt[] }` | pick 1 random prompt |

Part 7 prompts use illustrated picture strips (`public/images/part7/`). See `src/types.ts` for the full schema.

## Deploy

Push to `main` → GitHub Actions builds and deploys to `gh-pages` automatically.
