'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Session, Goal, RealityEvent, ExpenseItem, SessionChoice } from '@/types'

const CATEGORY_ICONS: Record<string, string> = {
  'BYDLENÍ': '🏠', 'SPOTŘEBA': '🛒', 'INVESTICE': '📈',
  'SPOŘENÍ': '🐷', 'ZÁBAVA': '🎮', 'REZERVY': '🏦',
}

type Tier = { label: string; emoji: string; color: string; desc: string }

function getTier(finalBalance: number, goalAmount: number): Tier {
  if (finalBalance > goalAmount * 1.05) return { label: 'Skrblík', emoji: '🏆', color: 'bg-yellow-400', desc: 'Dosáhl jsi cíle a ještě ti zbyly peníze navíc!' }
  if (finalBalance >= goalAmount * 0.95) return { label: 'Střední třída', emoji: '😊', color: 'bg-green-400', desc: 'Cíl splněn "šur null" — přesně jak měl být.' }
  if (finalBalance >= 0) return { label: 'Rozpadlé sny', emoji: '😓', color: 'bg-orange-400', desc: 'Cíl nesplněn, ale aspoň jsi neprodělal. Příště víc šetřit!' }
  return { label: 'Looser', emoji: '💀', color: 'bg-red-500', desc: 'Cíl nesplněn a ještě jsi v mínusu. Příjem nestačil na výdaje.' }
}

