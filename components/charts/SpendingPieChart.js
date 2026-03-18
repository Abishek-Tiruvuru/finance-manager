// components/charts/SpendingPieChart.js
// Doughnut chart showing spending breakdown by category

'use client'
import { Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { getCategoryInfo } from '../../utils/helpers'
import { formatCurrency } from '../../utils/helpers'

ChartJS.register(ArcElement, Tooltip, Legend)

export default function SpendingPieChart({ spendingData = {}, loading }) {
  const entries = Object.entries(spendingData).filter(([, v]) => v > 0)
  const total = entries.reduce((sum, [, v]) => sum + v, 0)

  const data = {
    labels: entries.map(([key]) => getCategoryInfo(key).label),
    datasets: [{
      data: entries.map(([, v]) => v),
      backgroundColor: entries.map(([key]) => getCategoryInfo(key).color + 'CC'),
      borderColor: entries.map(([key]) => getCategoryInfo(key).color),
      borderWidth: 1.5,
      hoverOffset: 8,
    }],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    cutout: '65%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#7DA0CA',
          font: { family: 'Poppins', size: 11 },
          padding: 12,
          boxWidth: 10,
          boxHeight: 10,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(5, 38, 89, 0.95)',
        titleColor: '#C1E8FF',
        bodyColor: '#7DA0CA',
        borderColor: 'rgba(125, 160, 202, 0.3)',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (ctx) => {
            const pct = total > 0 ? ((ctx.parsed / total) * 100).toFixed(1) : 0
            return ` ${formatCurrency(ctx.parsed)} (${pct}%)`
          },
        },
      },
    },
  }

  return (
    <div className="glass-card p-5">
      <h3 className="text-sm font-semibold text-accent mb-4">Spending by Category</h3>

      {loading ? (
        <div className="h-48 shimmer rounded-xl" />
      ) : entries.length === 0 ? (
        <div className="h-48 flex items-center justify-center flex-col gap-2">
          <span className="text-3xl">🥧</span>
          <p className="text-soft text-sm">No expense data</p>
        </div>
      ) : (
        <>
          {/* Center total */}
          <div className="relative">
            <Doughnut data={data} options={options} />
            <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none"
              style={{ paddingBottom: '40px' }}>
              <p className="text-xs text-soft">Total</p>
              <p className="text-base font-bold text-accent">{formatCurrency(total)}</p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
