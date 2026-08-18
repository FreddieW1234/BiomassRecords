import { mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { fileURLToPath } from 'node:url'
import cors from 'cors'
import express from 'express'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dataDir = join(__dirname, 'data')
mkdirSync(dataDir, { recursive: true })

const PORT = Number(process.env.PORT || 8787)
const API_KEY = process.env.API_KEY || ''
const CORS_ORIGINS = process.env.CORS_ORIGINS || '*'

const db = new DatabaseSync(join(dataDir, 'biomass.db'))
db.exec(`
  CREATE TABLE IF NOT EXISTS records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    body TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )
`)

const selectAll = db.prepare(
  'SELECT id, title, body, created_at, updated_at FROM records ORDER BY id DESC',
)
const selectOne = db.prepare(
  'SELECT id, title, body, created_at, updated_at FROM records WHERE id = ?',
)
const selectCount = db.prepare('SELECT COUNT(*) AS count FROM records')
const insertOne = db.prepare(
  'INSERT INTO records (title, body, created_at, updated_at) VALUES (?, ?, ?, ?)',
)
const updateOne = db.prepare(
  'UPDATE records SET title = ?, body = ?, updated_at = ? WHERE id = ?',
)
const deleteOne = db.prepare('DELETE FROM records WHERE id = ?')

if (selectCount.get().count === 0) {
  const now = new Date().toISOString()
  insertOne.run(
    'Tunnel check',
    'Seed row created on first boot. If you can read this from the site, the database is reachable.',
    now,
    now,
  )
}

function parseOrigins(value) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

const app = express()
app.disable('x-powered-by')
app.use(
  cors({
    origin(origin, callback) {
      const allowed = parseOrigins(CORS_ORIGINS)
      if (!origin || allowed.includes('*')) {
        callback(null, true)
        return
      }
      callback(null, allowed.includes(origin))
    },
    allowedHeaders: ['Content-Type', 'X-API-Key'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  }),
)
app.use(express.json({ limit: '1mb' }))

app.use((req, res, next) => {
  if (!API_KEY) {
    next()
    return
  }
  if (req.path === '/api/health' && req.method === 'GET') {
    next()
    return
  }
  const provided = req.get('x-api-key') || ''
  if (provided !== API_KEY) {
    res.status(401).json({ error: 'Invalid or missing X-API-Key' })
    return
  }
  next()
})

app.get('/api/health', (_req, res) => {
  const row = selectCount.get()
  res.json({
    ok: true,
    service: 'biomassrecords-api',
    time: new Date().toISOString(),
    database: 'connected',
    recordCount: row.count,
  })
})

app.get('/api/records', (_req, res) => {
  res.json({ records: selectAll.all() })
})

app.get('/api/records/:id', (req, res) => {
  const record = selectOne.get(Number(req.params.id))
  if (!record) {
    res.status(404).json({ error: 'Record not found' })
    return
  }
  res.json({ record })
})

app.post('/api/records', (req, res) => {
  const title = String(req.body?.title || '').trim()
  const body = String(req.body?.body || '').trim()
  if (!title) {
    res.status(400).json({ error: 'title is required' })
    return
  }
  const now = new Date().toISOString()
  const result = insertOne.run(title, body, now, now)
  const id = Number(result.lastInsertRowid)
  res.status(201).json({ record: selectOne.get(id) })
})

app.put('/api/records/:id', (req, res) => {
  const id = Number(req.params.id)
  const existing = selectOne.get(id)
  if (!existing) {
    res.status(404).json({ error: 'Record not found' })
    return
  }
  const title = String(req.body?.title ?? existing.title).trim()
  const body = String(req.body?.body ?? existing.body).trim()
  if (!title) {
    res.status(400).json({ error: 'title is required' })
    return
  }
  updateOne.run(title, body, new Date().toISOString(), id)
  res.json({ record: selectOne.get(id) })
})

app.delete('/api/records/:id', (req, res) => {
  const id = Number(req.params.id)
  const existing = selectOne.get(id)
  if (!existing) {
    res.status(404).json({ error: 'Record not found' })
    return
  }
  deleteOne.run(id)
  res.json({ ok: true, id })
})

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' })
})

app.listen(PORT, () => {
  console.log(`BiomassRecords API listening on http://localhost:${PORT}`)
  console.log(`SQLite file: ${join(dataDir, 'biomass.db')}`)
  console.log(API_KEY ? 'API key auth is enabled' : 'API key auth is off (set API_KEY to enable)')
  console.log('Point cloudflared at this port, then paste the public URL into the site.')
})
