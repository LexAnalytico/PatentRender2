import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(
  _request: Request,
  { params }: { params: { name: string } }
) {
  try {
    const { name } = params
    const filePath = path.join(process.cwd(), 'app', 'api', 'banner-images', name)
    if (!fs.existsSync(filePath)) {
      return new NextResponse('Not Found', { status: 404 })
    }
    const ext = path.extname(name).toLowerCase()
    const mime =
      ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' :
      ext === '.png' ? 'image/png' :
      ext === '.webp' ? 'image/webp' :
      ext === '.gif' ? 'image/gif' :
      ext === '.svg' ? 'image/svg+xml' :
      'application/octet-stream'
    const buf = fs.readFileSync(filePath)
    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Type': mime,
        'Cache-Control': 'public, max-age=60',
      },
    })
  } catch (e) {
    return new NextResponse('Error', { status: 500 })
  }
}
