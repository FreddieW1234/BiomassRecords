# BiomassRecords

React static site deployed on Render. It talks to a small SQLite API that runs
on the office server and is reached through a Cloudflare Tunnel.

**This folder (APP) is only the frontend** — it's what gets pushed to GitHub
and built by Render. The API lives in the sibling `API` folder on the office
server (`D:\Data\Michton\Tony\BiomassRecords\API`) and is *not* part of this
repo. See `API\README.md` for the server setup.

```
Browser
   |  HTTPS
   v
https://biomassrecords.onrender.com   (this app, static on Render)
   |  HTTPS + X-API-Key
   v
https://api.biomasswood.co.uk         (Cloudflare Tunnel)
   |
   v
API on the office server (:8787, localhost only)
   |
   v
SQLite  API\data\biomass.db
```

## Render settings

- **Build command:** `npm ci && npm run build`
- **Publish directory:** `dist`
- **Environment variables:**
  - `VITE_API_URL` = `https://api.biomasswood.co.uk`
  - `VITE_API_KEY` = the `API_KEY` from the office server's `API\.env`
- Rewrite `/*` → `/index.html` (already in `render.yaml`).

Vite inlines `VITE_*` variables at **build** time, so changing them on Render
requires a redeploy. Connection Lab can override the URL/key in the browser at
runtime, which is handy for testing.

## Local development

```bash
copy .env.example .env
npm install
npm run dev
```

Open http://localhost:5173. The local dev site talks to the same office-server
API through the tunnel (localhost:5173 is in the API's CORS allowlist).

## API endpoints (served by the office server)

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Tunnel + database check (no key needed) |
| GET | `/api/records` | List rows |
| POST | `/api/records` | Insert `{ title, body }` |
| PUT | `/api/records/:id` | Update |
| DELETE | `/api/records/:id` | Delete |

All endpoints except `/api/health` require the `X-API-Key` header.
