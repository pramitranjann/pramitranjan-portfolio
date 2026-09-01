/* Run: node scripts/check-mobile-gutter.mjs
   One gutter on phones. Fails if a page container inside the <=767px block goes back to a
   literal side padding instead of --layout-page-gutter — the drift that had the nav at 20px,
   the hero and About at 24px and everything token-driven at 40px on the same screen.
   Inner components (cards, buttons) and the standalone /qr, /tap and /dashboard shells keep
   their own tighter padding, so only site page containers are checked. */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const PAGE_CONTAINER = /(site-nav|site-footer|hero-stage|play-wall|editorial-shell|-section|-column|-grid-section)\b/

const css = readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8')
assert.match(css, /body \{\s*--layout-page-gutter: 24px !important;/, 'phone gutter token override missing')

const blocks = css.split('@media (max-width: 767px) {').slice(1)
assert.ok(blocks.length, 'phone breakpoint block missing')

let checked = 0
for (const block of blocks) {
  for (const [, selector, decls] of block.split('\n}\n')[0].matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (!PAGE_CONTAINER.test(selector) || !/padding(-inline|-left|-right)?:/.test(decls)) continue
    checked += 1
    assert.ok(
      decls.includes('var(--layout-page-gutter)'),
      `hardcoded phone gutter on ${selector.trim().replace(/\s+/g, ' ')}: ${decls.trim()}`,
    )
  }
}

assert.ok(checked > 5, `expected the phone block to still carry page containers, found ${checked}`)
console.log(`ok — ${checked} phone page containers all read --layout-page-gutter`)
