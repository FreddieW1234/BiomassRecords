# BiomassWood

This Cursor workspace is the **React frontend only** (`APP`). It is hosted on GitHub and Render as a static site.

## Layout

The laptop `V:` drive is a VPN view of the server. Paths on the server start at `Michton`.

```
Michton/Tony/BiomassRecords/
  APP/     this repo — React, Vite, Render static site
  API/     server origin — Express (index.mjs), SQLite, Cloudflare tunnel target
```

Do not put databases, Flask, Express, or other API code in `APP`.

## Cloudflare

- Public hostname: `https://api.biomasswood.co.uk`
- Origin on the server: **HTTP → localhost:8787**
- That process must run from `Michton/Tony/BiomassRecords/API` (`node index.mjs` via `start-api.bat`)

The frontend calls `https://api.biomasswood.co.uk`. It never talks to `localhost` in production.

After API code or `.env` changes, run `API\restart-api.bat` as Administrator from the `D:\` path. The Render site does not need a redeploy for API-only changes.

## Frontend conventions

- Vite + React + TypeScript
- Render build: `npm ci && npm run build`
- Render publish directory: `dist`
- Rewrite `/*` → `/index.html`
- Env: `VITE_API_URL=https://api.biomasswood.co.uk`, `VITE_API_KEY` (same as server `API_KEY`)
- Writes use header `X-API-Key`

## API contract (implemented in `../API`, not here)

Full field list: `../API/DATA-MODEL.md`.

Envelope: lists `{ items }`, one row `{ item }`, delete `{ ok, id }`. Errors `{ error }`.

| Method | Path | Auth |
| --- | --- | --- |
| GET | `/api/health` | none |
| GET | `/api/alerts` | `X-API-Key` |
| GET/POST | `/api/{resource}` | `X-API-Key` |
| GET/PUT/DELETE | `/api/{resource}/:id` | `X-API-Key` |
| PUT/GET | `/api/documents/:id/file` | `X-API-Key` |

Resources: `sites`, `boilers`, `meters`, `fuel-stores`, `fuel-suppliers`, `fuel-batches`, `fuel-deliveries`, `fuel-consumption`, `cleaning`, `maintenance`, `meter-readings`, `earnings`, `maintenance-templates`, `maintenance-tasks`, `defects`, `hs-inspections`, `documents`.

The live APP pages use `boilers`, `cleaning`, `maintenance`, `meter-readings`, and `earnings`. New columns on those tables are optional so existing forms keep working.

If you need to change databases or the API, work in `../API`, not this repo. Persistence must match the tunnel API resources exactly.
