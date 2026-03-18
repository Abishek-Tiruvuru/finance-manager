// app/analytics/page.js
// Advanced analytics with multiple charts and financial insights

'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Doughnut, Bar, Line, Radar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { useAuth } from '../../lib/authContext'
import AppLayout from '../../components/ui/AppLayout'
import { getTransactions, getSpendingByCategory, getMonthlyData } from '../../services/transactionService'
import { CATEGORIES, MONTHS } from '../../lib/constants'
import { formatCurrency, getCategoryInfo, getTopCategory, savingsRate } from '../../utils/helpers'
import toast from 'react-hot-toast'

ChartJS.register(
  ArcElement, CategoryScale, LinearScale, BarElement,
  PointElement, LineElement, RadialLinearScale,
  Title, Tooltip, Legend, Filler
)

const chartDefaults = {
  plugins: {
    legend: {
      labels: { color: '#7DA0CA', font: { family: 'Poppins', size: 11 }, padding: 12, usePointStyle: true, pointStyle: 'circle' },
    },
    tooltip: {
      backgroundColor: 'rgba(5, 38, 89, 0.95)',
      titleColor: '#C1E8FF',
      bodyColor: '#7DA0CA',
      borderColor: 'rgba(125, 160, 202, 0.3)',
      borderWidth: 1,
      padding: 12,
    },
  },
  scales: {
    x: {
      grid: { color: 'rgba(125, 160, 202, 0.08)', drawTicks: false },
      ticks: { color: '#7DA0CA', font: { family: 'Poppins', size: 10 } },
      border: { display: false },
    },
    y: {
      grid: { color: 'rgba(125, 160, 202, 0.08)', drawTicks: false },
      ticks: { color: '#7DA0CA', font: { family: 'Poppins', size: 10 } },
      border: { display: false },
    },
  },
}

