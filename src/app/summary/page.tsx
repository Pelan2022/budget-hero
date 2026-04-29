'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Session, Scenario, ExpenseItem, SessionChoice } from '@/types'

const CATEGORY_ICONS: Record<string, string> = {
  'Zábava': '🎮',
  'Oblečení': '👕',
  'Vzdělání': '📚',
  'Jídlo': '🍔',
  'Sport': '⚽',
}

export default function SummaryPage() {
  const router = useRouter()
  const [session, setSession] = useState<Session | null>(null)
  const [scenario, setScenario] = useState<Scenario | null>(null)
  const [items, setItems] = useState<ExpenseItem[]>([])
  const [choices, setChoices] = useState<SessionChoice[]>([])
  const [loading, setLoading] = useState(true)
  const [resetting, setResetting] = useState(false)

  useEffect(() => {
    const sessionId = localStorage.getItem('session_id')
    if (!sessionId) { router.push('/'); return }
    loadSummary(Number(sessionId))
  }, [])

  async function loadSummary(sessionId: number) {
    const supabase = createClient()
    const { data: sess } = await supabase.from('sessions').select('*').eq('id', sessionId).single()
    if (!sess) { router.push('/'); return }
    setSession(sess)

    const { data: scen } = await supabase.from('scenarios').select('*').eq('id', sess.scenario_id).single()
    setScenario(scen)

    const { data: expItems } = await supabase.from('expense_items').select('*').eq('scenario_id', sess.scenario_id)
    setItems(expItems ?? [])

    const { data: allChoices } = await supabase.from('session_choices').select('*').eq('session_id', sessionId)
    setChoices(allChoices ?? [])

    setLoading(false)
  }

  async function resetGame() {
    const sessionId = localStorage.getItem('session_id')
    if (!sessionId) return
    setResetting(true)
    const supabase = createClient()
    await supabase.from('sessions').delete().eq('id', Number(sessionId))
    localStorage.removeItem('session_id')
    router.push('/')
  }

  if (loading || !session || !scenario) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
      <p className="text-gray-500">Načítám výsledky...</p>
    </div>
  )

  const monthlyBudget = scenario.monthly_income - scenario.fixed_expenses
  const totalSaved = 12 * monthlyBudget - choices.reduce((sum, c) => {
    const item = items.find(i => i.id === c.expense_item_id)
    return sum + (item?.amount ?? 0)
  }, 0)
  const goalReached = totalSaved >= scenario.goal_amount
  const goalProgress = Math.min(100, Math.round((totalSaved / scenario.goal_amount) * 100))

  // Spending by category
  const byCategory: Record<string, number> = {}
  choices.forEach(c => {
    const item = items.find(i => i.id === c.expense_item_id)
    if (item) byCategory[item.category] = (byCategory[item.category] ?? 0) + item.amount
  })

  // Total spent
  const totalSpent = Object.values(byCategory).reduce((a, b) => a + b, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-2xl mx-auto py-8">

        {/* Result banner */}
        <div className={`rounded-2xl p-6 mb-6 text-center ${goalReached ? 'bg-green-400' : 'bg-orange-400'}`}>
          <div className="text-5xl mb-3">{goalReached ? '🏆' : '😅'}</div>
          <h1 className="text-2xl font-bold text-white mb-1">
            {goalReached ? 'Cíl splněn!' : 'Příště to vyjde!'}
          </h1>
          <p className="text-white/90 text-sm">
            {goalReached
              ? `Skvělá práce, ${session.player_name}! Na ${scenario.goal_name} máš dost.`
              : `${session.player_name}, chybělo ti ${(scenario.goal_amount - totalSaved).toLocaleString('cs-CZ')} Kč na ${scenario.goal_name}.`
            }
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{totalSaved.toLocaleString('cs-CZ')} Kč</div>
            <div className="text-xs text-gray-500 mt-1">Celkem naspořeno</div>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-red-500">{totalSpent.toLocaleString('cs-CZ')} Kč</div>
            <div className="text-xs text-gray-500 mt-1">Celkem utraceno</div>
          </div>
        </div>

        {/* Goal progress */}
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">🎯 {scenario.goal_name}</span>
            <span className="text-sm font-bold text-blue-600">{goalProgress}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-4">
            <div
              className={`h-4 rounded-full transition-all ${goalReached ? 'bg-green-400' : 'bg-blue-400'}`}
              style={{ width: `${goalProgress}%` }}
            />
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {totalSaved.toLocaleString('cs-CZ')} Kč / {scenario.goal_amount.toLocaleString('cs-CZ')} Kč
          </div>
        </div>

        {/* Spending by category */}
        {Object.keys(byCategory).length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
            <h2 className="font-semibold text-gray-700 mb-3">Výdaje podle kategorie</h2>
            <div className="space-y-3">
              {Object.entries(byCategory).sort(([, a], [, b]) => b - a).map(([cat, amount]) => (
                <div key={cat}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{CATEGORY_ICONS[cat] ?? '📦'} {cat}</span>
                    <span className="font-semibold text-gray-800">{amount.toLocaleString('cs-CZ')} Kč</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="h-2 bg-blue-300 rounded-full"
                      style={{ width: `${Math.round((amount / totalSpent) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <button
          onClick={resetGame}
          disabled={resetting}
          className="w-full py-4 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-200 text-white font-bold text-lg rounded-2xl transition-colors"
        >
          {resetting ? 'Resetuji...' : 'Zkusit znovu 🔄'}
        </button>
      </div>
    </div>
  )
}
