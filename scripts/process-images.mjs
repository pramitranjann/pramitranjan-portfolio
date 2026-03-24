// scripts/process-images.mjs
// Resize public/ images to rendered display dimensions.
// Outputs *-processed.{ext} alongside originals — never overwrites.
// Run: node scripts/process-images.mjs

import sharp from 'sharp'
import { readdir, stat } from 'node:fs/promises'
import { join, basename, extname, dirname } from 'node:path'

const PUBLIC = new URL('../public', import.meta.url).pathname

// Dimension rules keyed on filename pattern (matched in order)
// w/h are the resize target; fit/position control cropping
const RULES = [
  // Card cover images (4:3, rendered ~288px wide in 4-col grid, 2× retina)
  { pattern: /cover-hor\.(png|jpe?g|webp)$/i, w: 800, h: 600,  fit: 'cover', position: 'top' },
  // Case study hero (portrait, rendered fill at 50vw)
  { pattern: /cover\.(png|jpe?g|webp)$/i,     w: 900, h: 1200, fit: 'cover', position: 'top' },
  // Research / solution-hero — full-width containers (1200px max, height varies)
  { pattern: /(research|solution-hero)\.(png|jpe?g|webp)$/i, w: 1200, h: null, fit: 'inside' },
  // Ideation / solution images — ~50vw containers
  { pattern: /(ideation|solution-\d|hero-\d|img-\d)\.(png|jpe?g|webp)$/i, w: 800, h: null, fit: 'inside' },
  // Creative covers / hero images
  { pattern: /(hero|cover)\.(png|jpe?g|webp)$/i, w: 900, h: null, fit: 'inside' },
]

function ruleFor(filename) {
  for (const r of RULES) {
    if (r.pattern.test(filename)) return r
  }
  return null // skip unknowns
}

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = []
  for (const e of entries) {
    const full = join(dir, e.name)
    if (e.isDirectory()) files.push(...await walk(full))
    else if (/\.(png|jpe?g|webp)$/i.test(e.name) && !e.name.includes('-processed')) files.push(full)
  }
  return files
}

async function processFile(src) {
  const ext = extname(src)
  const base = basename(src, ext)
  const dest = join(dirname(src), `${base}-processed${ext}`)
  const rule = ruleFor(basename(src))
  if (!rule) return null

  const opts = { width: rule.w ?? undefined, height: rule.h ?? undefined, fit: rule.fit, position: rule.position ?? 'top', withoutEnlargement: true }
  await sharp(src).resize(opts).toFile(dest)
  return dest
}

const files = await walk(PUBLIC)
let done = 0
for (const f of files) {
  const out = await processFile(f)
  if (out) { console.log(`✓ ${out.replace(PUBLIC, '')}`); done++ }
}
console.log(`\nProcessed ${done} / ${files.length} images.`)
