'use client'

import { useState, useMemo } from 'react'

interface SiteLink {
  id: number
  title: string
  url: string
  description: string
  category_id: number | null
  sort_order: number
  category_name: string | null
  category_icon: string | null
  category_color: string | null
}

interface Category {
  id: number
  name: string
  icon: string
  color: string
  sort_order: number
  link_count: number
}

function getFavicon(url: string): string {
  try {
    const { hostname } = new URL(url)
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`
  } catch {
    return ''
  }
}

function LinkButton({ link }: { link: SiteLink }) {
  const [imgOk, setImgOk] = useState(true)
  const favicon = link.url !== '#' ? getFavicon(link.url) : ''
  const isReal = link.url !== '#'

  return (
    <a
      href={isReal ? link.url : undefined}
      target={isReal ? '_blank' : undefined}
      rel="noopener noreferrer"
      title={link.description || link.title}
      className={`
        inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-gray-200
        bg-white text-sm font-medium text-gray-700 select-none
        transition-all duration-150
        ${isReal
          ? 'hover:border-gray-300 hover:shadow-md hover:-translate-y-0.5 hover:text-gray-900 cursor-pointer'
          : 'opacity-40 cursor-default'}
      `}
    >
      {favicon && imgOk ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={favicon}
          alt=""
          width={14}
          height={14}
          onError={() => setImgOk(false)}
          className="w-3.5 h-3.5 flex-shrink-0"
        />
      ) : (
        <span className="text-xs">🔗</span>
      )}
      {link.title}
      {isReal && (
        <svg
          className="w-3 h-3 text-gray-300 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
          />
        </svg>
      )}
    </a>
  )
}

export default function HomeClient({
  categories,
  links,
}: {
  categories: Category[]
  links: SiteLink[]
}) {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search.trim()) return links
    const q = search.toLowerCase()
    return links.filter(
      l =>
        l.title.toLowerCase().includes(q) ||
        (l.description ?? '').toLowerCase().includes(q) ||
        l.url.toLowerCase().includes(q)
    )
  }, [links, search])

  const byCategory = useMemo(() => {
    const map = new Map<number | null, SiteLink[]>()
    for (const l of filtered) {
      if (!map.has(l.category_id)) map.set(l.category_id, [])
      map.get(l.category_id)!.push(l)
    }
    return map
  }, [filtered])

  const visibleCategories = categories.filter(c => byCategory.has(c.id))
  const uncategorized = byCategory.get(null) ?? []

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #fafafa 60%, #f0fdf4 100%)' }}>
      {/* Header */}
      <header className="bg-white/80 backdrop-blur border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900 leading-tight">Clark Family</h1>
            <p className="text-xs text-gray-400">Handy links & resources</p>
          </div>

          {/* Search */}
          <div className="relative w-64">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search…"
              className="w-full pl-9 pr-8 py-2 text-sm rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg leading-none"
              >
                ×
              </button>
            )}
          </div>

          <a href="/admin" className="text-xs text-gray-300 hover:text-gray-500 transition-colors">
            Admin
          </a>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {search && filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            No links match &ldquo;{search}&rdquo;
          </div>
        )}

        {visibleCategories.map(cat => {
          const catLinks = byCategory.get(cat.id) ?? []
          return (
            <section
              key={cat.id}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm"
            >
              <div
                className="px-5 py-3 flex items-center gap-2.5 border-b"
                style={{
                  background: cat.color + '12',
                  borderColor: cat.color + '30',
                }}
              >
                <span className="text-base">{cat.icon}</span>
                <h2 className="text-sm font-semibold text-gray-800">{cat.name}</h2>
                <span
                  className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full"
                  style={{ background: cat.color + '20', color: cat.color }}
                >
                  {catLinks.length}
                </span>
              </div>
              <div className="p-4 flex flex-wrap gap-2">
                {catLinks.map(l => (
                  <LinkButton key={l.id} link={l} />
                ))}
              </div>
            </section>
          )
        })}

        {uncategorized.length > 0 && (
          <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="px-5 py-3 flex items-center gap-2.5 border-b border-gray-100 bg-gray-50">
              <span className="text-base">🔗</span>
              <h2 className="text-sm font-semibold text-gray-800">Other</h2>
              <span className="ml-auto text-xs text-gray-400">{uncategorized.length}</span>
            </div>
            <div className="p-4 flex flex-wrap gap-2">
              {uncategorized.map(l => (
                <LinkButton key={l.id} link={l} />
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="text-center py-6 text-xs text-gray-300">
        Clark Family · {new Date().getFullYear()}
      </footer>
    </div>
  )
}
