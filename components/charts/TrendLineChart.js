// components/charts/TrendLineChart.js
// Line chart showing cumulative balance trend over time

'use client'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { MONTHS } from '../../lib/constants'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

export default function TrendLineChart({ monthlyData = [], loading }) {
  // Calculate cumulative balance
  let cumulative = 0
  const balanceData = MONTHS.map((_, i) => {
    const d = monthlyData.find(m => m.month === i + 1)
    const monthNet = (d?.income || 0) - (d?.expenses || 0)
    cumulative += monthNet
    return cumulative
  })

  const data = {
    labels: MONTHS,
    datasets: [
      {
        label: 'Net Balance',
        data: balanceData,
        borderColor: '#7DA0CA',
        backgroundColor: (ctx) => {
          const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 200)
          gradient.addColorStop(0, 'rgba(125, 160, 202, 0.3)')
          gradient.addColorStop(1, 'rgba(125, 160, 202, 0.01)')
          return gradient
        },
        borderWidth: 2.5,
        pointBackgroundColor: '#C1E8FF',
        pointBorderColor: '#052659',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: true,
        tension: 0.4,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(5, 38, 89, 0.95)',
        titleColor: '#C1E8FF',
        bodyColor: '#7DA0CA',
        borderColor: 'rgba(125, 160, 202, 0.3)',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (ctx) => ` Balance: $${ctx.parsed.y.toFixed(2)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(125, 160, 202, 0.06)', drawTicks: false },
        ticks: { color: '#7DA0CA', font: { family: 'Poppins', size: 10 } },
        border: { display: false },
      },
      y: {
        grid: { color: 'rgba(125, 160, 202, 0.06)', drawTicks: false },
        ticks: {
          color: '#7DA0CA',
          font: { family: 'Poppins', size: 10 },
          callback: v => `$${v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v}`,
        },
        border: { display: false },
      },
    },
  }

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-accent">Financial Trend</h3>
        <span className="text-xs text-soft px-2 py-1 rounded-lg"
          style={{ background: 'rgba(5, 38, 89, 0.5)' }}>
          {new Date().getFullYear()}
        </span>
      </div>
      {loading ? (
        <div className="h-44 shimmer rounded-xl" />
      ) : (
        <div className="h-44">
          <Line data={data} options={options} />
        </div>
      )}
    </div>
  )
}
