// app/dashboard/page.js
'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../lib/authContext'
import AppLayout from '../../components/ui/AppLayout'
import StatCards from '../../components/ui/StatCards'
import RecentTransactions from '../../components/ui/RecentTransactions'
import SpendingPieChart from '../../components/charts/SpendingPieChart'
import MonthlyBarChart from '../../components/charts/MonthlyBarChart'
import TrendLineChart from '../../components/charts/TrendLineChart'
import AIAdvisor from '../../components/ui/AIAdvisor'
import {
  getTransactions,
  getSummary,
  getSpendingByCategory,
  getMonthlyData,
  getUserProfile,
} from '../../services/transactionService'
import { formatDate, formatCurrency } from '../../utils/helpers'

export default function Dashboard() {
  const { user, loading: authLoading, getDisplayName } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [transactions, setTransactions] = useState([])
  const [summary, setSummary] = useState({ balance: 0, income: 0, expenses: 0 })
  const [spendingByCategory, setSpendingByCategory] = useState({})
  const [monthlyData, setMonthlyData] = useState([])
  const [greeting, setGreeting] = useState('')
  const [currency, setCurrency] = useState('INR')
  const [goals, setGoals] = useState([])
  const [headerVisible, setHeaderVisible] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth')
  }, [user, authLoading, router])

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good morning')
    else if (hour < 17) setGreeting('Good afternoon')
    else setGreeting('Good evening')
    // Trigger header animation
    const t = setTimeout(() => setHeaderVisible(true), 100)
    return () => clearTimeout(t)
  }, [])

  const fetchData = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const [txns, sum, spending, monthly, profile] = await Promise.all([
        getTransactions(user.id),
        getSummary(user.id),
        getSpendingByCategory(user.id),
        getMonthlyData(user.id),
        getUserProfile(user.id),
      ])
      setTransactions(txns)
      setSummary(sum)
      setSpendingByCategory(spending)
      setMonthlyData(monthly)
      if (profile) {
        setCurrency(profile.currency || 'INR')
        if (profile.goals_json) {
          try { setGoals(JSON.parse(profile.goals_json)) } catch {}
        }
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { fetchData() }, [fetchData])

  const displayName = getDisplayName?.() || user?.email?.split('@')[0] || 'there'

  if (authLoading) return null

  return (
    <>
      <style>{`
        @keyframes greetingIn {
          0%{opacity:0;transform:perspective(600px) translateY(-16px) rotateX(8deg)}
          100%{opacity:1;transform:perspective(600px) translateY(0) rotateX(0deg)}
        }
        @keyframes badgePop {
          0%{opacity:0;transform:scale(0.7)}
          70%{transform:scale(1.08)}
          100%{opacity:1;transform:scale(1)}
        }
        @keyframes insightFloat {
          0%,100%{transform:translateY(0)}
          50%{transform:translateY(-4px)}
        }
        .greeting-animate {
          animation: greetingIn 0.7s cubic-bezier(0.16,1,0.3,1) forwards;
          opacity:0;
        }
        .badge-animate {
          animation: badgePop 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.4s forwards;
          opacity:0;
        }
        .insight-card {
          transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1);
        }
        .insight-card:hover {
          transform: translateY(-5px) translateZ(6px) scale(1.02);
          box-shadow: 0 16px 40px rgba(84,131,179,0.25);
        }
      `}</style>

      <AppLayout onTransactionAdded={fetchData}>
        <div className="space-y-6">

          {/* 3D Greeting Header */}
          <div className={`flex items-start justify-between flex-wrap gap-3 ${headerVisible ? 'greeting-animate' : 'opacity-0'}`}>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">
                  {new Date().getHours() < 12 ? '🌅' : new Date().getHours() < 17 ? '☀️' : '🌙'}
                </span>
                <h1 className="text-2xl font-black"
                  style={{
                    background: 'linear-gradient(135deg, #C1E8FF 0%, #7DA0CA 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    filter: 'drop-shadow(0 2px 8px rgba(84,131,179,0.4))',
                  }}>
                  {greeting}, {displayName}!
                </h1>
              </div>
              <p className="text-sm text-soft ml-9">
                {formatDate(new Date().toISOString())} · Here's your financial overview
              </p>

              {/* Goals quick status */}
              {goals.length > 0 && !loading && (
                <div className="flex flex-wrap gap-2 mt-3 ml-9">
                  {goals.slice(0, 3).map((g, i) => {
                    const progress = g.type === 'savings' ? Math.max(0, summary.balance) : summary.expenses
                    const pct = g.target > 0 ? Math.min(100, (progress / Number(g.target)) * 100) : 0
                    return (
                      <div key={i} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs"
                        style={{
                          background: 'rgba(5,38,89,0.6)',
                          border: '1px solid rgba(125,160,202,0.2)',
                          color: '#7DA0CA',
                        }}>
                        <span>{g.type === 'savings' ? '🎯' : '💼'}</span>
                        <span className="font-medium">{g.name}</span>
                        <span style={{ color: pct >= 100 ? '#4BC0C0' : 'rgba(125,160,202,0.6)' }}>
                          {pct.toFixed(0)}%
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="badge-animate flex items-center gap-2 text-xs text-soft px-3 py-2 rounded-xl"
              style={{ background: 'rgba(5,38,89,0.6)', border: '1px solid rgba(125,160,202,0.15)' }}>
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span>Live · {currency}</span>
            </div>
          </div>

          {/* Stat Cards */}
          <StatCards summary={summary} currency={currency} />

          {/* AI Advisor — full width, prominent */}
          <AIAdvisor
            transactions={transactions}
            summary={summary}
            goals={goals}
            currency={currency}
            userName={displayName}
          />

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <MonthlyBarChart monthlyData={monthlyData} loading={loading} currency={currency} />
            </div>
            <div>
              <SpendingPieChart spendingData={spendingByCategory} loading={loading} currency={currency} />
            </div>
          </div>

          {/* Trend + Recent */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <TrendLineChart monthlyData={monthlyData} loading={loading} />
            <RecentTransactions transactions={transactions} loading={loading} currency={currency} />
          </div>

          {/* Quick insight cards — 3D hover */}
          {!loading && transactions.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  label: 'This Month',
                  value: formatCurrency(
                    transactions
                      .filter(t => t.date.startsWith(new Date().toISOString().slice(0, 7)) && t.type === 'expense')
                      .reduce((s, t) => s + Number(t.amount), 0),
                    currency
                  ),
                  sub: 'in expenses',
                  icon: '📅',
                  color: '#FF6384',
                  delay: '0s',
                },
                {
                  label: 'Transactions',
                  value: transactions.length,
                  sub: 'total recorded',
                  icon: '📊',
                  color: '#7DA0CA',
                  delay: '0.1s',
                },
                {
                  label: 'Avg. Transaction',
                  value: formatCurrency(
                    transactions.length
                      ? transactions.reduce((s, t) => s + Number(t.amount), 0) / transactions.length
                      : 0,
                    currency
                  ),
                  sub: 'per entry',
                  icon: '💡',
                  color: '#4BC0C0',
                  delay: '0.2s',
                },
              ].map((insight, i) => (
                <div key={i} className="insight-card glass-card p-4 flex items-center gap-4"
                  style={{ animationDelay: insight.delay }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{
                      background: `${insight.color}20`,
                      border: `1px solid ${insight.color}40`,
                      boxShadow: `0 4px 12px ${insight.color}20`,
                    }}>
                    {insight.icon}
                  </div>
                  <div>
                    <p className="text-xs text-soft">{insight.label}</p>
                    <p className="text-lg font-black" style={{ color: insight.color }}>{insight.value}</p>
                    <p className="text-xs" style={{ color: 'rgba(125,160,202,0.45)' }}>{insight.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </AppLayout>
    </>
  )
}
