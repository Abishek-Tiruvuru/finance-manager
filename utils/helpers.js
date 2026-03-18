// utils/helpers.js
import { CATEGORIES, CURRENCIES } from '../lib/constants'

/**
 * Format currency with locale-aware formatting (supports INR, USD, EUR, etc.)
 */
export function formatCurrency(amount, currencyCode = 'USD') {
  const currencyInfo = CURRENCIES.find(c => c.value === currencyCode)
  const locale = currencyInfo?.locale || 'en-US'
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: currencyCode === 'JPY' ? 0 : 2,
      maximumFractionDigits: currencyCode === 'JPY' ? 0 : 2,
    }).format(amount)
  } catch {
    return `${currencyInfo?.symbol || '$'}${Number(amount).toFixed(2)}`
  }
}

export function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

export function getCategoryInfo(value) {
  return CATEGORIES.find(c => c.value === value) || {
    value: 'other', label: 'Other', icon: '📌', color: '#9966FF',
  }
}

export function savingsRate(income, expenses) {
  if (income === 0) return 0
  return Math.max(0, ((income - expenses) / income) * 100)
}

export function exportToCSV(transactions, filename = 'transactions.csv', currency = 'USD') {
  const headers = ['Date', 'Type', 'Category', 'Amount', 'Currency', 'Description']
  const rows = transactions.map(t => [
    t.date, t.type, getCategoryInfo(t.category).label, t.amount, currency, t.description || '',
  ])
  const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.click()
}

export function groupByMonth(transactions) {
  const grouped = {}
  transactions.forEach(t => {
    const key = t.date.substring(0, 7)
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(t)
  })
  return grouped
}

export function getTopCategory(transactions) {
  const expenses = transactions.filter(t => t.type === 'expense')
  const totals = {}
  expenses.forEach(t => { totals[t.category] = (totals[t.category] || 0) + Number(t.amount) })
  const sorted = Object.entries(totals).sort((a, b) => b[1] - a[1])
  return sorted[0] ? { category: sorted[0][0], amount: sorted[0][1] } : null
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}
