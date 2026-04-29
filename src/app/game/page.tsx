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

const MONTH_NAMES = [
  '', 'Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen',
  'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec'
]

export default function GamePage() {
  const router = useRouter()
  const [session, setSession] = useState<Session | null>(null)
  const [scenario, setScenario] = useState<Scenario | null>(null)
  const [items, setItems] = useState<ExpenseItem[]>([])
  const [choices, setChoices] = useState<SessionChoice[]>([])
  const [thisMonthChoices, setThisMonthChoices] = useState<Set<number>>(new Set())
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const sessionId = localStorage.getItem('session_id')
    if (!sessionId) { router.push('/'); return }
    loadGame(Number(sessionId))
  }, [])

  async function loadGame(sessionId: number) {
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

    const thisMonth = new Set((allChoices ?? []).filter(c => c.month === sess.current_month).map(c => c.expense_item_id))
    setThisMonthChoices(thisMonth)

    setLoading(false)
  }

  function toggleItem(itemId: number) {
    setThisMonthChoices(prev => {
      const next = new Set(prev)
      if (next.has(itemId)) next.delete(itemId)
      else next.add(itemId)
      return next
    })
  }

  function getMonthlySpent(month: number) {
    return choices.filter(c => c.month === month).reduce((sum, c) => {
      const item = items.find(i => i.id === c.expense_item_id)
      return sum + (item?.amount ?? 0)
    }, 0)
  }

  function getTotalSaved() {
    if (!scenario) return 0
    const monthlyBudget = scenario.monthly_income - scenario.fixed_expenses
    let saved = 0
    for (let m = 1; m < (session?.current_month ?? 1); m++) {
      saved += monthlyBudget - getMonthlySpent(m)
    }
    return saved
  }

  function getCurrentMonthSpending() {
    if (!scenario) return 0
    return Array.from(thisMonthChoices).reduce((sum, itemId) => {
      const item = items.find(i => i.id === itemId)
      return sum + (item?.amount ?? 0)
    }, 0)
  }

  async function confirmMonth() {
    if (!session || !scenario) return
    setSaving(true)
    const supabase = createClient()

    // Remove old choices for this month and save new ones
    await supabase.from('session_choices').delete().eq('session_id', session.id).eq('month', session.current_month)

    if (thisMonthChoices.size > 0) {
      await supabase.from('session_choices').insert(
        Array.from(thisMonthChoices).map(itemId => ({
          session_id: session.id,
          expense_item_id: itemId,
          month: session.current_month
        }))
      )
    }

    const nextMonth = session.current_month + 1
    if (nextMonth > 12) {
      await supabase.from('sessions').update({ current_month: 13 }).eq('id', session.id)
      router.push('/summary')
    } else {
      await supabase.from('sessions').update({ current_month: nextMonth }).eq('id', session.id)
      setSession({ ...session, current_month: nextMonth })
      // Reload choices
      const { data: allChoices } = await supabase.from('session_choices').select('*').eq('session_id', session.id)
      setChoices(allChoices ?? [])
      setThisMonthChoices(new Set())
    }
    setSaving(false)
  }

  if (loading || !session || !scenario) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
      <p className="text-gray-500">Načítám hru...</p>
    </div>
  )

  const monthlyBudget = scenario.monthly_income - scenario.fixed_expenses
  const currentSpending = getCurrentMonthSpending()
  const remaining = monthlyBudget - currentSpending
  const totalSaved = getTotalSaved()
  const goalProgress = Math.min(100, Math.round((totalSaved / scenario.goal_amount) * 100))

  const categories = [...new Set(items.map(i => i.category))]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-2xl mx-auto py-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm text-gray-500">{scenario.name}</div>
            <h1 className="text-2xl font-bold text-gray-800">{MONTH_NAMES[session.current_month]}</h1>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Měsíc</div>
            <div className="text-2xl font-bold text-blue-500">{session.current_month}/12</div>
          </div>
        </div>

        {/* Budget bar */}
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-500">Volný rozpočet tento měsíc</span>
            <span className={`text-xl font-bold ${remaining < 0 ? 'text-red-500' : 'text-green-600'}`}>
              {remaining.toLocaleString('cs-CZ')} Kč
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${remaining < 0 ? 'bg-red-400' : 'bg-green-400'}`}
              style={{ width: `${Math.max(0, Math.min(100, (remaining / monthlyBudget) * 100))}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0 Kč</span>
            <span>{monthlyBudget.toLocaleString('cs-CZ')} Kč</span>
          </div>
        </div>

        {/* Goal progress */}
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-500">🎯 {scenario.goal_name}</span>
            <span className="text-sm font-semibold text-blue-600">{goalProgress}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div className="h-3 bg-blue-400 rounded-full transition-all" style={{ width: `${goalProgress}%` }} />
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Naspořeno: {totalSaved.toLocaleString('cs-CZ')} Kč / {scenario.goal_amount.toLocaleString('cs-CZ')} Kč
          </div>
        </div>

        {/* Expense items by category */}
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
          <h2 className="font-semibold text-gray-700 mb-4">Co si tento měsíc koupíš?</h2>
          {categories.map(cat => (
            <div key={cat} className="mb-4">
              <div className="text-sm font-medium text-gray-400 mb-2">
                {CATEGORY_ICONS[cat] ?? '📦'} {cat}
              </div>
              <div className="space-y-2">
                {items.filter(i => i.category === cat).map(item => {
                  const checked = thisMonthChoices.has(item.id)
                  const wouldOverdraft = !checked && remaining - item.amount < 0
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggleItem(item.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all text-left ${
                        checked
                          ? 'border-blue-400 bg-blue-50'
                          : wouldOverdraft
                          ? 'border-red-100 bg-red-50 opacity-70'
                          : 'border-gray-100 hover:border-blue-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          checked ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                        }`}>
                          {checked && <span className="text-white text-xs">✓</span>}
                        </div>
                        <span className="text-gray-800 text-sm">{item.name}</span>
                      </div>
                      <span className={`font-semibold text-sm ${checked ? 'text-blue-600' : wouldOverdraft ? 'text-red-400' : 'text-gray-600'}`}>
                        {item.amount.toLocaleString('cs-CZ')} Kč
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Confirm button */}
        <button
          onClick={confirmMonth}
          disabled={saving}
          className="w-full py-4 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-200 text-white font-bold text-lg rounded-2xl transition-colors"
        >
          {saving ? 'Ukládám...' : session.current_month === 12 ? 'Vyhodnotit rok 🏆' : `Potvrdit ${MONTH_NAMES[session.current_month]} →`}
        </button>
      </div>
    </div>
  )
}
