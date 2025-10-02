import { supabase } from '@/lib/supabase'

// Allowed mime types for drawings / figures
export const ALLOWED_MIME = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/svg+xml'
]

export const MAX_FILE_BYTES = 10 * 1024 * 1024 // 10MB

// Sanitize filename (basic)
export function sanitizeFilename(name: string) {
  return name.replace(/[^A-Za-z0-9._-]+/g, '_').slice(0, 120)
}

// Build storage path figures/<user>/<order-or-misc>/<uuid>-<filename>
export function buildFigurePath(userId: string, orderId: number | null, file: File) {
  const base = `figures/${userId}/${orderId != null ? orderId : 'misc'}`
  const uuidPart = crypto.randomUUID()
  return `${base}/${uuidPart}-${sanitizeFilename(file.name)}`
}

export async function uploadFigure(userId: string, orderId: number | null, file: File) {
  const path = buildFigurePath(userId, orderId, file)
  const { data, error } = await supabase.storage.from('figures').upload(path, file, {
    upsert: false,
    contentType: file.type || undefined,
  })
  if (error) {
    // Provide clearer guidance if bucket missing
    if ((error as any)?.message && /Not Found|bucket/i.test((error as any).message)) {
      (error as any).message = `Storage bucket 'figures' not found. Create it in Supabase dashboard or via SQL: \nINSERT INTO storage.buckets (id, name, public) VALUES ('figures','figures', false);`
    }
    throw error
  }
  return { path, data }
}

export async function deleteFigure(storagePath: string) {
  if (!storagePath) return { error: new Error('No storage path provided') }
  const { error } = await supabase.storage.from('figures').remove([storagePath])
  return { error }
}
