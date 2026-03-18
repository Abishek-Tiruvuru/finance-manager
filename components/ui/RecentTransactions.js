// components/ui/RecentTransactions.js
// Shows recent transactions in the dashboard

import { formatCurrency, formatDate, getCategoryInfo } from '../../utils/helpers'

export default function RecentTransactions({ transactions = [], loading }) {
  if (loading) {
    return (
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-accent mb-4">Recent Transactions</h3>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-9 h-9 rounded-xl shimmer" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 rounded shimmer w-24" />
                <div className="h-2 rounded shimmer w-16" />
              </div>
              <div className="h-4 rounded shimmer w-16" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const recent = transactions.slice(0, 8)

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-accent">Recent Transactions</h3>
        <span className="text-xs text-soft">{transactions.length} total</span>
      </div>

      {recent.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-3xl mb-2">💳</div>
          <p className="text-soft text-sm">No transactions yet</p>
          <p className="text-xs mt-1" style={{ color: 'rgba(125, 160, 202, 0.5)' }}>
            Add your first transaction to get started
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {recent.map((t, i) => {
            const cat = getCategoryInfo(t.category)
            return (
              <div
                key={t.id}
                className="flex items-center gap-3 p-2.5 rounded-xl transition-all hover:bg-secondary/30"
                style={{ animationDelay: `${i * 0.05}s` }}>

                {/* Category icon */}
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                  style={{ background: `${cat.color}20`, border: `1px solid ${cat.color}40` }}>
                  {cat.icon}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-accent truncate">
                    {t.description || cat.label}
                  </p>
                  <p className="text-xs" style={{ color: 'rgba(125, 160, 202, 0.6)' }}>
                    {formatDate(t.date)}
                  </p>
                </div>

                {/* Amount */}
                <span className="font-semibold text-sm flex-shrink-0"
                  style={{ color: t.type === 'income' ? '#4BC0C0' : '#FF6384' }}>
                  {t.type === 'income' ? '+' : '-'}
                  {formatCurrency(t.amount)}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
