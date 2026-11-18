#!/usr/bin/env node
/**
 * First-load JS per route (gzip). Next 16 no longer prints this in `next build`, so we read the
 * prerendered HTML in .next/server/app, collect its <script src> chunks, and gzip-sum them.
 * Fails (exit 1) if a budgeted route exceeds its limit. Run after `pnpm build`.
 */
import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'

const root = process.cwd()
const appDir = path.join(root, '.next', 'server', 'app')
const staticRoot = path.join(root, '.next')

/** Budgets in KB gzip. Product page is checked once a /products/* page is prerendered. */
const BUDGETS = [
  { match: (r) => r === '/', limit: 150, name: 'Home' },
  { match: (r) => r.startsWith('/products/'), limit: 150, name: 'Product' },
]

if (!fs.existsSync(appDir)) {
  console.error('No .next/server/app found. Run `pnpm build` first.')
  process.exit(1)
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name)
    return e.isDirectory() ? walk(p) : p.endsWith('.html') ? [p] : []
  })
}

const gzCache = new Map()
function gzSize(src) {
  if (gzCache.has(src)) return gzCache.get(src)
  const rel = src.replace(/^\/_next\//, '').split('?')[0]
  const file = path.join(staticRoot, decodeURIComponent(rel))
  const size = fs.existsSync(file) ? zlib.gzipSync(fs.readFileSync(file), { level: 9 }).length : 0
  gzCache.set(src, size)
  return size
}

const rows = []
for (const file of walk(appDir)) {
  let route = '/' + path.relative(appDir, file).replace(/\\/g, '/').replace(/\.html$/, '')
  route = route.replace(/\/index$/, '') || '/'
  if (route === '/index') route = '/'
  if (route.startsWith('/_')) continue // _not-found, _global-error
  const html = fs.readFileSync(file, 'utf8')
  // Skip noModule scripts (legacy polyfills): modern browsers never download them.
  const srcs = [
    ...new Set(
      [...html.matchAll(/<script([^>]+)>/g)]
        .map((m) => m[1])
        .filter((attrs) => !/\bnomodule\b/i.test(attrs))
        .map((attrs) => /src="([^"]+)"/.exec(attrs)?.[1])
        .filter((s) => s && s.startsWith('/_next/')),
    ),
  ]
  const bytes = srcs.reduce((s, src) => s + gzSize(src), 0)
  rows.push({ route, kb: bytes / 1024, chunks: srcs.length })
}

rows.sort((a, b) => a.route.localeCompare(b.route))
let failed = false
console.log('\nFirst-load JS (gzip) per prerendered route\n')
console.log('Route'.padEnd(44) + 'KB gz'.padStart(9) + 'chunks'.padStart(8) + '  budget')
for (const r of rows) {
  const budget = BUDGETS.find((b) => b.match(r.route))
  const over = budget && r.kb > budget.limit
  if (over) failed = true
  const mark = budget ? `${over ? 'FAIL' : 'ok'} (< ${budget.limit} ${budget.name})` : ''
  console.log(r.route.padEnd(44) + r.kb.toFixed(1).padStart(9) + String(r.chunks).padStart(8) + '  ' + mark)
}
if (!rows.length) {
  console.error('No prerendered HTML found.')
  process.exit(1)
}
console.log('')
process.exit(failed ? 1 : 0)
