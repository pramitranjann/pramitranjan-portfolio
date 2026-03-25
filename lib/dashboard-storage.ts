export function isLocalDashboardWriteEnabled() {
  return process.env.VERCEL !== '1'
}

export function getDashboardWriteModeLabel() {
  return isLocalDashboardWriteEnabled() ? 'LOCAL FILE MODE' : 'VIEW-ONLY ON VERCEL'
}
