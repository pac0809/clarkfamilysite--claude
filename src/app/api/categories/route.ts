import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET() {
  const db = getDb()
  const categories = db
    .prepare(
      `SELECT c.*, COUNT(l.id) AS link_count
       FROM categories c
       LEFT JOIN links l ON l.category_id = c.id
       GROUP BY c.id
       ORDER BY c.sort_order, c.name`
    )
    .all()
  return NextResponse.json(categories)
}

export async function POST(request: NextRequest) {
  const db = getDb()
  const { name, icon, color, sort_order } = await request.json()

  const result = db
    .prepare('INSERT INTO categories (name, icon, color, sort_order) VALUES (?, ?, ?, ?)')
    .run(name, icon ?? '🔗', color ?? '#3B82F6', sort_order ?? 0)

  const category = db.prepare('SELECT * FROM categories WHERE id=?').get(result.lastInsertRowid)
  return NextResponse.json(category, { status: 201 })
}