export default function SummaryPage() {
  const router = useRouter()
  const [session, setSession] = useState<Session | null>(null)
  const [goal, setGoal] = useState<Goal | null>(null)
  const [event, setEvent] = useState<RealityEvent | null>(null)
  const [items, setItems] = useState<ExpenseItem[]>([])
  const [choices, setChoices] = useState<SessionChoice[]>([])
  const [loading, setLoading] = useState(true)
  const [resetting, setResetting] = useState(false)

  useEffect(() => {
    const sid = localStorage.getItem('session_id')
    if (!sid) { router.push('/'); return }
    loadSummary(Number(sid))
  }, [])

  async function loadSummary(sessionId: number) {
    const supabase = createClient()
    const { data: sess } = await supabase.from('sessions').select('*').eq('id', sessionId).single()
    if (!sess) { router.push('/'); return }
    setSession(sess)

    const [{ data: g }, { data: ev }, { data: expItems }, { data: allChoices }] = await Promise.all([
      supabase.from('goals').select('*').eq('id', sess.goal_id).single(),
      supabase.from('reality_events').select('*').eq('id', sess.reality_event_id).single(),
      supabase.from('expense_items').select('*'),
      supabase.from('session_choices').select('*').eq('session_id', sessionId),
    ])
    setGoal(g)
    setEvent(ev)
    setItems(expItems ?? [])
    setChoices(allChoices ?? [])
    setLoading(false)
  }

  async function resetGame() {
    const sid = localStorage.getItem('session_id')
    if (!sid) return
    setResetting(true)
    const supabase = createClient()
    await supabase.from('sessions').delete().eq('id', Number(sid))
    localStorage.removeItem('session_id')
    localStorage.removeItem(`car_repair_${sid}`)
    router.push('/')
  }

  if (loading || !session || !goal || !event) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
      <p className="text-gray-500">Načítám výsledky...</p>
    </div>
  )

  const base = session.income_work + session.income_job + session.income_family
  let finalBalance = session.savings_start
  // immediate savings_cost
  if (event.effect_type === 'savings_cost' && event.effect_month === null) finalBalance -= event.effect_value

  for (let m = 1; m <= 12; m++) {
    let income = base
    if (event.effect_type === 'income_reduction' && event.effect_month === m) income = Math.round(base * 0.5)
    if (event.effect_type === 'savings_cost' && event.effect_month === m) finalBalance -= event.effect_value

    const monthSpent = choices.filter(c => c.month === m).reduce((s, c) => {
      const item = items.find(i => i.id === c.expense_item_id)
      return s + (item?.default_amount ?? 0)
    }, 0)

    if (event.effect_type === 'one_time_cost' && event.effect_month === m) {
      const hadInsurance = choices.some(c => c.month < m && items.find(i => i.id === c.expense_item_id)?.is_insurance)
      if (!hadInsurance) finalBalance -= event.effect_value
    }
    if (event.effect_type === 'optional_cost' && event.effect_month === m) {
      const carPaid = localStorage.getItem(`car_repair_${session.id}`) === 'true'
      if (carPaid) finalBalance -= event.effect_value
    }

    finalBalance += income - monthSpent
  }

  const tier = getTier(finalBalance, goal.target_amount)
  const goalProgress = Math.min(100, Math.max(0, Math.round((finalBalance / goal.target_amount) * 100)))
  const totalSpent = choices.reduce((s, c) => {
    const item = items.find(i => i.id === c.expense_item_id)
    return s + (item?.default_amount ?? 0)
  }, 0)

  const byCategory: Record<string, number> = {}
  choices.forEach(c => {
    const item = items.find(i => i.id === c.expense_item_id)
    if (item && item.category !== 'REZERVY') {
      byCategory[item.category] = (byCategory[item.category] ?? 0) + item.default_amount
    }
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
      <div className="max-w-xl mx-auto py-8">

        {/* Tier banner */}
        <div className={`${tier.color} rounded-2xl p-6 mb-6 text-center`}>
          <div className="text-5xl mb-2">{tier.emoji}</div>
          <h1 className="text-3xl font-bold text-white mb-1">{tier.label}</h1>
          <p className="text-white/90 text-sm">{tier.desc}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white rounded-2xl p-4 text-center">
            <div className={`text-xl font-bold ${finalBalance >= 0 ? 'text-green-600' : 'text-red-500'}`}>
              {finalBalance.toLocaleString('cs-CZ')} Kč
            </div>
            <div className="text-xs text-gray-500 mt-1">Konečný zůstatek</div>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center">
            <div className="text-xl font-bold text-red-500">{totalSpent.toLocaleString('cs-CZ')} Kč</div>
            <div className="text-xs text-gray-500 mt-1">Celkem utraceno</div>
          </div>
        </div>

        {/* Goal progress */}
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">{goal.emoji} {goal.name}</span>
            <span className="text-sm font-bold text-indigo-600">{goalProgress}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div className={`h-3 rounded-full transition-all ${tier.color}`} style={{ width: `${goalProgress}%` }} />
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {Math.max(0, finalBalance).toLocaleString('cs-CZ')} Kč / {goal.target_amount.toLocaleString('cs-CZ')} Kč
          </div>
        </div>

        {/* Event recap */}
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
          <h2 className="font-semibold text-gray-700 mb-2">⚡ Tvůj fuckup byl: {event.name}</h2>
          <p className="text-sm text-gray-500">{event.description}</p>
        </div>

        {/* Category breakdown */}
        {Object.keys(byCategory).length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
            <h2 className="font-semibold text-gray-700 mb-3">Výdaje podle kategorií</h2>
            <div className="space-y-3">
              {Object.entries(byCategory).sort(([, a], [, b]) => b - a).map(([cat, amount]) => (
                <div key={cat}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{CATEGORY_ICONS[cat] ?? '📦'} {cat}</span>
                    <span className="font-semibold text-gray-800">{amount.toLocaleString('cs-CZ')} Kč</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="h-2 bg-indigo-300 rounded-full"
                      style={{ width: `${Math.round((amount / totalSpent) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <button onClick={resetGame} disabled={resetting}
          className="w-full py-4 bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-200 text-white font-bold text-lg rounded-2xl transition-colors">
          {resetting ? 'Resetuji...' : 'Zkusit znovu 🔄'}
        </button>
      </div>
    </div>
  )
}
