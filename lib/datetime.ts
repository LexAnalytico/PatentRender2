// Centralized date/time formatting utilities for consistent IST display across emails, invoices & UI.
// We intentionally keep dependencies minimal (Intl only) for Node/Edge portability.

export interface FormatISTOptions {
  pattern?: Intl.DateTimeFormatOptions
  fallback?: string
  assumeNaiveUTC?: boolean // if true, naive strings are treated as UTC (append Z)
}

const DEFAULT_INVOICE_PATTERN: Intl.DateTimeFormatOptions = {
  timeZone: 'Asia/Kolkata',
  year: 'numeric',
  month: 'numeric', // numeric gives M/D/YYYY style like invoice example
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  second: '2-digit',
  hour12: true,
}

// Generic formatter (handles Date | string | number) and normalizes naive timestamps.
export function formatIST(value: string | number | Date | null | undefined, opts: FormatISTOptions = {}): string {
  if (value === null || value === undefined || value === '') return opts.fallback ?? '—'
  let d: Date
  if (value instanceof Date) d = value
  else if (typeof value === 'number') d = new Date(value)
  else {
    const raw = value.trim()
    if (!raw) return opts.fallback ?? '—'
    const hasTZ = /Z|[+\-]\d\d:?\d\d$/.test(raw)
    if (!hasTZ && opts.assumeNaiveUTC) {
      d = new Date(raw + 'Z')
    } else {
      d = new Date(raw)
    }
  }
  if (isNaN(d.getTime())) return opts.fallback ?? 'Invalid Date'
  const pattern = opts.pattern || DEFAULT_INVOICE_PATTERN
  return new Intl.DateTimeFormat('en-IN', pattern).format(d)
}

// Opinionated invoice format wrapper (matches: 10/5/2025, 4:49:08 PM from your example).
export function formatISTInvoice(value: string | number | Date | null | undefined): string {
  return formatIST(value, { pattern: DEFAULT_INVOICE_PATTERN })
}

// ISO-like 24h diagnostic variant (useful for EMAIL_DEBUG_TIMES)
export function formatISTDebug(value: string | number | Date | null | undefined): string {
  return formatIST(value, {
    pattern: {
      timeZone: 'Asia/Kolkata',
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
    }
  })
}
