// app/history/page.js
// Transaction history with full CRUD, filtering, sorting, CSV export

'use client'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../lib/authContext'
import AppLayout from '../../components/ui/AppLayout'
import TransactionModal from '../../components/ui/TransactionModal'
import { getTransactions, deleteTransaction } from '../../services/transactionService'
import { CATEGORIES } from '../../lib/constants'
import { formatCurrency, formatDate, getCategoryInfo, exportToCSV } from '../../utils/helpers'
import toast from 'react-hot-toast'

export default function HistoryPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [editTx, setEditTx] = useState(null)
  const [deleteId, setDeleteId] = useState(null)

  // Filters
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [sortBy, setSortBy] = useState('date_desc')

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth')
  }, [user, authLoading, router])

  const fetchTransactions = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const data = await getTransactions(user.id)
      setTransactions(data)
    } catch (err) {
      toast.error('Failed to load transactions')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { fetchTransactions() }, [fetchTransactions])

  const filtered = useMemo(() => {
    let list = [...transactions]

    if (filterType !== 'all') list = list.filter(t => t.type === filterType)
    if (filterCategory !== 'all') list = list.filter(t => t.category === filterCategory)
    if (search) list = list.filter(t =>
      t.description?.toLowerCase().includes(search.toLowerCase()) ||
      getCategoryInfo(t.category).label.toLowerCase().includes(search.toLowerCase())
    )

    // Sort
    if (sortBy === 'date_desc') list.sort((a, b) => new Date(b.date) - new Date(a.date))
    else if (sortBy === 'date_asc') list.sort((a, b) => new Date(a.date) - new Date(b.date))
    else if (sortBy === 'amount_desc') list.sort((a, b) => b.amount - a.amount)
    else if (sortBy === 'amount_asc') list.sort((a, b) => a.amount - b.amount)

    return list
  }, [transactions, filterType, filterCategory, search, sortBy])

  const handleDelete = async (id) => {
    try {
      await deleteTransaction(id)
      setTransactions(prev => prev.filter(t => t.id !== id))
      setDeleteId(null)
      toast.success('Transaction deleted')
    } catch {
      toast.error('Failed to delete transaction')
    }
  }

  if (authLoading) return null

  return (
    <AppLayout onTransactionAdded={fetchTransactions}>
      <div className="space-y-5 animate-fade-in">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-accent">Transaction History</h1>
            <p className="text-soft text-sm">{filtered.length} of {transactions.length} transactions</p>
          </div>
          <button
            onClick={() => exportToCSV(filtered)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-soft hover:text-accent transition-colors"
            style={{ background: 'rgba(5, 38, 89, 0.6)', border: '1px solid rgba(125, 160, 202, 0.2)' }}>
            ⬇ Export CSV
          </button>
        </div>

        {/* Filters */}
        <div className="glass-card p-4">
          <div className="flex flex-wrap gap-3">
            {/* Search */}
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search transactions..."
              className="input-field flex-1 min-w-[180px] text-sm"
              style={{ minWidth: '200px', maxWidth: '300px' }}
            />

            {/* Type filter */}
            <select value={filterType} onChange={e => setFilterType(e.target.value)}
              className="input-field text-sm" style={{ width: 'auto', minWidth: '120px' }}>
              <option value="all">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>

            {/* Category filter */}
            <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
              className="input-field text-sm" style={{ width: 'auto', minWidth: '140px' }}>
              <option value="all">All Categories</option>
              {CATEGORIES.map(c => (
                <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
              ))}
            </select>

            {/* Sort */}
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              className="input-field text-sm" style={{ width: 'auto', minWidth: '140px' }}>
              <option value="date_desc">Date (newest)</option>
              <option value="date_asc">Date (oldest)</option>
              <option value="amount_desc">Amount (high)</option>
              <option value="amount_asc">Amount (low)</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="glass-card overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-12 shimmer rounded-xl" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-4xl mb-3">🔍</div>
              <p className="text-accent font-medium">No transactions found</p>
              <p className="text-soft text-sm mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(125, 160, 202, 0.15)' }}>
                    {['Date', 'Category', 'Description', 'Type', 'Amount', 'Actions'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-soft uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'rgba(125, 160, 202, 0.08)' }}>
                  {filtered.map(t => {
                    const cat = getCategoryInfo(t.category)
                    return (
                      <tr key={t.id}
                        className="hover:bg-secondary/20 transition-colors group">
                        <td className="px-4 py-3 text-sm text-soft whitespace-nowrap">
                          {formatDate(t.date)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{cat.icon}</span>
                            <span className="text-sm text-accent">{cat.label}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-soft max-w-[200px] truncate">
                          {t.description || '—'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={t.type === 'income' ? 'badge-income' : 'badge-expense'}>
                            {t.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold whitespace-nowrap"
                          style={{ color: t.type === 'income' ? '#4BC0C0' : '#FF6384' }}>
                          {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setEditTx(t)}
                              className="text-soft hover:text-accent text-xs px-2 py-1 rounded-lg transition-colors"
                              style={{ background: 'rgba(5, 38, 89, 0.6)' }}>
                              Edit
                            </button>
                            <button onClick={() => setDeleteId(t.id)}
                              className="text-xs px-2 py-1 rounded-lg transition-colors hover:text-red-400"
                              style={{ background: 'rgba(255, 99, 132, 0.1)', color: '#FF6384' }}>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary row */}
        {filtered.length > 0 && (
          <div className="flex flex-wrap gap-4 text-sm">
            <span className="text-soft">
              Total shown: <strong className="text-accent">
                {formatCurrency(filtered.reduce((s, t) => s + (t.type === 'income' ? Number(t.amount) : -Number(t.amount)), 0))}
              </strong>
            </span>
            <span className="text-soft">
              Income: <strong style={{ color: '#4BC0C0' }}>
                {formatCurrency(filtered.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0))}
              </strong>
            </span>
            <span className="text-soft">
              Expenses: <strong style={{ color: '#FF6384' }}>
                {formatCurrency(filtered.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0))}
              </strong>
            </span>
          </div>
        )}
      </div>

      {/* Edit modal */}
      {editTx && (
        <TransactionModal
          editTransaction={editTx}
          onClose={() => setEditTx(null)}
          onSuccess={() => { setEditTx(null); fetchTransactions() }}
        />
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="modal-overlay">
          <div className="glass-card p-6 max-w-sm w-full mx-4"
            style={{ border: '1px solid rgba(255, 99, 132, 0.3)' }}>
            <h3 className="text-accent font-bold mb-2">Delete Transaction?</h3>
            <p className="text-soft text-sm mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 rounded-xl text-sm text-soft transition-colors hover:text-accent"
                style={{ background: 'rgba(5, 38, 89, 0.6)' }}>
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteId)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                style={{ background: 'rgba(255, 99, 132, 0.8)', color: '#fff' }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
