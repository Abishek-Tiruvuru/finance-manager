// services/transactionService.js
// All Supabase database operations for transactions

import { supabase } from '../lib/supabase'

/**
 * Fetch all transactions for the current user
 */
export async function getTransactions(userId, filters = {}) {
  let query = supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })

  // Apply optional filters
  if (filters.type) query = query.eq('type', filters.type)
  if (filters.category) query = query.eq('category', filters.category)
  if (filters.startDate) query = query.gte('date', filters.startDate)
  if (filters.endDate) query = query.lte('date', filters.endDate)

  const { data, error } = await query
  if (error) throw error
  return data
}

/**
 * Add a new transaction
 */
export async function addTransaction(transaction) {
  const { data, error } = await supabase
    .from('transactions')
    .insert([transaction])
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Update an existing transaction
 */
export async function updateTransaction(id, updates) {
  const { data, error } = await supabase
    .from('transactions')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Delete a transaction
 */
export async function deleteTransaction(id) {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id)

  if (error) throw error
  return true
}

/**
 * Get summary statistics for the current user
 */
export async function getSummary(userId) {
  const { data, error } = await supabase
    .from('transactions')
    .select('amount, type')
    .eq('user_id', userId)

  if (error) throw error

  const income = data
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const expenses = data
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  return {
    income,
    expenses,
    balance: income - expenses,
    savings: income - expenses,
  }
}

/**
 * Get spending by category for pie/donut charts
 */
export async function getSpendingByCategory(userId, month = null) {
  let query = supabase
    .from('transactions')
    .select('category, amount')
    .eq('user_id', userId)
    .eq('type', 'expense')

  if (month) {
    const start = `${month}-01`
    const end = `${month}-31`
    query = query.gte('date', start).lte('date', end)
  }

  const { data, error } = await query
  if (error) throw error

  // Group by category
  const grouped = {}
  data.forEach(t => {
    grouped[t.category] = (grouped[t.category] || 0) + Number(t.amount)
  })

  return grouped
}

/**
 * Get monthly income vs expenses for bar chart
 */
export async function getMonthlyData(userId, year = new Date().getFullYear()) {
  const { data, error } = await supabase
    .from('transactions')
    .select('amount, type, date')
    .eq('user_id', userId)
    .gte('date', `${year}-01-01`)
    .lte('date', `${year}-12-31`)

  if (error) throw error

  // Initialize 12 months
  const months = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    income: 0,
    expenses: 0,
  }))

  data.forEach(t => {
    const month = new Date(t.date).getMonth()
    if (t.type === 'income') {
      months[month].income += Number(t.amount)
    } else {
      months[month].expenses += Number(t.amount)
    }
  })

  return months
}

/**
 * Get user profile / budget settings
 */
export async function getUserProfile(userId) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

/**
 * Upsert user profile / budget settings
 */
export async function upsertUserProfile(userId, profile) {
  const { data, error } = await supabase
    .from('user_profiles')
    .upsert({ user_id: userId, ...profile })
    .select()
    .single()

  if (error) throw error
  return data
}
