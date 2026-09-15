// Node 22.18+ (native TypeScript), OpenSSL and unzip. All keys are ephemeral.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { registerHooks } from 'node:module'
import { after, test } from 'node:test'
import { createWalletPass, WalletConfigurationError } from '../lib/wallet/pass.ts'

registerHooks({
  resolve(specifier, context, nextResolve) {
    return nextResolve(specifier === '@/lib/wallet/pass'
      ? new URL('../lib/wallet/pass.ts', import.meta.url).href : specifier, context)
  },
})
const { GET } = await import('../app/api/wallet/route.ts')
const directory = mkdtempSync(path.join(tmpdir(), 'portfolio-wallet-test-'))
after(() => rmSync(directory, { recursive: true, force: true }))
const openssl = (...args) => execFileSync('openssl', args, { cwd: directory, stdio: ['ignore', 'pipe', 'pipe'] })
openssl('req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-keyout', 'ca.key', '-out', 'ca.pem',
  '-days', '2', '-subj', '/CN=Wallet test CA', '-addext', 'basicConstraints=critical,CA:TRUE')
openssl('req', '-new', '-newkey', 'rsa:2048', '-nodes', '-keyout', 'signer.key', '-out', 'signer.csr',
  '-subj', '/CN=Wallet test signer/UID=pass.com.pramitranjan.test/OU=TESTTEAM01')
openssl('x509', '-req', '-in', 'signer.csr', '-CA', 'ca.pem', '-CAkey', 'ca.key', '-CAcreateserial',
  '-out', 'signer.pem', '-days', '1')
const env = {
  APPLE_WALLET_PASS_TYPE_IDENTIFIER: 'pass.com.pramitranjan.test',
  APPLE_WALLET_TEAM_IDENTIFIER: 'TESTTEAM01',
  APPLE_WALLET_SIGNER_CERT: readFileSync(path.join(directory, 'signer.pem'), 'utf8'),
  APPLE_WALLET_SIGNER_KEY: readFileSync(path.join(directory, 'signer.key'), 'utf8'),
  APPLE_WALLET_WWDR_CERT: readFileSync(path.join(directory, 'ca.pem'), 'utf8'),
}
const entry = (file, name) => execFileSync('unzip', ['-p', file, name])

test('missing and invalid signing configuration is rejected', async () => {
  await assert.rejects(createWalletPass({}), WalletConfigurationError)
  for (const change of [
    { APPLE_WALLET_TEAM_IDENTIFIER: 'OTHERTEAM1' },
    { APPLE_WALLET_PASS_TYPE_IDENTIFIER: 'pass.com.other' },
    { APPLE_WALLET_SIGNER_KEY: 'not a key' },
    { APPLE_WALLET_SIGNER_KEY: readFileSync(path.join(directory, 'ca.key'), 'utf8') },
    { APPLE_WALLET_WWDR_CERT: 'not a certificate' },
  ]) await assert.rejects(createWalletPass({ ...env, ...change }), WalletConfigurationError)
})

test('archive has correct content, icons, SHA-1 manifest and a valid detached signature', async () => {
  const file = path.join(directory, 'test.pkpass')
  writeFileSync(file, await createWalletPass(env))
  const names = execFileSync('unzip', ['-Z1', file], { encoding: 'utf8' }).trim().split('\n')
  assert.deepEqual(names.sort(), ['icon.png', 'icon@2x.png', 'icon@3x.png', 'manifest.json', 'pass.json', 'signature'].sort())
  const pass = JSON.parse(entry(file, 'pass.json'))
  assert.equal(pass.passTypeIdentifier, env.APPLE_WALLET_PASS_TYPE_IDENTIFIER)
  assert.equal(pass.teamIdentifier, env.APPLE_WALLET_TEAM_IDENTIFIER)
  assert.equal(pass.generic.primaryFields[0].value, 'Pramit Ranjan')
  assert.equal(pass.barcodes[0].message, 'https://www.pramitranjan.com/')
  assert.equal(pass.generic.backFields.find(({ key }) => key === 'email').value, 'pramitranjann@gmail.com')
  assert.equal(pass.webServiceURL, undefined)
  assert.equal(pass.authenticationToken, undefined)
  for (const [name, size] of [['icon.png', 30], ['icon@2x.png', 60], ['icon@3x.png', 90]]) {
    const png = entry(file, name)
    assert.equal(png.readUInt32BE(16), size)
    assert.equal(png.readUInt32BE(20), size)
  }
  const manifest = entry(file, 'manifest.json')
  const hashes = JSON.parse(manifest)
  assert.deepEqual(Object.keys(hashes).sort(), names.filter((name) => !['signature', 'manifest.json'].includes(name)).sort())
  for (const [name, hash] of Object.entries(hashes)) {
    assert.equal(createHash('sha1').update(entry(file, name)).digest('hex'), hash)
  }
  writeFileSync(path.join(directory, 'manifest.json'), manifest)
  writeFileSync(path.join(directory, 'signature'), entry(file, 'signature'))
  openssl('smime', '-verify', '-inform', 'DER', '-in', 'signature', '-content', 'manifest.json',
    '-CAfile', 'ca.pem', '-purpose', 'any', '-out', 'verified.json')
  assert.deepEqual(readFileSync(path.join(directory, 'verified.json')), manifest)
  // Also exercise hosting-friendly escaped PEM values and duplicate-card identity.
  const second = path.join(directory, 'second.pkpass')
  writeFileSync(second, await createWalletPass(Object.fromEntries(
    Object.entries(env).map(([key, value]) => [key, value.replace(/\n/g, '\\n')]),
  )))
  assert.equal(JSON.parse(entry(second, 'pass.json')).serialNumber, pass.serialNumber)
})

test('HTTP route returns a Wallet download or a safe uncached 503', async () => {
  const keys = [...Object.keys(env), 'APPLE_WALLET_SIGNER_KEY_PASSPHRASE']
  const original = Object.fromEntries(keys.map((key) => [key, process.env[key]]))
  try {
    for (const key of keys) delete process.env[key]
    const unavailable = await GET()
    assert.equal(unavailable.status, 503)
    assert.equal(unavailable.headers.get('cache-control'), 'no-store')
    assert.deepEqual(await unavailable.json(), { error: 'Apple Wallet is not available yet.' })
    Object.assign(process.env, env)
    const response = await GET()
    assert.equal(response.status, 200)
    assert.equal(response.headers.get('content-type'), 'application/vnd.apple.pkpass')
    assert.equal(response.headers.get('content-disposition'), 'attachment; filename="pramit-ranjan.pkpass"')
    assert.equal(response.headers.get('cache-control'), 'no-store')
    assert.equal(Buffer.from(await response.arrayBuffer()).subarray(0, 2).toString(), 'PK')
  } finally {
    for (const [key, value] of Object.entries(original)) {
      if (value === undefined) delete process.env[key]
      else process.env[key] = value
    }
  }
})