export default function AnalyticsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [transactions, setTransactions] = useState([])
  const [spendingData, setSpendingData] = useState({})
  const [monthlyData, setMonthlyData] = useState([])
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth')
  }, [user, authLoading, router])

  const fetchData = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const [txns, spending, monthly] = await Promise.all([
        getTransactions(user.id),
        getSpendingByCategory(user.id),
        getMonthlyData(user.id, selectedYear),
      ])
      setTransactions(txns)
      setSpendingData(spending)
      setMonthlyData(monthly)
    } catch (err) {
      toast.error('Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }, [user, selectedYear])

  useEffect(() => { fetchData() }, [fetchData])

  // Computed metrics
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
  const rate = savingsRate(totalIncome, totalExpenses)
  const topCategory = getTopCategory(transactions)

  // Pie chart data
  const spendingEntries = Object.entries(spendingData).filter(([, v]) => v > 0)
  const pieData = {
    labels: spendingEntries.map(([k]) => getCategoryInfo(k).label),
    datasets: [{
      data: spendingEntries.map(([, v]) => v),
      backgroundColor: spendingEntries.map(([k]) => getCategoryInfo(k).color + 'BB'),
      borderColor: spendingEntries.map(([k]) => getCategoryInfo(k).color),
      borderWidth: 1.5,
      hoverOffset: 8,
    }],
  }

  // Bar chart
  const barData = {
    labels: MONTHS,
    datasets: [
      {
        label: 'Income',
        data: monthlyData.map(m => m.income),
        backgroundColor: 'rgba(75, 192, 192, 0.7)',
        borderColor: '#4BC0C0',
        borderWidth: 1.5,
        borderRadius: 6,
      },
      {
        label: 'Expenses',
        data: monthlyData.map(m => m.expenses),
        backgroundColor: 'rgba(255, 99, 132, 0.7)',
        borderColor: '#FF6384',
        borderWidth: 1.5,
        borderRadius: 6,
      },
    ],
  }

  // Savings line chart
  let cumulative = 0
  const lineData = {
    labels: MONTHS,
    datasets: [{
      label: 'Cumulative Savings',
      data: monthlyData.map(m => {
        cumulative += m.income - m.expenses
        return cumulative
      }),
      borderColor: '#7DA0CA',
      backgroundColor: 'rgba(125, 160, 202, 0.15)',
      borderWidth: 2.5,
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#C1E8FF',
      pointBorderColor: '#052659',
      pointRadius: 4,
    }],
  }

  // Net savings bar
  const netData = {
    labels: MONTHS,
    datasets: [{
      label: 'Net Savings',
      data: monthlyData.map(m => m.income - m.expenses),
      backgroundColor: monthlyData.map(m =>
        m.income - m.expenses >= 0 ? 'rgba(75, 192, 192, 0.7)' : 'rgba(255, 99, 132, 0.7)'
      ),
      borderColor: monthlyData.map(m =>
        m.income - m.expenses >= 0 ? '#4BC0C0' : '#FF6384'
      ),
      borderWidth: 1.5,
      borderRadius: 6,
    }],
  }

  const insights = [
    { label: 'Savings Rate', value: `${rate.toFixed(1)}%`, icon: '💰', color: rate >= 20 ? '#4BC0C0' : '#FF9F40', sub: rate >= 20 ? 'Excellent!' : 'Aim for 20%+' },
    { label: 'Avg Monthly Expense', value: formatCurrency(totalExpenses / 12), icon: '📊', color: '#7DA0CA', sub: 'per month average' },
    { label: 'Largest Category', value: topCategory ? getCategoryInfo(topCategory.category).label : 'N/A', icon: '🏆', color: '#C1E8FF', sub: topCategory ? formatCurrency(topCategory.amount) : 'No data' },
    { label: 'Income Sources', value: transactions.filter(t => t.type === 'income').length, icon: '📈', color: '#4BC0C0', sub: 'income entries' },
  ]

  const noRadarScales = {
    r: {
      grid: { color: 'rgba(125, 160, 202, 0.15)' },
      angleLines: { color: 'rgba(125, 160, 202, 0.15)' },
      ticks: { color: '#7DA0CA', font: { family: 'Poppins', size: 9 }, backdropColor: 'transparent' },
      pointLabels: { color: '#7DA0CA', font: { family: 'Poppins', size: 10 } },
    },
  }

  if (authLoading) return null

  return (
    <AppLayout onTransactionAdded={fetchData}>
      <div className="space-y-6 animate-fade-in">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-accent">Analytics</h1>
            <p className="text-soft text-sm">Deep dive into your financial patterns</p>
          </div>
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(Number(e.target.value))}
            className="input-field text-sm"
            style={{ width: 'auto', minWidth: '100px' }}>
            {[2022, 2023, 2024, 2025, 2026].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {/* Insight cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {insights.map((insight, i) => (
            <div key={i} className="glass-card p-4 animate-slide-up"
              style={{ animationDelay: `${i * 0.1}s` }}>
              <span className="text-2xl">{insight.icon}</span>
              <p className="text-lg font-bold mt-2" style={{ color: insight.color }}>{insight.value}</p>
              <p className="text-xs text-soft font-medium">{insight.label}</p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(125,160,202,0.5)' }}>{insight.sub}</p>
            </div>
          ))}
        </div>

        {/* Charts grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Pie chart */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-accent mb-4">Spending Breakdown</h3>
            {loading ? <div className="h-64 shimmer rounded-xl" /> : spendingEntries.length > 0 ? (
              <div className="h-64 flex items-center justify-center">
                <Doughnut data={pieData} options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  cutout: '60%',
                  plugins: {
                    ...chartDefaults.plugins,
                    legend: { ...chartDefaults.plugins.legend, position: 'right' },
                  },
                }} />
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-soft">No expense data</div>
            )}
          </div>

          {/* Income vs Expenses bar */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-accent mb-4">Monthly Income vs Expenses</h3>
            {loading ? <div className="h-64 shimmer rounded-xl" /> : (
              <div className="h-64">
                <Bar data={barData} options={{ ...chartDefaults, responsive: true, maintainAspectRatio: false, interaction: { mode: 'index' } }} />
              </div>
            )}
          </div>

          {/* Savings trend */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-accent mb-4">Cumulative Savings Trend</h3>
            {loading ? <div className="h-56 shimmer rounded-xl" /> : (
              <div className="h-56">
                <Line data={lineData} options={{ ...chartDefaults, responsive: true, maintainAspectRatio: false }} />
              </div>
            )}
          </div>

          {/* Net monthly savings */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-accent mb-4">Monthly Net Savings</h3>
            {loading ? <div className="h-56 shimmer rounded-xl" /> : (
              <div className="h-56">
                <Bar data={netData} options={{ ...chartDefaults, responsive: true, maintainAspectRatio: false }} />
              </div>
            )}
          </div>
        </div>

        {/* Category breakdown table */}
        {!loading && spendingEntries.length > 0 && (
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-accent mb-4">Category Breakdown</h3>
            <div className="space-y-3">
              {spendingEntries.sort((a, b) => b[1] - a[1]).map(([key, amount]) => {
                const cat = getCategoryInfo(key)
                const pct = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0
                return (
                  <div key={key} className="flex items-center gap-3">
                    <span className="text-lg w-6">{cat.icon}</span>
                    <span className="text-sm text-soft w-28 flex-shrink-0">{cat.label}</span>
                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(2, 16, 36, 0.5)' }}>
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: cat.color }} />
                    </div>
                    <span className="text-sm font-medium text-accent w-20 text-right flex-shrink-0">
                      {formatCurrency(amount)}
                    </span>
                    <span className="text-xs text-soft w-10 text-right flex-shrink-0">
                      {pct.toFixed(0)}%
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
