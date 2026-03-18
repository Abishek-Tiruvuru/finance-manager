// app/auth/page.js
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../lib/authContext'
import toast from 'react-hot-toast'

export default function AuthPage() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { user, signIn, signUp } = useAuth()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    if (user) router.push('/dashboard')
  }, [user, router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) return toast.error('Please fill in all fields')
    if (mode === 'signup' && !name.trim()) return toast.error('Please enter your name')
    if (password.length < 6) return toast.error('Password must be at least 6 characters')

    setLoading(true)
    try {
      if (mode === 'login') {
        await signIn(email, password)
        toast.success('Welcome back!')
        router.push('/dashboard')
      } else {
        await signUp(email, password, name.trim())
        toast.success('Account created! Please sign in.')
        setMode('login')
      }
    } catch (err) {
      toast.error(err.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  const particles = mounted ? [
    { w: 6, h: 6, top: '15%', left: '10%', color: 'rgba(193,232,255,0.5)', anim: 'floatA 6s ease-in-out infinite' },
    { w: 10, h: 10, top: '70%', left: '8%', color: 'rgba(125,160,202,0.35)', anim: 'floatB 8s ease-in-out infinite' },
    { w: 4, h: 4, top: '30%', right: '12%', color: 'rgba(193,232,255,0.6)', anim: 'floatC 5s ease-in-out infinite' },
    { w: 8, h: 8, top: '80%', right: '15%', color: 'rgba(84,131,179,0.45)', anim: 'floatA 7s ease-in-out infinite 1s' },
    { w: 14, h: 14, top: '50%', left: '5%', color: 'rgba(84,131,179,0.25)', anim: 'floatB 9s ease-in-out infinite 2s' },
    { w: 5, h: 5, top: '20%', right: '25%', color: 'rgba(193,232,255,0.4)', anim: 'floatC 6.5s ease-in-out infinite 0.5s' },
    { w: 7, h: 7, top: '60%', left: '20%', color: 'rgba(125,160,202,0.3)', anim: 'floatA 7.5s ease-in-out infinite 3s' },
  ] : []

  return (
    <>
      <style>{`
        @keyframes floatA {
          0%,100%{transform:translateY(0) translateX(0) scale(1)}
          33%{transform:translateY(-18px) translateX(8px) scale(1.15)}
          66%{transform:translateY(10px) translateX(-5px) scale(0.9)}
        }
        @keyframes floatB {
          0%,100%{transform:translateY(0)}
          50%{transform:translateY(-25px) translateX(12px)}
        }
        @keyframes floatC {
          0%,100%{transform:translateY(0) rotate(0deg)}
          50%{transform:translateY(-14px) rotate(180deg)}
        }
        @keyframes cardEntrance {
          0%{opacity:0;transform:perspective(900px) rotateX(10deg) translateY(40px) scale(0.97)}
          100%{opacity:1;transform:perspective(900px) rotateX(0deg) translateY(0) scale(1)}
        }
        @keyframes logoFloat {
          0%,100%{transform:perspective(400px) rotateY(-8deg) rotateX(4deg) translateY(0)}
          50%{transform:perspective(400px) rotateY(8deg) rotateX(-4deg) translateY(-6px)}
        }
        @keyframes orbPulse {
          0%,100%{transform:scale(1);opacity:0.18}
          50%{transform:scale(1.25);opacity:0.28}
        }
        @keyframes fieldSlideIn {
          0%{opacity:0;transform:translateX(-12px)}
          100%{opacity:1;transform:translateX(0)}
        }
        .card-3d {
          animation: cardEntrance 0.75s cubic-bezier(0.16,1,0.3,1) forwards;
        }
        .logo-float { animation: logoFloat 5s ease-in-out infinite; }
        .orb-pulse-1 { animation: orbPulse 4s ease-in-out infinite; }
        .orb-pulse-2 { animation: orbPulse 6s ease-in-out infinite 2s; }
        .orb-pulse-3 { animation: orbPulse 5s ease-in-out infinite 1s; }
        .field-new { animation: fieldSlideIn 0.3s ease forwards; }
        .input-3d {
          transition: all 0.2s ease;
          transform-style: preserve-3d;
        }
        .input-3d:focus {
          box-shadow: 0 8px 24px rgba(84,131,179,0.2), 0 0 0 2px rgba(193,232,255,0.18), 0 2px 0 rgba(193,232,255,0.1);
          transform: translateY(-1px);
        }
        .btn-3d {
          transform: translateY(0);
          box-shadow: 0 5px 0 rgba(2,16,36,0.6), 0 8px 24px rgba(84,131,179,0.35);
          transition: all 0.12s ease;
        }
        .btn-3d:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 8px 0 rgba(2,16,36,0.5), 0 14px 32px rgba(84,131,179,0.5);
        }
        .btn-3d:active:not(:disabled) {
          transform: translateY(2px);
          box-shadow: 0 2px 0 rgba(2,16,36,0.6), 0 4px 12px rgba(84,131,179,0.2);
        }
        .feat-card {
          transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1);
        }
        .feat-card:hover {
          transform: translateY(-6px) scale(1.04);
          box-shadow: 0 16px 40px rgba(84,131,179,0.3);
        }
        .tab-btn { transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1); }
      `}</style>

      <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #021024 0%, #052659 55%, #021024 100%)' }}>

        {/* Depth orbs */}
        <div className="orb-pulse-1 absolute top-1/4 -left-48 w-[550px] h-[550px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, #5483B3 0%, transparent 68%)', filter: 'blur(55px)' }} />
        <div className="orb-pulse-2 absolute -bottom-20 -right-48 w-[550px] h-[550px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, #7DA0CA 0%, transparent 68%)', filter: 'blur(55px)' }} />
        <div className="orb-pulse-3 absolute top-2/3 left-1/3 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, #C1E8FF 0%, transparent 70%)', filter: 'blur(70px)', opacity: 0.07 }} />

        {/* Subtle grid */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: `linear-gradient(rgba(84,131,179,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(84,131,179,0.05) 1px, transparent 1px)`,
          backgroundSize: '64px 64px',
        }} />

        {/* Floating particles */}
        {particles.map((p, i) => (
          <div key={i} className="absolute rounded-full pointer-events-none"
            style={{
              width: p.w, height: p.h,
              top: p.top, left: p.left, right: p.right,
              background: p.color,
              animation: p.anim,
              boxShadow: `0 0 ${p.w * 2}px ${p.color}`,
            }} />
        ))}

        <div className="w-full max-w-md mx-4 relative z-10">
          {/* Logo */}
          <div className="text-center mb-7">
            <div className="logo-float inline-block mb-4"
              style={{ filter: 'drop-shadow(0 16px 32px rgba(84,131,179,0.5))' }}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
                style={{
                  background: 'linear-gradient(135deg, #5483B3 0%, #C1E8FF 100%)',
                  boxShadow: '0 8px 0 rgba(2,16,36,0.4), inset 0 1px 0 rgba(255,255,255,0.25)',
                }}>
                <span className="text-2xl font-black" style={{ color: '#021024' }}>FF</span>
              </div>
            </div>
            <h1 className="text-3xl font-black gradient-text tracking-tight">FinanceFlow</h1>
            <p className="text-soft mt-1.5 text-sm">Your personal finance command center</p>
          </div>

          {/* Card */}
          <div className="card-3d"
            style={{
              background: 'rgba(5,38,89,0.55)',
              backdropFilter: 'blur(28px)',
              WebkitBackdropFilter: 'blur(28px)',
              border: '1px solid rgba(125,160,202,0.22)',
              borderRadius: '22px',
              padding: '32px',
              boxShadow: '0 40px 80px rgba(2,16,36,0.55), 0 0 0 1px rgba(193,232,255,0.04), inset 0 1px 0 rgba(255,255,255,0.07)',
            }}>

            {/* Tabs */}
            <div className="flex rounded-xl p-1 mb-6"
              style={{ background: 'rgba(2,16,36,0.65)', boxShadow: 'inset 0 2px 8px rgba(2,16,36,0.5)' }}>
              {[
                { key: 'login', label: '→ Sign In' },
                { key: 'signup', label: '✦ Create Account' },
              ].map(tab => (
                <button key={tab.key}
                  onClick={() => setMode(tab.key)}
                  className="tab-btn flex-1 py-2.5 rounded-lg text-sm font-bold"
                  style={{
                    background: mode === tab.key ? 'linear-gradient(135deg, #5483B3, #7DA0CA)' : 'transparent',
                    color: mode === tab.key ? '#021024' : '#7DA0CA',
                    boxShadow: mode === tab.key ? '0 4px 14px rgba(84,131,179,0.45)' : 'none',
                    transform: mode === tab.key ? 'scale(1.03)' : 'scale(1)',
                  }}>
                  {tab.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div className="field-new">
                  <label className="text-soft text-xs font-semibold block mb-1.5 tracking-widest uppercase">Your Name</label>
                  <input type="text" value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Arjun Sharma"
                    className="input-field input-3d"
                    autoFocus
                    required={mode === 'signup'}
                  />
                </div>
              )}

              <div>
                <label className="text-soft text-xs font-semibold block mb-1.5 tracking-widest uppercase">Email</label>
                <input type="email" value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input-field input-3d"
                  required
                />
              </div>

              <div>
                <label className="text-soft text-xs font-semibold block mb-1.5 tracking-widest uppercase">Password</label>
                <input type="password" value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field input-3d"
                  required
                />
              </div>

              <button type="submit" disabled={loading}
                className="btn-3d w-full flex items-center justify-center gap-2 mt-6 rounded-xl font-black text-sm"
                style={{
                  padding: '14px 24px',
                  background: 'linear-gradient(135deg, #5483B3 0%, #7DA0CA 100%)',
                  color: '#021024',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.85 : 1,
                }}>
                {loading
                  ? <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  : mode === 'login' ? '→ Sign In' : '✦ Create Account'
                }
              </button>
            </form>

            <p className="text-center text-xs mt-5" style={{ color: 'rgba(125,160,202,0.35)' }}>
              Connect your Supabase project for full functionality
            </p>
          </div>

          {/* Feature pills */}
          <div className="grid grid-cols-3 gap-3 mt-5">
            {[
              { icon: '🤖', label: 'AI Advisor', sub: 'Smart insights' },
              { icon: '🎯', label: 'Goals', sub: 'Track targets' },
              { icon: '🇮🇳', label: '₹ INR', sub: 'Rupee support' },
            ].map(f => (
              <div key={f.label} className="feat-card text-center p-3 rounded-2xl"
                style={{
                  background: 'rgba(5,38,89,0.45)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(125,160,202,0.15)',
                  cursor: 'default',
                }}>
                <div className="text-xl mb-1">{f.icon}</div>
                <div className="text-xs font-bold text-accent">{f.label}</div>
                <div className="text-xs mt-0.5" style={{ color: 'rgba(125,160,202,0.45)' }}>{f.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
