'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Session, Goal, RealityEvent, ExpenseItem, SessionChoice } from '@/types'

const CATEGORY_ICONS: Record<string, string> = {
  'BYDLENÍ': '🏠',
  'SPOTŘEBA': '🛒',
  'INVESTICE': '📈',
  'SPOŘENÍ': '🐷',
  'ZÁBAVA': '🎮',
  'REZERVY': '🏦',
}

const MONTH_NAMES = ['', 'Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen',
  'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec']

const CATEGORIES = ['BYDLENÍ', 'SPOTŘEBA', 'INVESTICE', 'SPOŘENÍ', 'ZÁBAVA', 'REZERVY']

export default function GamePage() {
  const router = useRouter()
  const [session, setSession] = useState<Session | null>(null)
  const [goal, setGoal] = useState<Goal | null>(null)
  const [event, setEvent] = useState<RealityEvent | null>(null)
  const [items, setItems] = useState<ExpenseItem[]>([])
  const [choices, setChoices] = useState<SessionChoice[]>([])
  const [thisMonth, setThisMonth] = useState<Set<number>>(new Set())
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [carRepairPaid, setCarRepairPaid] = useState<boolean | null>(null)
  const [showEventModal, setShowEventModal] = useState(false)

  useEffect(() => {
    const sid = localStorage.getItem('session_id')
    if (!sid) { router.push('/'); return }
    loadGame(Number(sid))
  }, [])

  async function loadGame(sessionId: number) {
    const supabase = createClient()
    const { data: sess } = await supabase.from('sessions').select('*').eq('id', sessionId).single()
    if (!sess) { router.push('/'); return }
    setSession(sess)

    const [{ data: g }, { data: ev }, { data: expItems }, { data: allChoices }] = await Promise.all([
      supabase.from('goals').select('*').eq('id', sess.goal_id).single(),
      supabase.from('reality_events').select('*').eq('id', sess.reality_event_id).single(),
      supabase.from('expense_items').select('*').order('is_fixed', { ascending: false }),
      supabase.from('session_choices').select('*').eq('session_id', sessionId),
    ])

    setGoal(g)
    setEvent(ev)
    setItems(expItems ?? [])

    const allC = allChoices ?? []
    setChoices(allC)

    // Pre-check fixed items for current month
    const fixedIds = new Set((expItems ?? []).filter(i => i.is_fixed).map(i => i.id))
    const prevChosen = new Set(allC.filter(c => c.month === sess.current_month).map(c => c.expense_item_id))
    setThisMonth(new Set([...fixedIds, ...prevChosen]))

    // Show event modal for optional_cost events
    if (ev?.is_deferrable && ev.effect_month === sess.current_month) {
      const decided = localStorage.getItem(`car_repair_${sessionId}`)
      if (decided === null) setShowEventModal(true)
      else setCarRepairPaid(decided === 'true')
    }

    setLoading(false)
  }

  function toggleItem(item: ExpenseItem) {
    if (item.is_fixed) return
    setThisMonth(prev => {
      const next = new Set(prev)
      if (next.has(item.id)) next.delete(item.id)
      else next.add(item.id)
      return next
    })
  }

  function getEffectiveIncome() {
    if (!session || !event) return session ? session.income_work + session.income_job + session.income_family : 0
    const base = session.income_work + session.income_job + session.income_family
    if (event.effect_type === 'income_reduction' && event.effect_month === session.current_month) {
      return Math.round(base * (1 - event.effect_value / 100))
    }
    return base
  }

  function getEventCostThisMonth() {
    if (!event || !session) return 0
    if (event.effect_month !== session.current_month) return 0
    if (event.effect_type === 'one_time_cost') {
      const hasInsurance = choices.some(c => {
        const item = items.find(i => i.id === c.expense_item_id)
        return item?.is_insurance && c.month < session.current_month
      })
      return hasInsurance ? 0 : event.effect_value
    }
    if (event.effect_type === 'optional_cost') {
      return carRepairPaid === true ? event.effect_value : 0
    }
    return 0
  }

  function getCurrentSpending() {
    return Array.from(thisMonth).reduce((sum, id) => {
      const item = items.find(i => i.id === id)
      return sum + (item?.default_amount ?? 0)
    }, 0) + getEventCostThisMonth()
  }

  function getTotalSavedSoFar() {
    if (!session || !goal) return 0
    const base = session.income_work + session.income_job + session.income_family
    let savings = session.savings_start
    // immediate savings_cost (rozbitá pračka = null month)
    if (event?.effect_type === 'savings_cost' && event.effect_month === null) {
      savings -= event.effect_value
    }
    for (let m = 1; m < session.current_month; m++) {
      let income = base
      if (event?.effect_type === 'income_reduction' && event.effect_month === m) income = Math.round(base * 0.5)
      if (event?.effect_type === 'savings_cost' && event.effect_month === m) savings -= event.effect_value
      const spent = choices.filter(c => c.month === m).reduce((s, c) => {
        const item = items.find(i => i.id === c.expense_item_id)
        return s + (item?.default_amount ?? 0)
      }, 0)
      // one_time_cost events
      if (event?.effect_month === m && event.effect_type === 'one_time_cost') {
        const hadInsurance = choices.some(c => c.month < m && items.find(i => i.id === c.expense_item_id)?.is_insurance)
        if (!hadInsurance) savings -= event.effect_value
      }
      savings += income - spent
    }
    return savings
  }

  async function confirmMonth() {
    if (!session) return
    setSaving(true)
    const supabase = createClient()

    await supabase.from('session_choices').delete().eq('session_id', session.id).eq('month', session.current_month)
    const toInsert = Array.from(thisMonth).map(id => ({ session_id: session.id, expense_item_id: id, month: session.current_month }))
    if (toInsert.length > 0) await supabase.from('session_choices').insert(toInsert)

    const nextMonth = session.current_month + 1
    if (nextMonth > 12) {
      await supabase.from('sessions').update({ current_month: 13 }).eq('id', session.id)
      router.push('/summary')
      return
    }
    await supabase.from('sessions').update({ current_month: nextMonth }).eq('id', session.id)
    const updatedSession = { ...session, current_month: nextMonth }
    setSession(updatedSession)

    const { data: allChoices } = await supabase.from('session_choices').select('*').eq('session_id', session.id)
    setChoices(allChoices ?? [])

    const fixedIds = new Set(items.filter(i => i.is_fixed).map(i => i.id))
    setThisMonth(new Set(fixedIds))
    setCarRepairPaid(null)

    // Check if next month has optional event
    if (event?.is_deferrable && event.effect_month === nextMonth) {
      const decided = localStorage.getItem(`car_repair_${session.id}`)
      if (decided === null) setShowEventModal(true)
      else setCarRepairPaid(decided === 'true')
    }

    setSaving(false)
  }

  function decideCarRepair(pay: boolean) {
    if (!session) return
    localStorage.setItem(`car_repair_${session.id}`, String(pay))
    setCarRepairPaid(pay)
    setShowEventModal(false)
  }

  if (loading || !session || !goal || !event) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
      <p className="text-gray-500">Načítám hru...</p>
    </div>
  )

  const effectiveIncome = getEffectiveIncome()
  const currentSpending = getCurrentSpending()
  const remaining = effectiveIncome - currentSpending
  const totalSaved = getTotalSavedSoFar()
  const goalProgress = Math.min(100, Math.round((Math.max(0, totalSaved) / goal.target_amount) * 100))
  const incomeReduced = event.effect_type === 'income_reduction' && event.effect_month === session.current_month

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
      <div className="max-w-xl mx-auto py-6">

        {/* Car repair modal */}
        {showEventModal && event.is_deferrable && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
              <div className="text-3xl mb-3 text-center">🚗</div>
              <h3 className="font-bold text-gray-800 text-lg text-center mb-2">{event.name}</h3>
              <p className="text-gray-600 text-sm text-center mb-5">{event.description}</p>
              <div className="space-y-2">
                <button onClick={() => decideCarRepair(true)}
                  className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl">
                  Zaplatit opravu — {event.effect_value.toLocaleString('cs-CZ')} Kč
                </button>
                <button onClick={() => decideCarRepair(false)}
                  className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl">
                  Chodit pěšky — ušetřím
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-xs text-gray-400">{session.player_name}</div>
            <h1 className="text-2xl font-bold text-gray-800">{MONTH_NAMES[session.current_month]}</h1>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-400">Měsíc</div>
            <div className="text-2xl font-bold text-indigo-500">{session.current_month}/12</div>
          </div>
        </div>

        {/* Event notification */}
        {event.effect_month === session.current_month && (
          <div className={`rounded-2xl p-4 mb-4 ${
            event.effect_type === 'income_reduction' ? 'bg-yellow-50 border border-yellow-200' :
            event.effect_type === 'one_time_cost' ? 'bg-red-50 border border-red-200' :
            'bg-orange-50 border border-orange-200'
          }`}>
            <div className="font-semibold text-gray-800 text-sm">⚡ {event.name}</div>
            <div className="text-xs text-gray-600 mt-1">{event.description}</div>
            {event.effect_type === 'income_reduction' && (
              <div className="text-xs text-yellow-700 font-medium mt-1">Příjem tento měsíc: {effectiveIncome.toLocaleString('cs-CZ')} Kč (–50 %)</div>
            )}
            {event.effect_type === 'one_time_cost' && getEventCostThisMonth() === 0 && (
              <div className="text-xs text-green-700 font-medium mt-1">✓ Pojištění tě zachránilo!</div>
            )}
            {event.effect_type === 'one_time_cost' && getEventCostThisMonth() > 0 && (
              <div className="text-xs text-red-700 font-medium mt-1">Jednorázový výdaj: –{getEventCostThisMonth().toLocaleString('cs-CZ')} Kč</div>
            )}
            {event.is_deferrable && carRepairPaid === false && (
              <div className="text-xs text-green-700 font-medium mt-1">✓ Jezdíš MHD — ušetřeno {event.effect_value.toLocaleString('cs-CZ')} Kč</div>
            )}
          </div>
        )}

        {/* Income reduction warning */}
        {incomeReduced && (
          <div className="bg-yellow-100 rounded-xl p-3 mb-3 text-sm text-yellow-800">
            ⚠️ Příjem tento měsíc je jen {effectiveIncome.toLocaleString('cs-CZ')} Kč (nemoc = –50 %)
          </div>
        )}

        {/* Budget remaining */}
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-500">Zbývá tento měsíc</span>
            <span className={`text-xl font-bold ${remaining < 0 ? 'text-red-500' : 'text-green-600'}`}>
              {remaining.toLocaleString('cs-CZ')} Kč
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5">
            <div className={`h-2.5 rounded-full transition-all ${remaining < 0 ? 'bg-red-400' : 'bg-green-400'}`}
              style={{ width: `${Math.max(0, Math.min(100, (remaining / effectiveIncome) * 100))}%` }} />
          </div>
        </div>

        {/* Goal progress */}
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-500">{goal.emoji} {goal.name}</span>
            <span className="text-sm font-bold text-indigo-600">{goalProgress}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5">
            <div className="h-2.5 bg-indigo-400 rounded-full transition-all" style={{ width: `${goalProgress}%` }} />
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {Math.max(0, totalSaved).toLocaleString('cs-CZ')} / {goal.target_amount.toLocaleString('cs-CZ')} Kč
          </div>
        </div>

        {/* Expense categories */}
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
          <h2 className="font-semibold text-gray-700 mb-4">Rozděl peníze tento měsíc</h2>
          {CATEGORIES.map(cat => {
            const catItems = items.filter(i => i.category === cat)
            if (cat === 'REZERVY') {
              return (
                <div key={cat} className="mb-4">
                  <div className="text-sm font-medium text-gray-400 mb-2">{CATEGORY_ICONS[cat]} {cat}</div>
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-sm text-gray-600 flex justify-between">
                    <span>Zbytek měsíce</span>
                    <span className={`font-bold ${remaining < 0 ? 'text-red-500' : 'text-gray-700'}`}>
                      {remaining.toLocaleString('cs-CZ')} Kč
                    </span>
                  </div>
                </div>
              )
            }
            if (catItems.length === 0) return null
            return (
              <div key={cat} className="mb-5">
                <div className="text-sm font-medium text-gray-400 mb-2">{CATEGORY_ICONS[cat]} {cat}</div>
                <div className="space-y-2">
                  {catItems.map(item => {
                    const checked = thisMonth.has(item.id)
                    const wouldOverdraft = !checked && !item.is_fixed && remaining - item.default_amount < 0
                    return (
                      <button key={item.id} onClick={() => toggleItem(item)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all text-left ${
                          item.is_fixed
                            ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                            : checked
                            ? 'border-indigo-400 bg-indigo-50'
                            : wouldOverdraft
                            ? 'border-red-100 bg-red-50 opacity-60'
                            : 'border-gray-100 hover:border-indigo-200'
                        }`}>
                        <div className="flex items-center gap-3">
                          {item.is_fixed ? (
                            <div className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-white text-xs">✓</span>
                            </div>
                          ) : (
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              checked ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300'
                            }`}>
                              {checked && <span className="text-white text-xs">✓</span>}
                            </div>
                          )}
                          <div>
                            <span className="text-gray-800 text-sm">{item.name}</span>
                            {item.is_fixed && <span className="ml-2 text-xs text-gray-400">(povinné)</span>}
                            {item.is_insurance && <span className="ml-2 text-xs text-green-600">🛡️ chrání před vytopením</span>}
                          </div>
                        </div>
                        <span className={`font-semibold text-sm ${
                          item.is_fixed ? 'text-gray-500' :
                          checked ? 'text-indigo-600' :
                          wouldOverdraft ? 'text-red-400' : 'text-gray-600'
                        }`}>
                          {item.default_amount.toLocaleString('cs-CZ')} Kč
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        <button onClick={confirmMonth} disabled={saving || showEventModal}
          className="w-full py-4 bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold text-lg rounded-2xl transition-colors">
          {saving ? 'Ukládám...' :
           session.current_month === 12 ? 'Vyhodnotit rok 🏆' :
           `Potvrdit ${MONTH_NAMES[session.current_month]} →`}
        </button>
      </div>
    </div>
  )
}
