import 'server-only'

import { X509Certificate, createPrivateKey } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { PKPass } from 'passkit-generator'

export class WalletConfigurationError extends Error {}

// Public details from /tap. Keep the card identity stable across downloads.
const profile = {
  name: 'Pramit Ranjan',
  role: 'UX Designer',
  website: 'https://www.pramitranjan.com/',
  email: 'pramitranjann@gmail.com',
  linkedin: 'https://www.linkedin.com/in/pramitranjann/',
}

function required(env: NodeJS.ProcessEnv, name: string) {
  const value = env[name]?.trim()
  if (!value) throw new WalletConfigurationError(`Missing ${name}`)
  return value
}

function signingConfig(env: NodeJS.ProcessEnv) {
  const passTypeIdentifier = required(env, 'APPLE_WALLET_PASS_TYPE_IDENTIFIER')
  const teamIdentifier = required(env, 'APPLE_WALLET_TEAM_IDENTIFIER')
  const signerCert = required(env, 'APPLE_WALLET_SIGNER_CERT').replace(/\\n/g, '\n')
  const signerKey = required(env, 'APPLE_WALLET_SIGNER_KEY').replace(/\\n/g, '\n')
  const wwdr = required(env, 'APPLE_WALLET_WWDR_CERT').replace(/\\n/g, '\n')
  const signerKeyPassphrase = env.APPLE_WALLET_SIGNER_KEY_PASSPHRASE || undefined

  try {
    const certificate = new X509Certificate(signerCert)
    const intermediate = new X509Certificate(wwdr)
    const key = createPrivateKey({ key: signerKey, passphrase: signerKeyPassphrase })
    const subject = certificate.subject.split('\n')
    const now = Date.now()
    if (!passTypeIdentifier.startsWith('pass.') || !/^[A-Z0-9]{10}$/.test(teamIdentifier)
      || !subject.includes(`UID=${passTypeIdentifier}`)
      || !subject.includes(`OU=${teamIdentifier}`)
      || !certificate.checkPrivateKey(key)
      || !certificate.checkIssued(intermediate)
      || !certificate.verify(intermediate.publicKey)
      || [certificate, intermediate].some((cert) =>
        now < Date.parse(cert.validFrom) || now >= Date.parse(cert.validTo))) {
      throw new Error('Invalid signing identity')
    }
  } catch {
    // Never include PEMs, passwords or cryptographic library errors in responses/logs.
    throw new WalletConfigurationError('Wallet signing credentials are invalid, expired or mismatched')
  }

  return { passTypeIdentifier, teamIdentifier, certificates: { signerCert, signerKey, wwdr, signerKeyPassphrase } }
}

export async function createWalletPass(env: NodeJS.ProcessEnv = process.env) {
  const { passTypeIdentifier, teamIdentifier, certificates } = signingConfig(env)
  const assets = path.join(process.cwd(), 'lib', 'wallet', 'assets')
  const [icon, icon2x, icon3x] = await Promise.all([
    readFile(path.join(assets, 'icon.png')),
    readFile(path.join(assets, 'icon@2x.png')),
    readFile(path.join(assets, 'icon@3x.png')),
  ])
  const pass = new PKPass({ 'icon.png': icon, 'icon@2x.png': icon2x, 'icon@3x.png': icon3x }, certificates, {
    formatVersion: 1,
    passTypeIdentifier,
    teamIdentifier,
    serialNumber: 'pramit-ranjan-contact',
    organizationName: profile.name,
    description: `${profile.name} contact card`,
    logoText: profile.name,
    // Minimal baseline using the portfolio colours; visual design is a later pass.
    backgroundColor: 'rgb(13, 13, 13)',
    foregroundColor: 'rgb(255, 255, 255)',
    labelColor: 'rgb(255, 49, 32)',
    sharingProhibited: false,
  })
  pass.type = 'generic'
  pass.primaryFields.push({ key: 'name', label: 'CONTACT', value: profile.name })
  pass.secondaryFields.push({ key: 'role', label: 'ROLE', value: profile.role })
  pass.backFields.push(
    { key: 'website', label: 'WEBSITE', value: profile.website },
    { key: 'email', label: 'EMAIL', value: profile.email, dataDetectorTypes: ['PKDataDetectorTypeLink'] },
    { key: 'linkedin', label: 'LINKEDIN', value: profile.linkedin },
  )
  pass.setBarcodes({
    format: 'PKBarcodeFormatQR',
    message: profile.website,
    messageEncoding: 'iso-8859-1',
    altText: 'pramitranjan.com',
  })
  return pass.getAsBuffer()
}
