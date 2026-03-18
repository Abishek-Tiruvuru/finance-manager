// app/layout.js
// Root layout with global providers

import { AuthProvider } from '../lib/authContext'
import { Toaster } from 'react-hot-toast'
import '../styles/globals.css'

export const metadata = {
  title: 'FinanceFlow — Personal Finance Tracker',
  description: 'Track your income, expenses, and financial goals with beautiful analytics.',
  keywords: 'finance tracker, budget, expenses, income, analytics',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-primary text-accent font-sans antialiased">
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#052659',
                color: '#C1E8FF',
                border: '1px solid rgba(125, 160, 202, 0.3)',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '14px',
                borderRadius: '12px',
              },
              success: {
                iconTheme: { primary: '#4BC0C0', secondary: '#052659' },
              },
              error: {
                iconTheme: { primary: '#FF6384', secondary: '#052659' },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  )
}
