// app/settings/page.js
'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../lib/authContext'
import AppLayout from '../../components/ui/AppLayout'
import { getUserProfile, upsertUserProfile, getSummary } from '../../services/transactionService'
import { formatCurrency, savingsRate } from '../../utils/helpers'
import { CURRENCIES } from '../../lib/constants'
import toast from 'react-hot-toast'

// A single named goal card (savings or spending limit)
function GoalCard({ goal, index, onUpdate, onDelete, summary, currency }) {
  const progress = goal.type === 'savings'
    ? Math.max(0, summary.balance || 0)
    : summary.expenses || 0

  const pct = goal.target > 0 ? Math.min(100, (progress / goal.target) * 100) : 0
  const isOver = goal.type === 'spending' && pct >= 100
  const isNear = goal.type === 'spending' && pct >= 80

  const barColor = goal.type === 'savings'
    ? `linear-gradient(90deg, #5483B3, #C1E8FF)`
    : isOver
      ? 'linear-gradient(90deg, #FF6384, #FF9F40)'
      : isNear
        ? 'linear-gradient(90deg, #FF9F40, #FFCE56)'
        : 'linear-gradient(90deg, #4BC0C0, #36A2EB)'

  return (
    <div className="goal-card p-4 rounded-2xl"
      style={{
        background: 'rgba(5,38,89,0.6)',
        border: `1px solid ${goal.type === 'savings' ? 'rgba(125,160,202,0.25)' : 'rgba(255,159,64,0.2)'}`,
        transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
        animationDelay: `${index * 0.08}s`,
      }}>
      {/* Header row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{goal.type === 'savings' ? '🎯' : '💼'}</span>
          <div>
            <input
              type="text"
              value={goal.name}
              onChange={e => onUpdate(index, 'name', e.target.value)}
              className="font-bold text-sm text-accent bg-transparent border-b border-transparent hover:border-soft focus:border-accent outline-none transition-colors"
              placeholder="Goal name"
              style={{ minWidth: '100px' }}
            />
            <p className="text-xs text-soft mt-0.5 capitalize">{goal.type === 'savings' ? 'Savings goal' : 'Spending limit'}</p>
          </div>
        </div>
        <button onClick={() => onDelete(index)}
          className="text-xs px-2 py-1 rounded-lg transition-colors hover:bg-red-400/10"
          style={{ color: 'rgba(255,99,132,0.6)' }}>
          ✕
        </button>
      </div>

      {/* Target input */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs text-soft">Target:</span>
        <input
          type="number"
          value={goal.target || ''}
          onChange={e => onUpdate(index, 'target', e.target.value)}
          placeholder="0"
          min="0"
          className="text-sm font-semibold text-accent bg-transparent border-b border-soft/30 hover:border-soft focus:border-accent outline-none transition-colors w-28"
        />
        <span className="text-xs text-soft">{CURRENCIES.find(c => c.value === currency)?.symbol || '$'}</span>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-soft">
            {goal.type === 'savings' ? 'Current balance' : 'Total spent'}
          </span>
          <span style={{ color: isOver ? '#FF6384' : '#7DA0CA' }}>
            {formatCurrency(progress, currency)} / {formatCurrency(Number(goal.target) || 0, currency)}
          </span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(2,16,36,0.5)' }}>
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, background: barColor }} />
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-xs" style={{ color: 'rgba(125,160,202,0.5)' }}>
            {pct.toFixed(0)}% {goal.type === 'savings' ? 'achieved' : 'used'}
          </span>
          {goal.type === 'savings' && goal.target > 0 && progress < goal.target && (
            <span className="text-xs" style={{ color: 'rgba(125,160,202,0.5)' }}>
              {formatCurrency(goal.target - progress, currency)} to go
            </span>
          )}
          {goal.type === 'spending' && isOver && (
            <span className="text-xs font-semibold" style={{ color: '#FF6384' }}>Over budget!</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const { user, loading: authLoading, signOut, getDisplayName } = useAuth()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [summary, setSummary] = useState({ balance: 0, income: 0, expenses: 0 })
  const [profile, setProfile] = useState({
    currency: 'INR',
    display_name: '',
    monthly_budget: '',
  })
  // Named goals array: { name, type: 'savings'|'spending', target }
  const [goals, setGoals] = useState([])

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth')
  }, [user, authLoading, router])

  const fetchData = useCallback(async () => {
    if (!user) return
    try {
      const [profileData, sum] = await Promise.all([
        getUserProfile(user.id),
        getSummary(user.id),
      ])
      if (profileData) {
        setProfile(p => ({
          ...p,
          currency: profileData.currency || 'INR',
          display_name: profileData.display_name || getDisplayName(),
          monthly_budget: profileData.monthly_budget || '',
        }))
        // Load goals from profile JSON
        if (profileData.goals_json) {
          try { setGoals(JSON.parse(profileData.goals_json)) } catch {}
        }
      } else {
        setProfile(p => ({ ...p, display_name: getDisplayName() }))
      }
      setSummary(sum)
    } catch (err) {
      console.error('Settings load error:', err)
    }
  }, [user, getDisplayName])

  useEffect(() => { fetchData() }, [fetchData])

  const handleSave = async () => {
    setSaving(true)
    try {
      await upsertUserProfile(user.id, {
        monthly_budget: profile.monthly_budget ? Number(profile.monthly_budget) : null,
        currency: profile.currency,
        display_name: profile.display_name,
        goals_json: JSON.stringify(goals),
      })
      toast.success('Settings saved! ✓')
    } catch (err) {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const addGoal = (type) => {
    setGoals(g => [...g, {
      id: Date.now(),
      name: type === 'savings' ? 'My Savings Goal' : 'Monthly Spending Limit',
      type,
      target: '',
    }])
  }

  const updateGoal = (index, field, value) => {
    setGoals(g => g.map((goal, i) => i === index ? { ...goal, [field]: value } : goal))
  }

  const deleteGoal = (index) => {
    setGoals(g => g.filter((_, i) => i !== index))
  }

  const rate = savingsRate(summary.income, summary.expenses)
  const budgetUsed = profile.monthly_budget
    ? Math.min((summary.expenses / Number(profile.monthly_budget)) * 100, 100)
    : 0

  if (authLoading) return null

  return (
    <>
      <style>{`
        @keyframes settingsSlide {
          0%{opacity:0;transform:translateY(20px) perspective(600px) rotateX(5deg)}
          100%{opacity:1;transform:translateY(0) perspective(600px) rotateX(0deg)}
        }
        @keyframes goalAppear {
          0%{opacity:0;transform:translateX(-16px) scale(0.97)}
          100%{opacity:1;transform:translateX(0) scale(1)}
        }
        .settings-section { animation: settingsSlide 0.5s cubic-bezier(0.16,1,0.3,1) forwards; }
        .goal-card { animation: goalAppear 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        .goal-card:hover {
          transform: translateY(-2px) translateZ(4px);
          box-shadow: 0 12px 32px rgba(84,131,179,0.2);
        }
        .save-btn {
          box-shadow: 0 5px 0 rgba(2,16,36,0.5), 0 8px 24px rgba(84,131,179,0.3);
          transition: all 0.15s ease;
        }
        .save-btn:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 8px 0 rgba(2,16,36,0.5), 0 14px 32px rgba(84,131,179,0.5);
        }
        .add-goal-btn {
          transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1);
        }
        .add-goal-btn:hover {
          transform: translateY(-2px) scale(1.03);
        }
      `}</style>

      <AppLayout>
        <div className="space-y-6 animate-fade-in" style={{ maxWidth: '700px' }}>
          <div>
            <h1 className="text-xl font-black text-accent">Settings</h1>
            <p className="text-soft text-sm">Manage your preferences, goals, and financial targets</p>
          </div>

          {/* Profile section */}
          <div className="glass-card p-5 space-y-4 settings-section" style={{ animationDelay: '0s' }}>
            <h2 className="text-sm font-bold text-accent flex items-center gap-2">
              <span className="text-base">👤</span> Profile
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-soft text-xs font-semibold block mb-1.5 tracking-widest uppercase">Display Name</label>
                <input
                  type="text"
                  value={profile.display_name}
                  onChange={e => setProfile(p => ({ ...p, display_name: e.target.value }))}
                  placeholder="Your name"
                  className="input-field"
                />
              </div>
              <div>
                <label className="text-soft text-xs font-semibold block mb-1.5 tracking-widest uppercase">Email</label>
                <input type="email" value={user?.email || ''} disabled
                  className="input-field opacity-50 cursor-not-allowed" />
              </div>
            </div>

            <div>
              <label className="text-soft text-xs font-semibold block mb-1.5 tracking-widest uppercase">Currency</label>
              <select
                value={profile.currency}
                onChange={e => setProfile(p => ({ ...p, currency: e.target.value }))}
                className="input-field" style={{ width: 'auto', minWidth: '200px' }}>
                {CURRENCIES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
              {profile.currency === 'INR' && (
                <p className="text-xs mt-1.5" style={{ color: 'rgba(193,232,255,0.4)' }}>
                  🇮🇳 All amounts will display in Indian Rupees (₹)
                </p>
              )}
            </div>
          </div>

          {/* Monthly budget */}
          <div className="glass-card p-5 space-y-4 settings-section" style={{ animationDelay: '0.08s' }}>
            <h2 className="text-sm font-bold text-accent flex items-center gap-2">
              <span className="text-base">💼</span> Monthly Spending Budget
            </h2>
            <div>
              <label className="text-soft text-xs font-semibold block mb-1.5 tracking-widest uppercase">
                Budget Limit ({CURRENCIES.find(c => c.value === profile.currency)?.symbol || '$'})
              </label>
              <input
                type="number"
                value={profile.monthly_budget}
                onChange={e => setProfile(p => ({ ...p, monthly_budget: e.target.value }))}
                placeholder="e.g. 30000"
                className="input-field"
                min="0"
              />
            </div>
            {profile.monthly_budget && (
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-soft">Budget used this period</span>
                  <span style={{ color: budgetUsed > 90 ? '#FF6384' : budgetUsed > 70 ? '#FFCE56' : '#4BC0C0' }}>
                    {formatCurrency(summary.expenses, profile.currency)} / {formatCurrency(Number(profile.monthly_budget), profile.currency)}
                  </span>
                </div>
                <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(2,16,36,0.5)' }}>
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${budgetUsed}%`,
                      background: budgetUsed > 90
                        ? 'linear-gradient(90deg,#FF6384,#FF9F40)'
                        : budgetUsed > 70
                          ? 'linear-gradient(90deg,#FF9F40,#FFCE56)'
                          : 'linear-gradient(90deg,#4BC0C0,#36A2EB)',
                    }} />
                </div>
                <p className="text-xs mt-1" style={{ color: 'rgba(125,160,202,0.4)' }}>
                  {budgetUsed.toFixed(0)}% used · Savings rate: {rate.toFixed(1)}%
                </p>
              </div>
            )}
          </div>

          {/* Named Goals */}
          <div className="glass-card p-5 space-y-4 settings-section" style={{ animationDelay: '0.16s' }}>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-accent flex items-center gap-2">
                <span className="text-base">🎯</span> Financial Goals
              </h2>
              <span className="text-xs text-soft">{goals.length} goal{goals.length !== 1 ? 's' : ''}</span>
            </div>

            <p className="text-xs text-soft">
              Create named savings targets and spending limits — AI will advise how to reach them.
            </p>

            {/* Add goal buttons */}
            <div className="flex gap-3 flex-wrap">
              <button onClick={() => addGoal('savings')}
                className="add-goal-btn flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
                style={{
                  background: 'linear-gradient(135deg,rgba(75,192,192,0.2),rgba(75,192,192,0.05))',
                  border: '1px solid rgba(75,192,192,0.35)',
                  color: '#4BC0C0',
                }}>
                + Savings Goal
              </button>
              <button onClick={() => addGoal('spending')}
                className="add-goal-btn flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
                style={{
                  background: 'linear-gradient(135deg,rgba(255,159,64,0.2),rgba(255,159,64,0.05))',
                  border: '1px solid rgba(255,159,64,0.35)',
                  color: '#FF9F40',
                }}>
                + Spending Limit
              </button>
            </div>

            {/* Goals list */}
            {goals.length === 0 ? (
              <div className="text-center py-6 rounded-xl"
                style={{ background: 'rgba(2,16,36,0.3)', border: '1px dashed rgba(125,160,202,0.2)' }}>
                <p className="text-3xl mb-2">🎯</p>
                <p className="text-soft text-sm">No goals yet</p>
                <p className="text-xs mt-1" style={{ color: 'rgba(125,160,202,0.4)' }}>
                  Add savings targets or spending limits above
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {goals.map((goal, i) => (
                  <GoalCard
                    key={goal.id || i}
                    goal={goal}
                    index={i}
                    onUpdate={updateGoal}
                    onDelete={deleteGoal}
                    summary={summary}
                    currency={profile.currency}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 settings-section" style={{ animationDelay: '0.24s' }}>
            <button onClick={handleSave} disabled={saving}
              className="save-btn flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black text-primary"
              style={{ background: 'linear-gradient(135deg,#5483B3,#7DA0CA)' }}>
              {saving
                ? <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                : '💾'
              }
              Save Settings
            </button>
            <button
              onClick={async () => { await signOut(); router.push('/auth') }}
              className="px-5 py-3 rounded-xl text-sm font-semibold transition-colors hover:bg-red-400/20"
              style={{ background: 'rgba(255,99,132,0.12)', color: '#FF6384', border: '1px solid rgba(255,99,132,0.2)' }}>
              🚪 Sign Out
            </button>
          </div>

          {/* Account info */}
          <div className="glass-card p-4 text-xs space-y-1">
            <p className="text-soft">Account: <span className="text-accent font-mono">{user?.id?.slice(0, 20)}...</span></p>
            <p className="text-soft">Member since: <span className="text-accent">{user?.created_at ? new Date(user.created_at).toLocaleDateString('en-IN') : 'N/A'}</span></p>
          </div>
        </div>
      </AppLayout>
    </>
  )
}
