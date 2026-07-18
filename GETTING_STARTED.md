# Getting Started

This is a Vite + Vue 3 + TypeScript app. It talks to the zero-dependency mock
API in `mock-data/` — see the brief in [`README.md`](README.md).

## Run it

```bash
cd frontend
npm install

# Terminal 1 — the mock API on http://localhost:8787
npm run mock-api

# Terminal 2 — the app on http://localhost:5173
npm run dev
```

If you run the mock API on a different port, point the app at it via
`.env.local` (copy `.env.example`):

```
VITE_API_BASE_URL=http://localhost:9000
```

## Other scripts

```bash
npm run test        # unit tests (Vitest)
npm run typecheck    # vue-tsc, strict mode
npm run lint         # eslint --fix
npm run format       # prettier --write
npm run build        # production build to dist/
```