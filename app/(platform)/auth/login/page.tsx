'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

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
    <main className="min-h-screen bg-dark-navy flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {IS_DEMO && (
          <div className="mb-4 bg-brand-blue/10 border border-brand-blue/40 rounded-xl px-5 py-4">
            <p className="text-brand-blue text-xs font-barlow font-semibold uppercase tracking-widest mb-1">
              Ambiente de Demonstração
            </p>
            <p className="text-white/70 text-sm font-barlow">
              Clique em <span className="text-white font-semibold">Sign In</span> para acessar o painel — nenhuma senha real é necessária neste preview.
            </p>
          </div>
        )}

        <div className="bg-navy rounded-2xl p-8 shadow-2xl border border-white/10">
          <div className="flex flex-col items-center text-center mb-8">
            <Image
              src="/images/logo-horizontal-white.png"
              alt="4Rivers Realty"
              width={220}
              height={64}
              className="h-14 w-auto object-contain mb-4"
              priority
            />
            <p className="font-barlow text-brand-blue text-xs font-semibold uppercase tracking-[0.25em]">
              Admin Access
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="font-barlow text-white text-sm font-medium block mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                readOnly={IS_DEMO}
                className="w-full bg-dark-navy border border-white/20 rounded-lg px-4 py-2.5 text-white font-barlow placeholder-white/40 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue disabled:opacity-60"
              />
            </div>
            <div>
              <label className="font-barlow text-white text-sm font-medium block mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                readOnly={IS_DEMO}
                className="w-full bg-dark-navy border border-white/20 rounded-lg px-4 py-2.5 text-white font-barlow placeholder-white/40 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue disabled:opacity-60"
              />
            </div>
            {error && <p className="font-barlow text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-blue text-dark-navy font-barlow font-semibold py-2.5 rounded-lg hover:bg-light-blue disabled:opacity-50 transition-colors"
            >
              {loading ? 'Signing in…' : IS_DEMO ? 'Access Demo →' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
