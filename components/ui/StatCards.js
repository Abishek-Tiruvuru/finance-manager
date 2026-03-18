// components/ui/StatCards.js
// 3D animated summary cards - balance, income, expenses, savings rate

'use client'
import { useEffect, useRef, useState } from 'react'
import { formatCurrency, savingsRate } from '../../utils/helpers'

// Animated number counter
function CountUp({ value, duration = 1100, prefix = '', suffix = '' }) {
  const [current, setCurrent] = useState(0)
  const animRef = useRef(null)
  useEffect(() => {
    const start = Date.now()
    const startVal = 0
    const animate = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCurrent(startVal + (value - startVal) * eased)
      if (progress < 1) animRef.current = requestAnimationFrame(animate)
    }
    animRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animRef.current)
  }, [value, duration])
  return <>{prefix}{current >= 1000 ? current.toLocaleString('en-IN', { maximumFractionDigits: 0 }) : current.toFixed(current < 10 ? 1 : 0)}{suffix}</>
}

const CARDS = [
  {
    key: 'balance',
    label: 'Net Balance',
    icon: '💎',
    gradient: 'linear-gradient(145deg, rgba(5,38,89,0.9), rgba(84,131,179,0.3))',
    border: 'rgba(84,131,179,0.4)',
    glow: 'rgba(84,131,179,0.18)',
    bottomBorder: '#5483B3',
  },
  {
    key: 'income',
    label: 'Total Income',
    icon: '↑',
    gradient: 'linear-gradient(145deg, rgba(5,38,89,0.85), rgba(75,192,192,0.12))',
    border: 'rgba(75,192,192,0.32)',
    glow: 'rgba(75,192,192,0.12)',
    color: '#4BC0C0',
    bottomBorder: '#4BC0C0',
  },
  {
    key: 'expenses',
    label: 'Total Expenses',
    icon: '↓',
    gradient: 'linear-gradient(145deg, rgba(5,38,89,0.85), rgba(255,99,132,0.12))',
    border: 'rgba(255,99,132,0.32)',
    glow: 'rgba(255,99,132,0.12)',
    color: '#FF6384',
    bottomBorder: '#FF6384',
  },
  {
    key: 'savings',
    label: 'Savings Rate',
    icon: '🏦',
    gradient: 'linear-gradient(145deg, rgba(5,38,89,0.85), rgba(193,232,255,0.08))',
    border: 'rgba(193,232,255,0.22)',
    glow: 'rgba(193,232,255,0.1)',
    bottomBorder: '#C1E8FF',
  },
]

export default function StatCards({ summary, currency = 'INR' }) {
  const rate = savingsRate(summary?.income || 0, summary?.expenses || 0)

  return (
    <>
      <style>{`
        @keyframes cardIn {
          0%{opacity:0;transform:perspective(700px) rotateX(8deg) translateY(28px) scale(0.96)}
          100%{opacity:1;transform:perspective(700px) rotateX(0deg) translateY(0) scale(1)}
        }
        @keyframes iconFloat {
          0%,100%{transform:translateY(0) scale(1)}
          50%{transform:translateY(-4px) scale(1.1)}
        }
        .stat-card {
          opacity: 0;
          animation: cardIn 0.6s cubic-bezier(0.16,1,0.3,1) forwards;
          transform-style: preserve-3d;
          cursor: default;
          transition: transform 0.28s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.28s ease;
        }
        .stat-card:hover {
          transform: perspective(700px) rotateX(-3deg) rotateY(3deg) translateY(-5px) translateZ(10px) !important;
        }
        .stat-icon {
          animation: iconFloat 3.5s ease-in-out infinite;
        }
      `}</style>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {CARDS.map((card, i) => {
          const val = summary?.[card.key] || 0
          const isRate = card.key === 'savings'
          const color = card.color || '#C1E8FF'

          return (
            <div key={card.key}
              className="stat-card rounded-2xl p-5 relative overflow-hidden"
              style={{
                background: card.gradient,
                border: `1px solid ${card.border}`,
                boxShadow: `0 8px 32px ${card.glow}, 0 0 0 1px rgba(255,255,255,0.02), inset 0 1px 0 rgba(255,255,255,0.06)`,
                animationDelay: `${i * 0.1}s`,
              }}>

              {/* Bottom accent line */}
              <div className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full opacity-60"
                style={{ background: card.bottomBorder }} />

              {/* Corner glow */}
              <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full pointer-events-none"
                style={{ background: `radial-gradient(circle, ${card.bottomBorder}30, transparent)`, filter: 'blur(12px)' }} />

              <div className="flex items-start justify-between mb-3 relative z-10">
                <span className="text-xs font-semibold tracking-wide" style={{ color: 'rgba(193,232,255,0.6)' }}>
                  {card.label}
                </span>
                <span className="stat-icon text-lg" style={{ animationDelay: `${i * 0.4}s` }}>
                  {card.icon}
                </span>
              </div>

              <div className="text-2xl font-black relative z-10" style={{ color }}>
                {isRate
                  ? <><CountUp value={rate} suffix="%" duration={1000 + i * 100} /></>
                  : formatCurrency(val, currency)
                }
              </div>

              <p className="text-xs mt-1.5 relative z-10" style={{ color: 'rgba(125,160,202,0.55)' }}>
                {card.key === 'balance' && (val >= 0 ? '✓ Positive balance' : '⚠ Negative balance')}
                {card.key === 'income' && `${transactions_count_placeholder || ''} income entries`}
                {card.key === 'expenses' && `Total outflow`}
                {card.key === 'savings' && (rate >= 20 ? '🎉 Excellent!' : rate >= 10 ? '📈 Keep going' : '💡 Aim for 20%+')}
              </p>

              {/* Savings progress bar */}
              {card.key === 'savings' && (
                <div className="mt-3 h-1.5 rounded-full overflow-hidden relative z-10"
                  style={{ background: 'rgba(2,16,36,0.5)' }}>
                  <div className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${Math.min(rate, 100)}%`,
                      background: rate >= 20
                        ? 'linear-gradient(90deg, #4BC0C0, #36A2EB)'
                        : rate >= 10
                          ? 'linear-gradient(90deg, #FF9F40, #FFCE56)'
                          : 'linear-gradient(90deg, #FF6384, #FF9F40)',
                    }} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}

// Tiny placeholder to avoid undefined in template literal
const transactions_count_placeholder = ''
