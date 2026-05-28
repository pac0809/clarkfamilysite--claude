'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface SiteLink {
  id: number
  title: string
  url: string
  description: string
  category_id: number | null
  sort_order: number
}

interface Category {
  id: number
  name: string
  icon: string
  color: string
  sort_order: number
  link_count: number
}

type Tab = 'links' | 'categories'

const EMPTY_LINK  = { title: '', url: 'https://', description: '', category_id: null as number | null, sort_order: 0 }
const EMPTY_CAT   = { name: '', icon: '🔗', color: '#3B82F6', sort_order: 0 }

// ── Small reusable input ────────────────────────────────────────────────────
function Field({
  label, children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      {children}
    </div>
  )
}

const inputCls =
  'w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-blue-300 focus:ring-2 focus:ring-blue-100 outline-none transition-all'

export default function AdminPage() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('links')
  const [links, setLinks] = useState<SiteLink[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  // Link form state
  const [showLinkForm, setShowLinkForm] = useState(false)
  const [editingLink, setEditingLink] = useState<SiteLink | null>(null)
  const [lf, setLf] = useState(EMPTY_LINK)

  // Category form state
  const [showCatForm, setShowCatForm] = useState(false)
  const [editingCat, setEditingCat] = useState<Category | null>(null)
  const [cf, setCf] = useState(EMPTY_CAT)

  const fetchAll = useCallback(async () => {
    const [lr, cr] = await Promise.all([fetch('/api/links'), fetch('/api/categories')])
    if (lr.status === 401 || cr.status === 401) { router.push('/admin/login'); return }
    setLinks(await lr.json())
    setCategories(await cr.json())
    setLoading(false)
  }, [router])

  useEffect(() => { fetchAll() }, [fetchAll])

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  // ── Links ────────────────────────────────────────────────────────────────
  function openAddLink() {
    setEditingLink(null)
    setLf(EMPTY_LINK)
    setShowLinkForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function openEditLink(l: SiteLink) {
    setEditingLink(l)
    setLf({ title: l.title, url: l.url, description: l.description, category_id: l.category_id, sort_order: l.sort_order })
    setShowLinkForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function saveLink(e: React.FormEvent) {
    e.preventDefault()
    const method = editingLink ? 'PUT' : 'POST'
    const url    = editingLink ? `/api/links/${editingLink.id}` : '/api/links'
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(lf) })
    setShowLinkForm(false)
    fetchAll()
  }

  async function deleteLink(id: number) {
    if (!confirm('Delete this link?')) return
    await fetch(`/api/links/${id}`, { method: 'DELETE' })
    fetchAll()
  }

  // ── Categories ───────────────────────────────────────────────────────────
  function openAddCat() {
    setEditingCat(null)
    setCf(EMPTY_CAT)
    setShowCatForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function openEditCat(c: Category) {
    setEditingCat(c)
    setCf({ name: c.name, icon: c.icon, color: c.color, sort_order: c.sort_order })
    setShowCatForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function saveCat(e: React.FormEvent) {
    e.preventDefault()
    const method = editingCat ? 'PUT' : 'POST'
    const url    = editingCat ? `/api/categories/${editingCat.id}` : '/api/categories'
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cf) })
    setShowCatForm(false)
    fetchAll()
  }

  async function deleteCat(id: number) {
    if (!confirm('Delete this category? Its links will become uncategorized.')) return
    await fetch(`/api/categories/${id}`, { method: 'DELETE' })
    fetchAll()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400 text-sm">
        Loading…
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900">Clark Family</span>
            <span className="text-gray-300 text-sm">/ Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="/" className="text-sm text-gray-500 hover:text-gray-800 transition-colors">
              ← View Site
            </a>
            <button onClick={logout} className="text-sm text-red-500 hover:text-red-700 transition-colors">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Tab Bar */}
        <div className="inline-flex bg-gray-100 rounded-xl p-1 mb-6">
          {(['links', 'categories'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                tab === t ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t === 'links' ? `Links (${links.length})` : `Categories (${categories.length})`}
            </button>
          ))}
        </div>

        {/* ─── LINKS TAB ─────────────────────────────────────────────────── */}
        {tab === 'links' && (
          <div className="space-y-4">
            {showLinkForm && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-5">
                  {editingLink ? 'Edit Link' : 'New Link'}
                </h3>
                <form onSubmit={saveLink}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <Field label="Title *">
                      <input required value={lf.title}
                        onChange={e => setLf(f => ({ ...f, title: e.target.value }))}
                        className={inputCls} placeholder="Bank Australia" />
                    </Field>
                    <Field label="URL *">
                      <input required value={lf.url}
                        onChange={e => setLf(f => ({ ...f, url: e.target.value }))}
                        className={inputCls} placeholder="https://..." />
                    </Field>
                    <Field label="Category">
                      <select
                        value={lf.category_id ?? ''}
                        onChange={e => setLf(f => ({ ...f, category_id: e.target.value ? Number(e.target.value) : null }))}
                        className={inputCls}
                      >
                        <option value="">— Uncategorized —</option>
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Description (tooltip)">
                      <input value={lf.description}
                        onChange={e => setLf(f => ({ ...f, description: e.target.value }))}
                        className={inputCls} placeholder="Optional short description" />
                    </Field>
                    <Field label="Sort Order">
                      <input type="number" value={lf.sort_order}
                        onChange={e => setLf(f => ({ ...f, sort_order: Number(e.target.value) }))}
                        className={inputCls} />
                    </Field>
                  </div>
                  <div className="flex justify-end gap-3">
                    <button type="button" onClick={() => setShowLinkForm(false)}
                      className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">
                      Cancel
                    </button>
                    <button type="submit"
                      className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                      {editingLink ? 'Save Changes' : 'Add Link'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Links</h2>
              {!showLinkForm && (
                <button onClick={openAddLink}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                  + Add Link
                </button>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              {links.length === 0 ? (
                <p className="text-center py-12 text-gray-400">No links yet.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-gray-500">Title</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500 hidden sm:table-cell">URL</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Category</th>
                      <th className="px-4 py-3 w-28" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {links.map(l => {
                      const cat = categories.find(c => c.id === l.category_id)
                      return (
                        <tr key={l.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 font-medium text-gray-900">{l.title}</td>
                          <td className="px-4 py-3 hidden sm:table-cell">
                            <a href={l.url} target="_blank" rel="noopener noreferrer"
                              className="text-blue-500 hover:underline truncate block max-w-xs">
                              {l.url}
                            </a>
                          </td>
                          <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                            {cat ? `${cat.icon} ${cat.name}` : '—'}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-3 justify-end">
                              <button onClick={() => openEditLink(l)}
                                className="text-gray-400 hover:text-blue-600 text-xs font-medium transition-colors">
                                Edit
                              </button>
                              <button onClick={() => deleteLink(l.id)}
                                className="text-gray-400 hover:text-red-600 text-xs font-medium transition-colors">
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ─── CATEGORIES TAB ────────────────────────────────────────────── */}
        {tab === 'categories' && (
          <div className="space-y-4">
            {showCatForm && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-5">
                  {editingCat ? 'Edit Category' : 'New Category'}
                </h3>
                <form onSubmit={saveCat}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <Field label="Name *">
                      <input required value={cf.name}
                        onChange={e => setCf(f => ({ ...f, name: e.target.value }))}
                        className={inputCls} placeholder="Banking & Finance" />
                    </Field>
                    <Field label="Icon (emoji)">
                      <input value={cf.icon}
                        onChange={e => setCf(f => ({ ...f, icon: e.target.value }))}
                        className={inputCls} placeholder="🏦" />
                    </Field>
                    <Field label="Accent Color">
                      <div className="flex gap-2">
                        <input type="color" value={cf.color}
                          onChange={e => setCf(f => ({ ...f, color: e.target.value }))}
                          className="h-[38px] w-14 rounded-lg border border-gray-200 cursor-pointer p-0.5" />
                        <input value={cf.color}
                          onChange={e => setCf(f => ({ ...f, color: e.target.value }))}
                          className={inputCls + ' font-mono'} placeholder="#3B82F6" />
                      </div>
                    </Field>
                    <Field label="Sort Order">
                      <input type="number" value={cf.sort_order}
                        onChange={e => setCf(f => ({ ...f, sort_order: Number(e.target.value) }))}
                        className={inputCls} />
                    </Field>
                  </div>
                  <div className="flex justify-end gap-3">
                    <button type="button" onClick={() => setShowCatForm(false)}
                      className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">
                      Cancel
                    </button>
                    <button type="submit"
                      className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                      {editingCat ? 'Save Changes' : 'Add Category'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Categories</h2>
              {!showCatForm && (
                <button onClick={openAddCat}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                  + Add Category
                </button>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              {categories.length === 0 ? (
                <p className="text-center py-12 text-gray-400">No categories yet.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-gray-500">Category</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500 hidden sm:table-cell">Color</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500">Links</th>
                      <th className="px-4 py-3 w-28" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {categories.map(c => (
                      <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <span className="font-medium text-gray-900">{c.icon} {c.name}</span>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full border border-gray-200"
                              style={{ background: c.color }} />
                            <span className="font-mono text-xs text-gray-500">{c.color}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-500">{c.link_count}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-3 justify-end">
                            <button onClick={() => openEditCat(c)}
                              className="text-gray-400 hover:text-blue-600 text-xs font-medium transition-colors">
                              Edit
                            </button>
                            <button onClick={() => deleteCat(c.id)}
                              className="text-gray-400 hover:text-red-600 text-xs font-medium transition-colors">
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
