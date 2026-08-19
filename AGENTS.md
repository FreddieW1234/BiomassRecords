# BiomassRecords — context for AI assistants

Read this before changing anything. The code alone does not tell the whole story.

## The big picture

This folder (**APP**) is a React/Vite **static frontend only**. It is the GitHub
repo and deploys to Render (https://biomassrecords.onrender.com, also served at
https://biomasswood.co.uk and www). There is **no backend in this repo**.

The backend lives in the **sibling `API` folder**, which is NOT in git and runs
on the office server (a Windows Server 2016 machine):

```
Browser → Render static site → https://api.biomasswood.co.uk (Cloudflare Tunnel)
        → cloudflared service on office server → Express API on 127.0.0.1:8787
        → SQLite at API\data\biomass.db
```

From the development PC, the office server's disk is mapped as `Z:` —
`Z:\Michton\Tony\BiomassRecords\` here equals `D:\Data\Michton\Tony\BiomassRecords\`
on the server. Editing files in `..\API\` via the share edits them on the server
directly, **but the API only picks up changes after a restart** (see below).

## Rules and pitfalls

- **API changes need a manual restart on the office server**: someone must RDP
  in and run `D:\Data\Michton\Tony\BiomassRecords\API\restart-api.bat` as
  Administrator — always from the `D:\` path (elevated prompts cannot see the
  server's own `Z:` mapping). You cannot restart it from the dev PC.
- **Frontend env vars are baked at build time** (`VITE_API_URL`, `VITE_API_KEY`).
  On Render they're set in the dashboard; changing them requires a redeploy.
  There is deliberately NO runtime override (a localStorage override was removed).
- **Auth**: every endpoint except `GET /api/health` requires the `X-API-Key`
  header. The key lives in `API\.env` (`API_KEY`) and must match Render's
  `VITE_API_KEY`.
- **CORS**: browser origins must be listed in `CORS_ORIGINS` in `API\.env`
  (currently the Render URL, biomasswood.co.uk, www, and localhost dev ports).
  New domain → add it there → restart the API.
- **The office server is Windows Server 2016**: no `curl`, no `winget`, system
  Node install failed there. The API runs on a **bundled portable Node**
  (`API\node\node.exe`) via a scheduled task ("BiomassRecords API", runs at
  boot as SYSTEM). Don't "fix" this by assuming a system Node exists.
- **Do not run `npm install` in `API\` carelessly**: its `node_modules` is
  shared with the live server over SMB. Dependencies are pure-JS (express, cors).
- The API must keep listening on `127.0.0.1` only, and must only touch files
  inside `API\data\` — both are deliberate security constraints.
- `APP\server\` (if still present) is a dead placeholder, git-ignored; the real
  API is `..\API\index.mjs`.

## How the API is structured

`API\index.mjs` defines all record types in one `RESOURCES` map
(boilers, cleaning, maintenance, meter-readings, earnings). Each entry declares
its table, ordering, and typed fields (text / date / number / boiler-reference);
CRUD routes, validation, table creation, and column migration are generated
from it. To add a record type or field: extend `RESOURCES` (new columns are
added automatically on next restart), then mirror it in the frontend:
`src/api/types.ts` + `src/api/client.ts` (resource helper), a page under
`src/pages/` using the `useLedger` hook, and routes/nav in `App.tsx` +
`components/Layout.tsx`. Cleaning and Maintenance share `components/WorkLog.tsx`.

Response shapes: lists are `{ items: [...] }`, single `{ item }`, deletes
`{ ok, id }`, errors `{ error: "message" }`. Dates are `YYYY-MM-DD` strings.
Deleting a boiler that has records attached is refused by the API.

## Full server setup docs

See `..\API\README.md` for the complete office-server setup (tunnel, scheduled
task, restart, backups).
