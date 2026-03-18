// lib/constants.js

export const CATEGORIES = [
  { value: 'food', label: 'Food & Dining', icon: '🍽️', color: '#FF6384' },
  { value: 'transport', label: 'Transport', icon: '🚗', color: '#36A2EB' },
  { value: 'rent', label: 'Rent & Housing', icon: '🏠', color: '#FFCE56' },
  { value: 'entertainment', label: 'Entertainment', icon: '🎬', color: '#4BC0C0' },
  { value: 'utilities', label: 'Utilities', icon: '⚡', color: '#9966FF' },
  { value: 'shopping', label: 'Shopping', icon: '🛍️', color: '#FF9F40' },
  { value: 'health', label: 'Health', icon: '💊', color: '#FF6384' },
  { value: 'education', label: 'Education', icon: '📚', color: '#36A2EB' },
  { value: 'savings', label: 'Savings', icon: '💰', color: '#4BC0C0' },
  { value: 'salary', label: 'Salary', icon: '💼', color: '#7DA0CA' },
  { value: 'freelance', label: 'Freelance', icon: '💻', color: '#5483B3' },
  { value: 'investment', label: 'Investment', icon: '📈', color: '#C1E8FF' },
  { value: 'other', label: 'Other', icon: '📌', color: '#9966FF' },
]

export const INCOME_CATEGORIES = ['salary', 'freelance', 'investment', 'other']
export const EXPENSE_CATEGORIES = ['food', 'transport', 'rent', 'entertainment', 'utilities', 'shopping', 'health', 'education', 'other']

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export const CURRENCIES = [
  { value: 'INR', label: '🇮🇳 INR (₹)', symbol: '₹', locale: 'en-IN' },
  { value: 'USD', label: '🇺🇸 USD ($)', symbol: '$', locale: 'en-US' },
  { value: 'EUR', label: '🇪🇺 EUR (€)', symbol: '€', locale: 'de-DE' },
  { value: 'GBP', label: '🇬🇧 GBP (£)', symbol: '£', locale: 'en-GB' },
  { value: 'CAD', label: '🇨🇦 CAD ($)', symbol: 'CA$', locale: 'en-CA' },
  { value: 'AUD', label: '🇦🇺 AUD ($)', symbol: 'A$', locale: 'en-AU' },
  { value: 'JPY', label: '🇯🇵 JPY (¥)', symbol: '¥', locale: 'ja-JP' },
  { value: 'SGD', label: '🇸🇬 SGD ($)', symbol: 'S$', locale: 'en-SG' },
]

export const getCurrencySymbol = (currencyCode) => {
  return CURRENCIES.find(c => c.value === currencyCode)?.symbol || '$'
}

export const CHART_COLORS = {
  primary: '#5483B3',
  secondary: '#7DA0CA',
  accent: '#C1E8FF',
  income: '#4BC0C0',
  expense: '#FF6384',
  grid: 'rgba(125, 160, 202, 0.1)',
  text: '#C1E8FF',
}

export const PALETTE = {
  bg: '#021024',
  dark: '#052659',
  mid: '#5483B3',
  soft: '#7DA0CA',
  light: '#C1E8FF',
}
