// Centralized admin panel configuration & feature gating.
// This isolates all environment variable reads so the admin panel can be fully
// detached later. Other admin code should import only from here.

export interface AdminConfig {
  enabled: boolean
  adminEmails: string[]
  secondaryAdmins: string[]
}

function parseCsv(value: string | undefined): string[] {
  return (value || '')
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean)
}

export function getAdminConfig(): AdminConfig {
  const enabled = (process.env.NEXT_PUBLIC_ENABLE_ADMIN_PANEL || '1') === '1'
  const adminEmails = parseCsv(process.env.NEXT_PUBLIC_ADMIN_EMAILS)
  let secondaryAdmins = parseCsv(process.env.NEXT_PUBLIC_SECONDARY_ADMINS)
  if (secondaryAdmins.length === 0) secondaryAdmins = adminEmails.slice(1)
  return { enabled, adminEmails, secondaryAdmins }
}

// Convenience booleans (optional helpers)
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false
  const { adminEmails } = getAdminConfig()
  return adminEmails.includes(email.toLowerCase())
}

export function isPrimaryAdmin(email: string | null | undefined): boolean {
  if (!email) return false
  const { adminEmails } = getAdminConfig()
  return adminEmails[0] ? adminEmails[0] === email.toLowerCase() : false
}

export function isSecondaryAdmin(email: string | null | undefined): boolean {
  if (!email) return false
  const { secondaryAdmins, adminEmails } = getAdminConfig()
  const lower = email.toLowerCase()
  if (adminEmails[0] && lower === adminEmails[0]) return false
  return secondaryAdmins.includes(lower)
}
