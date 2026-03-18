// components/charts/MonthlyBarChart.js
// Bar chart comparing monthly income vs expenses

'use client'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { MONTHS } from '../../lib/constants'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export default function MonthlyBarChart({ monthlyData = [], loading }) {
  const labels = MONTHS
  const incomeData = MONTHS.map((_, i) => {
    const d = monthlyData.find(m => m.month === i + 1)
    return d?.income || 0
  })
  const expenseData = MONTHS.map((_, i) => {
    const d = monthlyData.find(m => m.month === i + 1)
    return d?.expenses || 0
  })

  const data = {
    labels,
    datasets: [
      {
        label: 'Income',
        data: incomeData,
        backgroundColor: 'rgba(75, 192, 192, 0.7)',
        borderColor: '#4BC0C0',
        borderWidth: 1.5,
        borderRadius: 6,
        borderSkipped: false,
      },
      {
        label: 'Expenses',
        data: expenseData,
        backgroundColor: 'rgba(255, 99, 132, 0.7)',
        borderColor: '#FF6384',
        borderWidth: 1.5,
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: {
          color: '#7DA0CA',
          font: { family: 'Poppins', size: 11 },
          padding: 10,
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
          label: (ctx) => ` $${ctx.parsed.y.toFixed(2)}`,
        },
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
      <h3 className="text-sm font-semibold text-accent mb-4">Income vs Expenses</h3>
      {loading ? (
        <div className="h-52 shimmer rounded-xl" />
      ) : (
        <div className="h-52">
          <Bar data={data} options={options} />
        </div>
      )}
    </div>
  )
}
