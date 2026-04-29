import { FUCKUPS, EXPENSE_ITEMS } from './gameData'

export type ActiveFuckup = {
  fuckupId: string
  month: number
}

export type MonthChoice = {
  month: number
  itemIds: string[]
  optionalPaid?: boolean
}

export type GameState = {
  playerName: string
  goalId: string
  goalName: string
  goalEmoji: string
  goalTarget: number
  difficulty: number
  incomeWork: number
  incomeJob: number
  incomeFamily: number
  savingsStart: number
  currentMonth: number
  activeFuckups: ActiveFuckup[]
  monthChoices: MonthChoice[]
}

const KEY = 'budget_hero_v2'

export function saveState(state: GameState): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(KEY, JSON.stringify(state))
  }
}

export function loadState(): GameState | null {
  if (typeof window === 'undefined') return null
  const s = localStorage.getItem(KEY)
  return s ? JSON.parse(s) : null
}

export function clearState(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(KEY)
  }
}

export function selectFuckups(difficulty: number): ActiveFuckup[] {
  const shuffled = [...FUCKUPS].sort(() => Math.random() - 0.5)
  const selected = shuffled.slice(0, difficulty)
  const months = Array.from({ length: 12 }, (_, i) => i + 1).sort(() => Math.random() - 0.5)
  return selected.map((f, i) => ({ fuckupId: f.id, month: months[i] }))
}

export function computeBalance(state: GameState, upToMonth: number): number {
  let balance = state.savingsStart
  const baseIncome = state.incomeWork + state.incomeJob + state.incomeFamily

  for (let m = 1; m <= upToMonth; m++) {
    const monthFuckups = state.activeFuckups.filter(f => f.month === m)
    const monthChoice = state.monthChoices.find(mc => mc.month === m)

    let income = baseIncome
    if (monthFuckups.some(f => FUCKUPS.find(fd => fd.id === f.fuckupId)?.effectType === 'income_reduction')) {
      income = Math.round(baseIncome * 0.5)
    }

    const spent = (monthChoice?.itemIds ?? []).reduce((s, id) => {
      const item = EXPENSE_ITEMS.find(i => i.id === id)
      return s + (item?.defaultAmount ?? 0)
    }, 0)

    balance += income - spent

    for (const af of monthFuckups) {
      const def = FUCKUPS.find(fd => fd.id === af.fuckupId)
      if (!def) continue
      if (def.effectType === 'savings_cost') {
        balance -= def.effectValue
      }
      if (def.effectType === 'one_time_cost') {
        const hasInsurance = state.monthChoices
          .filter(mc => mc.month < m)
          .some(mc => mc.itemIds.includes('insurance'))
        if (!hasInsurance) balance -= def.effectValue
      }
      if (def.effectType === 'optional_cost' && monthChoice?.optionalPaid) {
        balance -= def.effectValue
      }
    }
  }

  return balance
}

export function getTier(finalBalance: number, goalTarget: number) {
  if (finalBalance > goalTarget * 1.05) return {
    label: 'Skrblík', emoji: '🏆', color: '#F59E0B', bg: '#FFFAEB',
    desc: 'Dosáhl jsi cíle a ještě ti zbyly peníze navíc!',
  }
  if (finalBalance >= goalTarget * 0.95) return {
    label: 'Střední třída', emoji: '😊', color: '#6DC030', bg: '#E5F9CC',
    desc: 'Cíl splněn "šur null" — přesně jak měl být.',
  }
  if (finalBalance >= 0) return {
    label: 'Rozpadlé sny', emoji: '😓', color: '#FF9B3B', bg: '#FFF0DC',
    desc: 'Cíl nesplněn, ale aspoň jsi neprodělal. Příště víc šetřit!',
  }
  return {
    label: 'Looser', emoji: '💀', color: '#FF4B4B', bg: '#FFE0E0',
    desc: 'Cíl nesplněn a ještě jsi v mínusu. Příjmy nestačily na výdaje.',
  }
}
