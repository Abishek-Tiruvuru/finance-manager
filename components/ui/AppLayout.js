// components/ui/AppLayout.js
// Shared sidebar layout with 3D hover effects and animated nav

'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '../../lib/authContext'
import toast from 'react-hot-toast'
import TransactionModal from './TransactionModal'

const navItems = [
  { href: '/dashboard', emoji: '📊', label: 'Dashboard' },
  { href: '/history', emoji: '📋', label: 'History' },
  { href: '/analytics', emoji: '📈', label: 'Analytics' },
  { href: '/settings', emoji: '⚙️', label: 'Settings' },
]

export default function AppLayout({ children, onTransactionAdded }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, signOut, getDisplayName } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showModal, setShowModal] = useState(false)

  const handleSignOut = async () => {
    try { await signOut(); router.push('/auth'); toast.success('Signed out') }
    catch { toast.error('Sign out failed') }
  }

  const displayName = getDisplayName?.() || user?.email?.split('@')[0] || 'User'
  const initial = displayName[0]?.toUpperCase() || 'U'

  return (
    <>
      <style>{`
        @keyframes sidebarIn {
          0%{opacity:0;transform:perspective(800px) rotateY(-8deg) translateX(-20px)}
          100%{opacity:1;transform:perspective(800px) rotateY(0deg) translateX(0)}
        }
        @keyframes addBtnPulse {
          0%,100%{box-shadow:0 5px 0 rgba(2,16,36,0.5),0 8px 24px rgba(84,131,179,0.35)}
          50%{box-shadow:0 5px 0 rgba(2,16,36,0.5),0 8px 32px rgba(193,232,255,0.45)}
        }
        @keyframes navItemIn {
          0%{opacity:0;transform:translateX(-14px)}
          100%{opacity:1;transform:translateX(0)}
        }
        .nav-item {
          transition: all 0.22s cubic-bezier(0.34,1.56,0.64,1);
          transform-style: preserve-3d;
        }
        .nav-item:hover {
          transform: translateX(3px) scale(1.02);
        }
        .add-btn {
          transition: all 0.18s cubic-bezier(0.34,1.56,0.64,1);
          transform: translateY(0);
          box-shadow: 0 5px 0 rgba(2,16,36,0.5), 0 8px 24px rgba(84,131,179,0.35);
          animation: addBtnPulse 3s ease-in-out infinite;
        }
        .add-btn:hover {
          transform: translateY(-3px) scale(1.03);
          box-shadow: 0 8px 0 rgba(2,16,36,0.45), 0 16px 36px rgba(84,131,179,0.55) !important;
          animation: none;
        }
        .add-btn:active {
          transform: translateY(2px) scale(0.97);
        }
        .sidebar-main {
          animation: sidebarIn 0.6s cubic-bezier(0.16,1,0.3,1) forwards;
        }
        .avatar-btn {
          transition: all 0.22s cubic-bezier(0.34,1.56,0.64,1);
        }
        .avatar-btn:hover {
          transform: scale(1.08) translateY(-1px);
          box-shadow: 0 6px 20px rgba(84,131,179,0.4);
        }
      `}</style>

      <div className="flex min-h-screen" style={{ background: '#021024' }}>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-20 lg:hidden"
            style={{ background: 'rgba(2,16,36,0.82)', backdropFilter: 'blur(6px)' }}
            onClick={() => setSidebarOpen(false)} />
        )}

        {/* Sidebar */}
        <aside className={`
          fixed top-0 left-0 h-full z-30 w-64 flex flex-col
          transform transition-transform duration-300 sidebar-main
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
        `}
          style={{
            background: 'linear-gradient(180deg, rgba(5,38,89,0.98) 0%, rgba(2,16,36,0.99) 100%)',
            borderRight: '1px solid rgba(125,160,202,0.12)',
            boxShadow: '8px 0 40px rgba(2,16,36,0.5)',
          }}>

          {/* Logo area */}
          <div className="p-6 border-b" style={{ borderColor: 'rgba(125,160,202,0.1)' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black text-primary flex-shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #5483B3, #C1E8FF)',
                  boxShadow: '0 4px 0 rgba(2,16,36,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
                }}>
                FF
              </div>
              <div>
                <h1 className="font-black text-accent text-sm tracking-tight">FinanceFlow</h1>
                <p className="text-xs" style={{ color: 'rgba(125,160,202,0.45)' }}>Personal Finance</p>
              </div>
            </div>
          </div>

          {/* Add Transaction */}
          <div className="p-4">
            <button
              onClick={() => { setShowModal(true); setSidebarOpen(false) }}
              className="add-btn w-full py-3 rounded-xl text-sm font-black text-primary flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #5483B3, #7DA0CA)', border: 'none', cursor: 'pointer' }}>
              <span className="text-base font-black">+</span>
              Add Transaction
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-2 space-y-0.5">
            {navItems.map((item, idx) => {
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`nav-item flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                    isActive ? 'sidebar-active' : 'text-soft hover:text-accent'
                  }`}
                  style={{
                    animationDelay: `${idx * 0.06}s`,
                    ...(isActive ? {} : {}),
                  }}>
                  <span className="text-base">{item.emoji}</span>
                  <span>{item.label}</span>
                  {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#C1E8FF' }} />}
                </Link>
              )
            })}
          </nav>

          {/* User footer */}
          <div className="p-4 border-t" style={{ borderColor: 'rgba(125,160,202,0.1)' }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="avatar-btn w-9 h-9 rounded-full flex items-center justify-center text-xs font-black text-primary flex-shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #5483B3, #C1E8FF)',
                  boxShadow: '0 3px 0 rgba(2,16,36,0.4)',
                  cursor: 'default',
                }}>
                {initial}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-accent truncate">{displayName}</p>
                <p className="text-xs truncate" style={{ color: 'rgba(125,160,202,0.45)' }}>{user?.email}</p>
              </div>
            </div>
            <button onClick={handleSignOut}
              className="w-full py-2 rounded-xl text-xs font-medium text-soft hover:text-accent transition-all hover:bg-red-400/10"
              style={{ background: 'rgba(2,16,36,0.4)', border: '1px solid rgba(125,160,202,0.1)', cursor: 'pointer' }}>
              🚪 Sign Out
            </button>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile header */}
          <header className="flex items-center justify-between px-4 py-3 lg:hidden border-b"
            style={{ borderColor: 'rgba(125,160,202,0.12)', background: 'rgba(5,38,89,0.9)', backdropFilter: 'blur(12px)' }}>
            <button onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-soft hover:text-accent transition-colors p-1">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span className="font-black text-accent text-sm">FinanceFlow</span>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-primary"
              style={{ background: 'linear-gradient(135deg, #5483B3, #C1E8FF)' }}>
              {initial}
            </div>
          </header>

          <main className="flex-1 overflow-auto p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>

      {showModal && (
        <TransactionModal
          onClose={() => setShowModal(false)}
          onSuccess={(t) => {
            setShowModal(false)
            if (onTransactionAdded) onTransactionAdded(t)
          }}
        />
      )}
    </>
  )
}
