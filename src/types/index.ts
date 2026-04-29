export type Goal = {
  id: number
  name: string
  target_amount: number
  emoji: string
  created_at: string
}

export type RealityEvent = {
  id: number
  name: string
  description: string
  effect_type: 'one_time_cost' | 'savings_cost' | 'income_reduction' | 'optional_cost'
  effect_value: number
  effect_month: number | null
  is_deferrable: boolean
  created_at: string
}

export type ExpenseItem = {
  id: number
  name: string
  category: string
  default_amount: number
  is_fixed: boolean
  is_insurance: boolean
  created_at: string
}

export type Session = {
  id: number
  player_name: string
  goal_id: number
  reality_event_id: number
  income_work: number
  income_job: number
  income_family: number
  savings_start: number
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
