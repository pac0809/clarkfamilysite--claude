import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const db = getDb()
  const { name, icon, color, sort_order } = await request.json()

  db.prepare(
    'UPDATE categories SET name=?, icon=?, color=?, sort_order=? WHERE id=?'
  ).run(name, icon ?? '🔗', color ?? '#3B82F6', sort_order ?? 0, id)

  return NextResponse.json(db.prepare('SELECT * FROM categories WHERE id=?').get(id))
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  getDb().prepare('DELETE FROM categories WHERE id=?').run(id)
  return NextResponse.json({ success: true })
}
