import { getDb } from '@/lib/db'
import HomeClient from '@/components/HomeClient'

export const dynamic = 'force-dynamic'

export default function Home() {
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

  return <HomeClient categories={categories as never} links={links as never} />
}
