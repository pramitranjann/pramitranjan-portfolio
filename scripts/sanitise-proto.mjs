#!/usr/bin/env node
// Rewrites person/merchant names in a vendored prototype directory.
// Usage: node scripts/sanitise-proto.mjs public/proto/swipey-admin
import { readdirSync, statSync, readFileSync, writeFileSync } from 'node:fs'
import { join, extname } from 'node:path'

// Real -> fictional. Longest keys first so substrings don't corrupt longer matches.
const NAME_MAP = {
  'GOH YU HAN': 'TAN WEI LING',
  'Goh Yu Han': 'Tan Wei Ling',
  'Suresh Kumar': 'Rajesh Nair',
  'Suresh Mastercard': 'Rajesh Mastercard',
  'New Suresh': 'New Rajesh',
  'Aisyah Rahman': 'Nurul Hakim',
  'Marcus Lim': 'Daniel Ong',
  'Big Boss HSP': 'Corner Cafe KL',
  'Simulate Merchant KL': 'Demo Merchant KL',
  'Test Merchant': 'Sample Merchant',
  'Kopi Labs Sdn Bhd': 'Bright Labs Sdn Bhd',
  'Kopi Labs': 'Bright Labs',
  'john@': 'aaron@',
  'sam@': 'mei@',
}

// Terms that must not survive anywhere in a vendored prototype.
const BANNED = ['r-swipey', 'GOH YU HAN', 'Suresh', 'Big Boss HSP', 'LaunchDarkly', 'Mixpanel']

const TEXT_EXT = new Set(['.html', '.js', '.jsx', '.ts', '.tsx', '.css', '.json', '.md', '.txt', '.map'])

function walk(dir) {
  const out = []
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry)
    if (statSync(p).isDirectory()) out.push(...walk(p))
    else out.push(p)
  }
  return out
}

const root = process.argv[2]
if (!root) {
  console.error('usage: node scripts/sanitise-proto.mjs <dir>')
  process.exit(2)
}

const keys = Object.keys(NAME_MAP).sort((a, b) => b.length - a.length)
let totalHits = 0

for (const file of walk(root)) {
  if (!TEXT_EXT.has(extname(file))) continue
  const before = readFileSync(file, 'utf8')
  let after = before
  let hits = 0
  for (const key of keys) {
    const parts = after.split(key)
    if (parts.length > 1) {
      hits += parts.length - 1
      after = parts.join(NAME_MAP[key])
    }
  }
  if (hits > 0) {
    writeFileSync(file, after)
    console.log(`${hits.toString().padStart(4)}  ${file}`)
    totalHits += hits
  }
}

console.log(`\ntotal replacements: ${totalHits}`)

// Verify nothing banned survived.
const survivors = []
for (const file of walk(root)) {
  if (!TEXT_EXT.has(extname(file))) continue
  const text = readFileSync(file, 'utf8')
  for (const term of BANNED) if (text.includes(term)) survivors.push(`${term} in ${file}`)
}

if (survivors.length) {
  console.error('\nBANNED TERMS SURVIVED:')
  for (const s of survivors) console.error('  ' + s)
  process.exit(1)
}
console.log('clean: no banned terms remain')
