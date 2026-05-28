import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET() {
  const db = getDb()
  const links = db
    .prepare(
      `SELECT l.*,
              c.name  AS category_name,
              c.icon  AS category_icon,
              c.color AS category_color
       FROM links l
       LEFT JOIN categories c ON l.category_id = c.id
       ORDER BY c.sort_order, l.sort_order, l.title`
    )
    .all()
  return NextResponse.json(links)
}

export async function POST(request: NextRequest) {
  const db = getDb()
  const { title, url, description, category_id, sort_order } = await request.json()

  const result = db
    .prepare(
      'INSERT INTO links (title, url, description, category_id, sort_order) VALUES (?, ?, ?, ?, ?)'
    )
    .run(title, url, description ?? '', category_id ?? null, sort_order ?? 0)

  const link = db.prepare('SELECT * FROM links WHERE id = ?').get(result.lastInsertRowid)
  return NextResponse.json(link, { status: 201 })
}
