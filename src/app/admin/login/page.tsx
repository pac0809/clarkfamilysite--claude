'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    if (res.ok) {
      router.push('/admin')
      router.refresh()
    } else {
      setError('Incorrect password. Try again.')
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #fafafa 60%, #f0fdf4 100%)' }}
    >
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🏠</div>
          <h1 className="text-2xl font-bold text-gray-900">Clark Family</h1>
          <p className="text-gray-400 text-sm mt-1">Admin panel</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter admin password"
              autoFocus
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm
                         focus:border-blue-300 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
                       text-white font-medium py-2.5 rounded-lg transition-colors text-sm"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="/" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
            ← Back to site
          </a>
        </div>
      </div>
    </div>
  )
}
