import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const db = getDb()
  const { title, url, description, category_id, sort_order } = await request.json()

  db.prepare(
    'UPDATE links SET title=?, url=?, description=?, category_id=?, sort_order=? WHERE id=?'
  ).run(title, url, description ?? '', category_id ?? null, sort_order ?? 0, id)

  return NextResponse.json(db.prepare('SELECT * FROM links WHERE id=?').get(id))
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  getDb().prepare('DELETE FROM links WHERE id=?').run(id)
  return NextResponse.json({ success: true })
}
