'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Users, Building2, LogOut, Menu, InboxIcon } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)

  // Fetch pending seller submissions count
  useEffect(() => {
    fetch('/api/leads?type=SELLER&status=NEW_LEAD&limit=1')
      .then((r) => r.json())
      .then((d) => setPendingCount(d.meta?.total ?? 0))
      .catch(() => {})
  }, [])

  function isActive(href: string) {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/auth/login')
  }

  const navItems = [
    { href: '/admin',             label: 'Dashboard',    icon: LayoutDashboard, badge: 0 },
    { href: '/admin/leads',       label: 'CRM / Leads',  icon: Users,           badge: 0 },
    { href: '/admin/submissions', label: 'Submissions',  icon: InboxIcon,       badge: pendingCount },
    { href: '/admin/properties',  label: 'Properties',   icon: Building2,       badge: 0 },
  ]

  const Sidebar = () => (
    <aside className="flex flex-col h-full bg-[#07162b] border-r border-white/10 w-64">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/10">
        <Link href="/admin" className="flex flex-col leading-none">
          <span className="font-cormorant font-bold text-2xl text-white tracking-wide">
            4Rivers
          </span>
          <span className="font-barlow text-xs font-semibold tracking-[0.2em] uppercase text-cyan-400">
            Admin
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {navItems.map(({ href, label, icon: Icon, badge }) => {
          const active = isActive(href)
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-barlow text-sm font-medium transition-colors ${
                active
                  ? 'bg-cyan-500/15 text-cyan-400'
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{label}</span>
              {badge > 0 && (
                <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-cyan-500 text-dark font-barlow text-xs font-bold flex items-center justify-center">
                  {badge > 99 ? '99+' : badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white/10 space-y-1">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 rounded-lg font-barlow text-sm text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors"
        >
          ← View Site
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-barlow text-sm text-white/40 hover:text-red-400 hover:bg-red-400/5 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  )

  return (
    <div className="flex h-screen bg-[#0a1929] overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex flex-col w-64 z-10">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile topbar */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#07162b] border-b border-white/10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-white/60 hover:text-white p-1"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-cormorant font-bold text-white text-lg">4Rivers Admin</span>
          <div className="w-7" />
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
