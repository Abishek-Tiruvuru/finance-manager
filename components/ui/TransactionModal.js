// components/ui/TransactionModal.js
// Modal form for adding/editing transactions

'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '../../lib/authContext'
import { addTransaction, updateTransaction } from '../../services/transactionService'
import { CATEGORIES, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../../lib/constants'
import toast from 'react-hot-toast'

export default function TransactionModal({ onClose, onSuccess, editTransaction = null }) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    type: 'expense',
    amount: '',
    category: 'food',
    description: '',
    date: new Date().toISOString().split('T')[0],
  })

  // Pre-fill form if editing
  useEffect(() => {
    if (editTransaction) {
      setForm({
        type: editTransaction.type,
        amount: String(editTransaction.amount),
        category: editTransaction.category,
        description: editTransaction.description || '',
        date: editTransaction.date,
      })
    }
  }, [editTransaction])

  const availableCategories = CATEGORIES.filter(c =>
    form.type === 'income'
      ? INCOME_CATEGORIES.includes(c.value)
      : EXPENSE_CATEGORIES.includes(c.value)
  )

  const handleTypeChange = (type) => {
    const defaultCategory = type === 'income' ? 'salary' : 'food'
    setForm(f => ({ ...f, type, category: defaultCategory }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) {
      return toast.error('Please enter a valid amount')
    }

    setLoading(true)
    try {
      const payload = {
        user_id: user.id,
        type: form.type,
        amount: parseFloat(form.amount),
        category: form.category,
        description: form.description,
        date: form.date,
      }

      let result
      if (editTransaction) {
        result = await updateTransaction(editTransaction.id, payload)
        toast.success('Transaction updated!')
      } else {
        result = await addTransaction(payload)
        toast.success('Transaction added!')
      }

      onSuccess(result)
    } catch (err) {
      toast.error(err.message || 'Failed to save transaction')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-md glass-card p-6 animate-slide-up"
        style={{ border: '1px solid rgba(125, 160, 202, 0.3)' }}>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-accent">
            {editTransaction ? 'Edit Transaction' : 'Add Transaction'}
          </h2>
          <button onClick={onClose}
            className="text-soft hover:text-accent transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary/40">
            ✕
          </button>
        </div>

        {/* Type toggle */}
        <div className="flex rounded-xl p-1 mb-5" style={{ background: 'rgba(2, 16, 36, 0.5)' }}>
          {['income', 'expense'].map(type => (
            <button
              key={type}
              type="button"
              onClick={() => handleTypeChange(type)}
              className="flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all duration-200"
              style={{
                background: form.type === type
                  ? type === 'income'
                    ? 'linear-gradient(135deg, rgba(75,192,192,0.8), rgba(75,192,192,0.5))'
                    : 'linear-gradient(135deg, rgba(255,99,132,0.8), rgba(255,99,132,0.5))'
                  : 'transparent',
                color: form.type === type ? '#fff' : '#7DA0CA',
              }}>
              {type === 'income' ? '↑ Income' : '↓ Expense'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount */}
          <div>
            <label className="text-soft text-xs font-medium block mb-1.5">Amount ($)</label>
            <input
              type="number"
              value={form.amount}
              onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
              placeholder="0.00"
              step="0.01"
              min="0"
              className="input-field text-lg font-semibold"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-soft text-xs font-medium block mb-1.5">Category</label>
            <select
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              className="input-field">
              {availableCategories.map(c => (
                <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="text-soft text-xs font-medium block mb-1.5">Description (optional)</label>
            <input
              type="text"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="What was this for?"
              className="input-field"
            />
          </div>

          {/* Date */}
          <div>
            <label className="text-soft text-xs font-medium block mb-1.5">Date</label>
            <input
              type="date"
              value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              className="input-field"
              required
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-xl text-sm font-medium text-soft hover:text-accent transition-colors"
              style={{ background: 'rgba(2, 16, 36, 0.5)' }}>
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-primary transition-all"
              style={{
                background: form.type === 'income'
                  ? 'linear-gradient(135deg, #4BC0C0, #36A2EB)'
                  : 'linear-gradient(135deg, #5483B3, #7DA0CA)',
              }}>
              {loading ? (
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              ) : (
                editTransaction ? 'Update' : 'Add Transaction'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
