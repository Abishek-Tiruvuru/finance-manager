// components/ui/AIAdvisor.js
// AI-powered financial advisor using Claude API
// Analyzes income/expenses and gives personalized advice toward named goals

'use client'
import { useState, useEffect, useRef } from 'react'
import { getCategoryInfo, formatCurrency, savingsRate } from '../../utils/helpers'

// Typewriter effect hook
function useTypewriter(text, speed = 14, active = false) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)
  useEffect(() => {
    if (!active || !text) { setDisplayed(''); setDone(false); return }
    setDisplayed(''); setDone(false)
    let i = 0
    const id = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) { clearInterval(id); setDone(true) }
    }, speed)
    return () => clearInterval(id)
  }, [text, active, speed])
  return { displayed, done }
}

export default function AIAdvisor({ transactions = [], summary = {}, goals = [], currency = 'INR', userName = 'there' }) {
  const [advice, setAdvice] = useState('')
  const [loading, setLoading] = useState(false)
  const [analysed, setAnalysed] = useState(false)
  const [open, setOpen] = useState(true)
  const [pulseRing, setPulseRing] = useState(false)

  const { displayed, done } = useTypewriter(advice, 14, !!advice)

  useEffect(() => {
    if (advice) { setPulseRing(true); setTimeout(() => setPulseRing(false), 2000) }
  }, [advice])

  const buildPrompt = () => {
    const rate = savingsRate(summary.income || 0, summary.expenses || 0)
    const catBreakdown = {}
    transactions.filter(t => t.type === 'expense').forEach(t => {
      const info = getCategoryInfo(t.category)
      catBreakdown[info.label] = (catBreakdown[info.label] || 0) + Number(t.amount)
    })
    const catLines = Object.entries(catBreakdown)
      .sort((a, b) => b[1] - a[1])
      .map(([k, v]) => `  - ${k}: ${formatCurrency(v, currency)}`)
      .join('\n')

    const now = new Date()
    const months = [-2, -1, 0].map(offset => {
      const d = new Date(now.getFullYear(), now.getMonth() + offset, 1)
      const key = d.toISOString().slice(0, 7)
      const inc = transactions.filter(t => t.type === 'income' && t.date.startsWith(key)).reduce((s, t) => s + Number(t.amount), 0)
      const exp = transactions.filter(t => t.type === 'expense' && t.date.startsWith(key)).reduce((s, t) => s + Number(t.amount), 0)
      return `  - ${d.toLocaleString('default', { month: 'long', year: 'numeric' })}: Income ${formatCurrency(inc, currency)}, Expenses ${formatCurrency(exp, currency)}`
    }).join('\n')

    const goalLines = goals.length > 0
      ? goals.map(g => {
          const progress = g.type === 'savings' ? Math.max(0, summary.balance || 0) : summary.expenses || 0
          const pct = g.target > 0 ? ((progress / Number(g.target)) * 100).toFixed(1) : 0
          return `  - "${g.name}" (${g.type === 'savings' ? 'savings target' : 'spending limit'}): Target ${formatCurrency(Number(g.target), currency)}, Progress ${pct}%`
        }).join('\n')
      : '  - No goals set yet'

    return `You are a warm, direct personal finance advisor. Analyse this person's finances and give specific, actionable advice.

USER: ${userName}
CURRENCY: ${currency}

FINANCIAL SUMMARY:
- Total Income: ${formatCurrency(summary.income || 0, currency)}
- Total Expenses: ${formatCurrency(summary.expenses || 0, currency)}
- Net Balance: ${formatCurrency(summary.balance || 0, currency)}
- Savings Rate: ${rate.toFixed(1)}%
- Total Transactions: ${transactions.length}

SPENDING BREAKDOWN BY CATEGORY:
${catLines || '  - No expense data yet'}

MONTHLY TREND (last 3 months):
${months}

FINANCIAL GOALS:
${goalLines}

INSTRUCTIONS:
1. Start with one warm sentence acknowledging ${userName}'s current financial position.
2. For EACH named goal, give 2-3 SPECIFIC actionable steps with numbers (e.g. "Cut food by ${currency === 'INR' ? '₹2,000' : '$50'}/month to hit your goal in 8 months").
3. Identify the top 1-2 spending categories to optimise.
4. Give one "quick win" they can do this week.
5. If no goals exist, suggest 2 concrete goals with amounts based on their data.
6. Keep it conversational, warm, under 280 words. Use bullet points sparingly.
7. Be specific with numbers from the data. Do NOT be generic.
8. End with one motivational line personalised to ${userName}.`
  }

  const getAdvice = async () => {
    if (transactions.length === 0 && goals.length === 0) {
      setAdvice("Add some transactions and goals first, then I can give you personalised financial advice! Start by logging your income and a few expenses, then head to Settings to set a goal. 🎯")
      setAnalysed(true)
      return
    }
    setLoading(true)
    setAdvice('')
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{ role: 'user', content: buildPrompt() }],
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data?.error?.message || 'API error')
      const text = data.content?.filter(b => b.type === 'text')?.map(b => b.text)?.join('') || ''
      setAdvice(text)
      setAnalysed(true)
    } catch (err) {
      setAdvice(fallbackAdvice())
      setAnalysed(true)
    } finally {
      setLoading(false)
    }
  }

  const fallbackAdvice = () => {
    const rate = savingsRate(summary.income || 0, summary.expenses || 0)
    const catBreakdown = {}
    transactions.filter(t => t.type === 'expense').forEach(t => {
      const info = getCategoryInfo(t.category)
      catBreakdown[info.label] = (catBreakdown[info.label] || 0) + Number(t.amount)
    })
    const topCat = Object.entries(catBreakdown).sort((a, b) => b[1] - a[1])[0]
    let msg = `${userName}, here's a quick snapshot of your finances.\n\n`
    if (rate >= 20) msg += `You're saving ${rate.toFixed(1)}% of your income — that's solid! The 20% benchmark is within sight. `
    else if (rate > 0) msg += `Your savings rate is ${rate.toFixed(1)}%. Pushing toward 20% would significantly accelerate your goals. `
    else msg += `Your expenses are currently exceeding your income. The priority is to flip that ratio positive as soon as possible. `
    if (topCat) msg += `\n\nYour biggest expense category is **${topCat[0]}** at ${formatCurrency(topCat[1], currency)} — consider setting a monthly cap here.`
    if (goals.length > 0) {
      const g = goals[0]
      const monthly = (summary.income || 0) - (summary.expenses || 0)
      if (monthly > 0 && g.target) {
        const months = Math.ceil((Number(g.target) - Math.max(0, summary.balance || 0)) / monthly)
        msg += `\n\nFor your goal **"${g.name}"**: at your current savings rate, you'd reach it in approximately ${months} month${months !== 1 ? 's' : ''}. Increasing monthly savings by just 10% would shave off ${Math.round(months * 0.1)} month${months * 0.1 !== 1 ? 's' : ''}.`
      }
    }
    msg += `\n\n💡 **Quick win this week:** Review your ${topCat?.[0] || 'top'} spending, pick 2 items to cut, and set up an auto-transfer of even a small amount to savings. Small steps compound fast, ${userName}!`
    return msg
  }

  const rate = savingsRate(summary.income || 0, summary.expenses || 0)
  const healthScore = Math.min(100, Math.max(0, Math.round(rate * 2.5 + (transactions.length > 5 ? 10 : 0))))
  const scoreColor = healthScore >= 75 ? '#4BC0C0' : healthScore >= 50 ? '#7DA0CA' : healthScore >= 25 ? '#FF9F40' : '#FF6384'
  const scoreLabel = healthScore >= 75 ? 'Excellent' : healthScore >= 50 ? 'Good' : healthScore >= 25 ? 'Fair' : 'Needs Work'

  return (
    <>
      <style>{`
        @keyframes advisorIn {
          0%{opacity:0;transform:perspective(900px) rotateX(5deg) translateY(28px) scale(0.97)}
          100%{opacity:1;transform:perspective(900px) rotateX(0deg) translateY(0) scale(1)}
        }
        @keyframes pulseRing {
          0%{box-shadow:0 0 0 0 rgba(84,131,179,0.7)}
          70%{box-shadow:0 0 0 18px rgba(84,131,179,0)}
          100%{box-shadow:0 0 0 0 rgba(84,131,179,0)}
        }
        @keyframes scanLine {
          0%{top:0%;opacity:0.6}100%{top:100%;opacity:0}
        }
        @keyframes brainPulse {
          0%,100%{transform:scale(1);filter:drop-shadow(0 0 5px rgba(193,232,255,0.25))}
          50%{transform:scale(1.1);filter:drop-shadow(0 0 14px rgba(193,232,255,0.65))}
        }
        @keyframes dotBlink {
          0%,80%,100%{transform:scale(0);opacity:0}40%{transform:scale(1);opacity:1}
        }
        @keyframes goalPillIn {
          0%{opacity:0;transform:translateX(-8px)}100%{opacity:1;transform:translateX(0)}
        }
        @keyframes shimmerSweep {
          0%{background-position:-200% 0}100%{background-position:200% 0}
        }
        @keyframes scoreRingDraw {
          0%{stroke-dashoffset:107}
        }
        .advisor-wrap {
          animation: advisorIn 0.75s cubic-bezier(0.16,1,0.3,1) forwards;
        }
        .pulse-ring-anim { animation: pulseRing 1s ease-out; }
        .brain-pulse { animation: brainPulse 2.8s ease-in-out infinite; }
        .dot1{animation:dotBlink 1.4s ease-in-out infinite 0s}
        .dot2{animation:dotBlink 1.4s ease-in-out infinite 0.2s}
        .dot3{animation:dotBlink 1.4s ease-in-out infinite 0.4s}
        .goal-pill-in { animation: goalPillIn 0.35s ease forwards; }
        .advice-shimmer {
          background:linear-gradient(90deg,transparent 0%,rgba(193,232,255,0.04) 50%,transparent 100%);
          background-size:200% 100%;
          animation:shimmerSweep 2s linear infinite;
        }
        .scan-line {
          position:absolute;left:0;right:0;height:2px;
          background:linear-gradient(90deg,transparent,rgba(193,232,255,0.18),transparent);
          animation:scanLine 2.5s linear infinite;pointer-events:none;
        }
        .get-advice-btn {
          transition: all 0.18s cubic-bezier(0.34,1.56,0.64,1);
          transform: translateY(0);
          box-shadow: 0 6px 0 rgba(2,16,36,0.5), 0 12px 32px rgba(84,131,179,0.4);
        }
        .get-advice-btn:hover:not(:disabled) {
          transform: translateY(-4px) scale(1.03);
          box-shadow: 0 10px 0 rgba(2,16,36,0.45), 0 20px 44px rgba(84,131,179,0.6);
        }
        .get-advice-btn:active:not(:disabled) {
          transform: translateY(2px) scale(0.98);
          box-shadow: 0 2px 0 rgba(2,16,36,0.5), 0 4px 14px rgba(84,131,179,0.2);
        }
        .score-ring { transition: stroke-dashoffset 1.6s cubic-bezier(0.16,1,0.3,1) 0.3s; }
        .stat-mini {
          transition: all 0.22s cubic-bezier(0.34,1.56,0.64,1);
        }
        .stat-mini:hover {
          transform: translateY(-3px) scale(1.04);
        }
      `}</style>

      <div className="advisor-wrap rounded-3xl overflow-hidden"
        style={{
          background: 'linear-gradient(150deg, rgba(5,38,89,0.72) 0%, rgba(2,16,36,0.9) 100%)',
          border: '1px solid rgba(125,160,202,0.2)',
          boxShadow: '0 28px 72px rgba(2,16,36,0.55), inset 0 1px 0 rgba(255,255,255,0.05), 0 0 0 1px rgba(193,232,255,0.03)',
        }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: 'rgba(125,160,202,0.1)', background: 'rgba(2,16,36,0.25)' }}>
          <div className="flex items-center gap-3">
            <div className={`${pulseRing ? 'pulse-ring-anim' : ''} w-11 h-11 rounded-2xl flex items-center justify-center`}
              style={{
                background: 'linear-gradient(135deg, #5483B3, #C1E8FF)',
                boxShadow: '0 5px 0 rgba(2,16,36,0.45), inset 0 1px 0 rgba(255,255,255,0.22)',
              }}>
              <span className="brain-pulse text-xl">🤖</span>
            </div>
            <div>
              <h3 className="text-sm font-black text-accent tracking-tight">AI Financial Advisor</h3>
              <p className="text-xs" style={{ color: 'rgba(125,160,202,0.5)' }}>
                Powered by Claude · {goals.length} goal{goals.length !== 1 ? 's' : ''} tracked
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Score ring */}
            <div className="flex items-center gap-2">
              <div className="relative w-12 h-12">
                <svg width="48" height="48" viewBox="0 0 48 48" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="24" cy="24" r="17" fill="none" stroke="rgba(5,38,89,0.8)" strokeWidth="4.5" />
                  <circle cx="24" cy="24" r="17" fill="none"
                    stroke={scoreColor}
                    strokeWidth="4.5"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 17}`}
                    strokeDashoffset={`${2 * Math.PI * 17 * (1 - healthScore / 100)}`}
                    className="score-ring"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-black" style={{ color: scoreColor }}>{healthScore}</span>
                </div>
              </div>
              <div>
                <p className="text-xs font-bold leading-tight" style={{ color: scoreColor }}>{scoreLabel}</p>
                <p className="text-xs leading-tight" style={{ color: 'rgba(125,160,202,0.4)' }}>Score</p>
              </div>
            </div>

            <button onClick={() => setOpen(o => !o)}
              className="text-soft hover:text-accent transition-all w-8 h-8 flex items-center justify-center rounded-xl hover:rotate-180"
              style={{ background: 'rgba(2,16,36,0.4)', transition: 'all 0.3s ease' }}>
              {open ? '▲' : '▼'}
            </button>
          </div>
        </div>

        {open && (
          <div className="p-5 space-y-4">

            {/* Goal pills */}
            {goals.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {goals.map((g, i) => {
                  const progress = g.type === 'savings' ? Math.max(0, summary.balance || 0) : summary.expenses || 0
                  const pct = g.target > 0 ? Math.min(100, (progress / Number(g.target)) * 100) : 0
                  const col = g.type === 'savings' ? '#4BC0C0' : pct > 90 ? '#FF6384' : '#FF9F40'
                  return (
                    <div key={i} className="goal-pill-in flex items-center gap-2 px-3 py-1.5 rounded-xl"
                      style={{ background: `${col}18`, border: `1px solid ${col}35`, animationDelay: `${i * 0.07}s` }}>
                      <span className="text-xs">{g.type === 'savings' ? '🎯' : '💼'}</span>
                      <span className="text-xs font-semibold text-accent">{g.name}</span>
                      <div className="w-14 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(2,16,36,0.5)' }}>
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: col, transition: 'width 1s ease' }} />
                      </div>
                      <span className="text-xs font-bold" style={{ color: col }}>{pct.toFixed(0)}%</span>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Mini stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Income', val: formatCurrency(summary.income || 0, currency), color: '#4BC0C0' },
                { label: 'Expenses', val: formatCurrency(summary.expenses || 0, currency), color: '#FF6384' },
                { label: 'Savings %', val: `${rate.toFixed(1)}%`, color: scoreColor },
              ].map((s, i) => (
                <div key={i} className="stat-mini p-3 rounded-2xl text-center"
                  style={{ background: `${s.color}10`, border: `1px solid ${s.color}22`, boxShadow: `0 4px 18px ${s.color}0F` }}>
                  <p className="text-base font-black" style={{ color: s.color }}>{s.val}</p>
                  <p className="text-xs text-soft mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* CTA */}
            {!analysed && !loading && (
              <div className="text-center py-3">
                <p className="text-soft text-sm mb-4">
                  {goals.length > 0
                    ? `Ready to build a plan for your ${goals.length} goal${goals.length > 1 ? 's' : ''}`
                    : 'Get personalised AI advice based on your spending patterns'}
                </p>
                <button onClick={getAdvice}
                  className="get-advice-btn px-8 py-3.5 rounded-2xl text-sm font-black text-primary"
                  style={{ background: 'linear-gradient(135deg, #5483B3, #7DA0CA, #C1E8FF)', border: 'none', cursor: 'pointer' }}>
                  ✦ Analyse My Finances
                </button>
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="relative rounded-2xl overflow-hidden py-8"
                style={{ background: 'rgba(2,16,36,0.45)', border: '1px solid rgba(125,160,202,0.1)' }}>
                <div className="scan-line" />
                <div className="advice-shimmer absolute inset-0 rounded-2xl" />
                <div className="relative z-10 flex flex-col items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-accent dot1" />
                    <div className="w-2.5 h-2.5 rounded-full bg-accent dot2" />
                    <div className="w-2.5 h-2.5 rounded-full bg-accent dot3" />
                  </div>
                  <p className="text-soft text-sm font-semibold">Analysing your financial patterns…</p>
                  <p className="text-xs" style={{ color: 'rgba(125,160,202,0.35)' }}>
                    {transactions.length} transactions · {goals.length} goal{goals.length !== 1 ? 's' : ''} · {currency}
                  </p>
                </div>
              </div>
            )}

            {/* Advice with typewriter */}
            {!loading && advice && (
              <div className="relative rounded-2xl overflow-hidden"
                style={{
                  background: 'linear-gradient(150deg, rgba(5,38,89,0.5), rgba(2,16,36,0.65))',
                  border: '1px solid rgba(125,160,202,0.16)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
                }}>
                {!done && <div className="scan-line" />}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3 pb-3 border-b" style={{ borderColor: 'rgba(125,160,202,0.1)' }}>
                    <span>🤖</span>
                    <span className="text-xs font-bold text-accent">AI Advisor</span>
                    {!done ? (
                      <span className="flex gap-1 ml-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent dot1" />
                        <span className="w-1.5 h-1.5 rounded-full bg-accent dot2" />
                        <span className="w-1.5 h-1.5 rounded-full bg-accent dot3" />
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded-full ml-1" style={{ background: 'rgba(75,192,192,0.15)', color: '#4BC0C0' }}>
                        ✓ Complete
                      </span>
                    )}
                  </div>
                  <div className="text-sm leading-relaxed space-y-2" style={{ color: '#C1E8FF' }}>
                    {displayed.split('\n').map((line, i) => {
                      if (!line.trim()) return <div key={i} className="h-1" />
                      const parts = line.split(/\*\*(.*?)\*\*/g)
                      const isBullet = line.startsWith('-') || line.startsWith('•')
                      return (
                        <p key={i} className={isBullet ? 'pl-3 border-l-2' : ''}
                          style={isBullet ? { borderColor: 'rgba(84,131,179,0.4)' } : {}}>
                          {parts.map((part, j) =>
                            j % 2 === 1
                              ? <strong key={j} style={{ color: '#C1E8FF', fontWeight: 700 }}>{part}</strong>
                              : part
                          )}
                        </p>
                      )
                    })}
                    {!done && <span className="inline-block w-0.5 h-4 bg-accent animate-pulse" />}
                  </div>
                </div>
              </div>
            )}

            {analysed && !loading && (
              <div className="flex justify-end">
                <button onClick={getAdvice}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold"
                  style={{ background: 'rgba(84,131,179,0.12)', border: '1px solid rgba(84,131,179,0.22)', color: '#7DA0CA', transition: 'all 0.2s', cursor: 'pointer' }}>
                  ↺ Refresh Analysis
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
