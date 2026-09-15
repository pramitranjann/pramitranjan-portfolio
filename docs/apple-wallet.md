# Apple Wallet contact card

`GET /api/wallet` returns a signed `pramit-ranjan.pkpass`. No page or button has
been added. Later, link an Add to Apple Wallet button directly to this route
(normal navigation, not a fetch/blob download). Safari opens Apple's Add flow.

The pass contains the public contact details already used on `/tap`, a website
QR code, and the existing PR favicon treatment at Wallet's 30/60/90px sizes.
Content and basic styling live in `lib/wallet/pass.ts`; PNGs live beside it in
`assets/`. This baseline is functional, not a finished card design.

## One-time signing setup

Use an Apple Developer account with access to Certificates, Identifiers & Profiles:

1. Register a Pass Type ID (suggested: `pass.com.pramitranjan.contact`).
2. Create a certificate signing request in Keychain Access, then issue a Pass
   Type ID certificate for that identifier in the developer portal.
3. Export the certificate and matching private key as PEM. Download the matching
   Apple Worldwide Developer Relations intermediate certificate from Apple PKI
   (Apple currently uses G4 for Pass Type ID signing), and convert it to PEM if
   downloaded as DER: `openssl x509 -inform DER -in AppleWWDRCAG4.cer -out wwdr.pem`.
4. Add these server-only environment variables to `.env.local` for development
   and the deployment environment when ready. Never use a `NEXT_PUBLIC_` prefix.

| Variable | Value |
| --- | --- |
| `APPLE_WALLET_PASS_TYPE_IDENTIFIER` | Registered Pass Type ID, matching certificate UID |
| `APPLE_WALLET_TEAM_IDENTIFIER` | 10-character Apple Team ID, matching certificate OU |
| `APPLE_WALLET_SIGNER_CERT` | Full PEM signing certificate |
| `APPLE_WALLET_SIGNER_KEY` | Full PEM matching private key |
| `APPLE_WALLET_WWDR_CERT` | Full PEM Apple intermediate certificate |
| `APPLE_WALLET_SIGNER_KEY_PASSPHRASE` | Optional password for an encrypted private key |

PEM values accept real newlines or literal `\n` sequences. Keep keys and passwords
in local environment files or the host's secret settings, never in public assets,
source control, chat or screenshots. Builds work without credentials; downloads
return a generic, uncached 503 until valid signing configuration exists.

## Verification and release

- `npm run test:wallet` (Node 22.18+, OpenSSL and unzip) checks error handling, archive contents, manifest hashes,
  detached signature and stable pass identity using temporary test certificates.
  Those certificates are not trusted by Apple and cannot prove iPhone acceptance.
- `npm run build` checks the Next.js route and production build.
- With real credentials configured, open `/api/wallet` in iPhone Safari, add the
  pass, confirm the QR destination and details links, and download again to check
  it uses the same card identity. This device check remains required.

All recipients save the same public card identity. There is no visitor database,
personalization, push-update service, or NFC payment/access capability. Editing
the template affects future downloads; existing saved passes do not update
automatically. Keep the serial number and Pass Type ID stable when revising it.
Renew the signing certificate before expiry; the endpoint rejects expired
certificates. No deployment or certificate account changes are part of this implementation.

References: [Apple setup](https://developer.apple.com/help/account/capabilities/create-wallet-identifiers-and-certificates),
[Apple PKI](https://www.apple.com/certificateauthority/),
[passkit-generator](https://github.com/alexandercerutti/passkit-generator).
