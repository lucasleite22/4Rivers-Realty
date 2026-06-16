'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const IS_DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState(IS_DEMO ? 'demo@4riversrealty.com' : '')
  const [password, setPassword] = useState(IS_DEMO ? 'demo' : '')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Login failed')
      }
      router.push('/admin')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-dark flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {IS_DEMO && (
          <div className="mb-4 bg-cyan-brand/10 border border-cyan-brand/40 rounded-xl px-5 py-4">
            <p className="text-cyan-brand text-xs font-barlow font-semibold uppercase tracking-widest mb-1">
              Ambiente de Demonstração
            </p>
            <p className="text-white/70 text-sm font-barlow">
              Clique em <span className="text-white font-semibold">Sign In</span> para acessar o painel — nenhuma senha real é necessária neste preview.
            </p>
          </div>
        )}

        <div className="bg-navy rounded-2xl p-8">
          <h1 className="font-cormorant text-3xl text-white mb-1">4Rivers</h1>
          <p className="font-barlow text-cyan-brand text-sm mb-8">Admin Access</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="font-barlow text-white/70 text-sm block mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                readOnly={IS_DEMO}
                className="w-full bg-dark border border-white/10 rounded-lg px-4 py-2 text-white font-barlow focus:outline-none focus:border-cyan-brand disabled:opacity-60"
              />
            </div>
            <div>
              <label className="font-barlow text-white/70 text-sm block mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                readOnly={IS_DEMO}
                className="w-full bg-dark border border-white/10 rounded-lg px-4 py-2 text-white font-barlow focus:outline-none focus:border-cyan-brand disabled:opacity-60"
              />
            </div>
            {error && <p className="font-barlow text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cyan-brand text-dark font-barlow font-semibold py-2 rounded-lg hover:opacity-90 disabled:opacity-50 transition"
            >
              {loading ? 'Signing in…' : IS_DEMO ? 'Access Demo →' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
