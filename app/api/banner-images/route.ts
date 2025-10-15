import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// Ensure Node.js runtime on Vercel so fs is available
export const runtime = 'nodejs'
// Avoid static rendering/caching mishaps for dynamic file listings
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const pubDir = path.join(process.cwd(), 'public', 'banners')
    const altDir = path.join(process.cwd(), 'app', 'api', 'banner-images') // fallback: user may have dropped files here

    const readFiles = (dirPath: string): string[] => {
      try {
        return fs
          .readdirSync(dirPath, { withFileTypes: true })
          .filter((d: any) => (typeof d.isFile === 'function' ? d.isFile() : false))
          .map((d: any) => d.name)
      } catch {
        return []
      }
    }

    const allowed = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'])
    const pubFiles = readFiles(pubDir).filter((f) => allowed.has(path.extname(f).toLowerCase()))
    const altFiles = readFiles(altDir)
      .filter((f) => f !== 'route.ts' && allowed.has(path.extname(f).toLowerCase()))

    // Deduplicate by preferring public over alt
    const seen = new Set<string>()
    const results: Array<{ url: string; filename: string }> = []
    ;[...pubFiles.sort(), ...altFiles.sort()].forEach((f) => {
      if (seen.has(f)) return
      seen.add(f)
      const fromPublic = pubFiles.includes(f)
      results.push({
        url: fromPublic ? `/banners/${encodeURIComponent(f)}` : `/api/banner-images/file/${encodeURIComponent(f)}`,
        filename: f,
      })
    })

    return NextResponse.json({ images: results })
  } catch (e) {
    return NextResponse.json({ images: [] }, { status: 200 })
  }
}
