export type Scenario = {
  id: number
  name: string
  monthly_income: number
  fixed_expenses: number
  goal_name: string
  goal_amount: number
  goal_months: number
  created_at: string
}

export type ExpenseItem = {
  id: number
  scenario_id: number
  name: string
  category: string
  amount: number
  created_at: string
}

export type Session = {
  id: number
  scenario_id: number
  player_name: string
  current_month: number
  created_at: string
}

export type SessionChoice = {
  id: number
  session_id: number
  expense_item_id: number
  month: number
  created_at: string
}
