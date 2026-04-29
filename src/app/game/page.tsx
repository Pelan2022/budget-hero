'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { loadState, saveState, computeBalance, GameState, MonthChoice } from '@/lib/gameState'
import {
  EXPENSE_ITEMS, FUCKUPS, CATEGORIES,
  CATEGORY_COLORS, CATEGORY_BG, CATEGORY_EMOJIS,
} from '@/lib/gameData'

const MONTHS = ['', 'Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen',
  'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec']

export default function GamePage() {
  const router = useRouter()
  const [state, setState] = useState<GameState | null>(null)
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const [optionalDecision, setOptionalDecision] = useState<boolean | null>(null)
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    const s = loadState()
    if (!s) { router.push('/'); return }
    if (s.currentMonth > 12) { router.push('/summary'); return }
    setState(s)
    setChecked(new Set(EXPENSE_ITEMS.filter(i => i.isFixed).map(i => i.id)))
    setOptionalDecision(null)
  }, [router])

  if (!state) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FFF4C9' }}>
      <p className="font-semibold" style={{ color: '#6B7280' }}>Načítám...</p>
    </div>
  )

  const m = state.currentMonth
  const monthFuckups = state.activeFuckups.filter(f => f.month === m)

  const optFuckup = monthFuckups.find(f => FUCKUPS.find(fd => fd.id === f.fuckupId)?.effectType === 'optional_cost')
  const optFuckupDef = optFuckup ? FUCKUPS.find(fd => fd.id === optFuckup.fuckupId)! : null

  const hasIncomeReduction = monthFuckups.some(f =>
    FUCKUPS.find(fd => fd.id === f.fuckupId)?.effectType === 'income_reduction'
  )
  const baseIncome = state.incomeWork + state.incomeJob + state.incomeFamily
  const currentIncome = hasIncomeReduction ? Math.round(baseIncome * 0.5) : baseIncome

  const spent = [...checked].reduce((s, id) => {
    const item = EXPENSE_ITEMS.find(i => i.id === id)
    return s + (item?.defaultAmount ?? 0)
  }, 0)
  const remainder = currentIncome - spent
  const balanceBefore = computeBalance(state, m - 1)
  const goalPct = Math.min(100, Math.max(0, Math.round((Math.max(0, balanceBefore) / state.goalTarget) * 100)))

  const mandatoryFuckups = monthFuckups.filter(af => {
    const def = FUCKUPS.find(fd => fd.id === af.fuckupId)
    return def && def.effectType !== 'optional_cost' && def.effectType !== 'income_reduction'
  })

  function toggle(id: string) {
    const item = EXPENSE_ITEMS.find(i => i.id === id)
    if (item?.isFixed) return
    setChecked(prev => {
      const next = new Set(prev)
      if (next.has(id)) { next.delete(id) } else { next.add(id) }
      return next
    })
  }

  function confirm() {
    if (!state || confirming) return
    if (optFuckupDef && optionalDecision === null) return
    setConfirming(true)

    const choice: MonthChoice = {
      month: m,
      itemIds: [...checked],
      optionalPaid: optionalDecision ?? false,
    }
    const newState: GameState = {
      ...state,
      currentMonth: m + 1,
      monthChoices: [...state.monthChoices, choice],
    }
    saveState(newState)

    if (m + 1 > 12) {
      router.push('/summary')
    } else {
      setState(newState)
      setChecked(new Set(EXPENSE_ITEMS.filter(i => i.isFixed).map(i => i.id)))
      setOptionalDecision(null)
      setConfirming(false)
    }
  }

  return (
    <div className="min-h-screen pb-28" style={{ backgroundColor: '#FFF4C9' }}>

      {/* ── Sticky header ── */}
      <div className="sticky top-0 z-10 px-4 pt-4 pb-3" style={{ backgroundColor: '#FFF4C9', borderBottom: '2px solid #E5E7EB' }}>
        <div className="max-w-sm mx-auto">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="font-extrabold text-sm" style={{ color: '#2C2C2C' }}>{state.playerName}</span>
              <span className="text-xs font-semibold ml-2" style={{ color: '#6B7280' }}>{state.goalEmoji} {state.goalName}</span>
            </div>
            <span className="text-sm font-extrabold" style={{ color: '#6DC030' }}>{MONTHS[m]} ({m}/12)</span>
          </div>

          {/* Month progress bar */}
          <div className="w-full rounded-full" style={{ height: 12, backgroundColor: '#E5E7EB', border: '2px solid rgba(0,0,0,0.06)' }}>
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${((m - 1) / 12) * 100}%`, background: 'linear-gradient(90deg, #6DC030, #A3D96B)' }} />
          </div>

          <div className="flex justify-between text-xs font-semibold mt-1.5">
            <span style={{ color: '#6B7280' }}>
              Úspory: <span style={{ color: balanceBefore >= 0 ? '#6DC030' : '#FF4B4B', fontWeight: 800 }}>{balanceBefore.toLocaleString('cs-CZ')} Kč</span>
            </span>
            <span style={{ color: '#6B7280' }}>Cíl: {goalPct}%</span>
          </div>
        </div>
      </div>

      <div className="max-w-sm mx-auto px-4 pt-4 space-y-3">

        {/* ── Income card ── */}
        <div className="card flex justify-between items-center">
          <span className="font-bold" style={{ color: '#2C2C2C' }}>💵 Příjem tento měsíc</span>
          <span className="font-extrabold text-xl" style={{ color: '#6DC030' }}>
            {currentIncome.toLocaleString('cs-CZ')} Kč
          </span>
        </div>

        {hasIncomeReduction && (
          <div className="rounded-[16px] p-3" style={{ backgroundColor: '#FFF0DC', border: '2px solid #FF9B3B' }}>
            <span className="font-bold text-sm" style={{ color: '#CC7A2E' }}>
              😷 Nemoc — příjem snížen na 50 % (jen tento měsíc)
            </span>
          </div>
        )}

        {/* ── Mandatory fuckup alerts ── */}
        {mandatoryFuckups.map(af => {
          const def = FUCKUPS.find(fd => fd.id === af.fuckupId)!
          const hasInsurance = state.monthChoices
            .filter(mc => mc.month < m)
            .some(mc => mc.itemIds.includes('insurance'))
          const covered = def.isInsuranceProtected && hasInsurance

          return (
            <div key={af.fuckupId} className="rounded-[16px] p-4"
              style={covered
                ? { backgroundColor: '#E5F9CC', border: '2px solid #6DC030' }
                : { backgroundColor: '#FFE0E0', border: '2px solid #FF4B4B' }}>
              <div className="font-bold text-sm" style={{ color: covered ? '#4E9A20' : '#CC3333' }}>
                {covered ? '🛡️' : '💥'} {def.name}
                {!covered && <span className="ml-1">— {def.effectValue.toLocaleString('cs-CZ')} Kč</span>}
              </div>
              <div className="text-xs mt-1" style={{ color: covered ? '#4E9A20' : '#FF6B6B' }}>
                {covered ? 'Pojištění tě kryje — neplatíš nic!' : def.description}
              </div>
            </div>
          )
        })}

        {/* ── Optional fuckup (car) ── */}
        {optFuckupDef && optionalDecision === null && (
          <div className="rounded-[20px] p-4" style={{ backgroundColor: '#FFF0DC', border: '2px solid #FF9B3B' }}>
            <div className="font-bold mb-1" style={{ color: '#CC7A2E' }}>🚗 {optFuckupDef.name}</div>
            <p className="text-sm mb-3" style={{ color: '#CC7A2E' }}>{optFuckupDef.description}</p>
            <div className="flex gap-2">
              <button onClick={() => setOptionalDecision(true)}
                style={{ flex: 1, padding: '10px 0', borderRadius: 999, fontWeight: 700, fontSize: 14, backgroundColor: '#FF9B3B', color: 'white', border: 'none', borderBottom: '3px solid #CC7A2E', fontFamily: 'inherit', cursor: 'pointer' }}>
                Zaplatit ({optFuckupDef.effectValue.toLocaleString('cs-CZ')} Kč)
              </button>
              <button onClick={() => setOptionalDecision(false)}
                style={{ flex: 1, padding: '10px 0', borderRadius: 999, fontWeight: 700, fontSize: 14, backgroundColor: 'white', color: '#6B7280', border: '2px solid #E5E7EB', borderBottom: '3px solid #D1D5DB', fontFamily: 'inherit', cursor: 'pointer' }}>
                Chodit pěšky
              </button>
            </div>
          </div>
        )}
        {optFuckupDef && optionalDecision !== null && (
          <div className="rounded-[16px] p-3 flex justify-between items-center"
            style={{ backgroundColor: optionalDecision ? '#FFF0DC' : '#E5F9CC', border: `2px solid ${optionalDecision ? '#FF9B3B' : '#6DC030'}` }}>
            <span className="font-bold text-sm" style={{ color: optionalDecision ? '#CC7A2E' : '#4E9A20' }}>
              {optionalDecision
                ? `🚗 Auto opravíš — ${optFuckupDef.effectValue.toLocaleString('cs-CZ')} Kč`
                : '🚶 Chodíte pěšky — auto počká'}
            </span>
            <button onClick={() => setOptionalDecision(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#9CA3AF', fontFamily: 'inherit' }}>
              změnit
            </button>
          </div>
        )}

        {/* ── Expense categories ── */}
        {CATEGORIES.map(cat => {
          const items = EXPENSE_ITEMS.filter(i => i.category === cat)
          const catSpent = items.filter(i => checked.has(i.id)).reduce((s, i) => s + i.defaultAmount, 0)

          return (
            <div key={cat} className="overflow-hidden"
              style={{ background: 'white', borderRadius: 20, border: '2px solid #E5E7EB', borderTop: `4px solid ${CATEGORY_COLORS[cat]}`, boxShadow: '0 4px 0 rgba(0,0,0,0.08)' }}>

              <div className="px-4 py-3 flex justify-between items-center"
                style={{ backgroundColor: catSpent > 0 ? CATEGORY_BG[cat] : 'white' }}>
                <span className="font-extrabold text-sm" style={{ color: '#2C2C2C' }}>
                  {CATEGORY_EMOJIS[cat]} {cat}
                </span>
                <span className="text-xs font-bold" style={{ color: catSpent > 0 ? CATEGORY_COLORS[cat] : '#D1D5DB' }}>
                  {catSpent > 0 ? `${catSpent.toLocaleString('cs-CZ')} Kč` : '—'}
                </span>
              </div>

              {items.map((item, idx) => {
                const isChecked = checked.has(item.id)
                return (
                  <button key={item.id} onClick={() => toggle(item.id)}
                    style={{
                      display: 'flex', alignItems: 'center', width: '100%', padding: '12px 16px',
                      backgroundColor: isChecked ? CATEGORY_BG[cat] : 'white',
                      borderTop: idx === 0 ? '1px solid #F3F4F6' : '1px solid #F3F4F6',
                      cursor: item.isFixed ? 'default' : 'pointer',
                      fontFamily: 'inherit', border: 'none', textAlign: 'left',
                      borderTopWidth: 1, borderTopStyle: 'solid', borderTopColor: '#F3F4F6',
                    }}>
                    {/* Checkbox */}
                    <div style={{
                      flexShrink: 0, width: 20, height: 20, borderRadius: '50%',
                      border: `2px solid ${isChecked ? CATEGORY_COLORS[cat] : '#D1D5DB'}`,
                      backgroundColor: isChecked ? CATEGORY_COLORS[cat] : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 12,
                    }}>
                      {isChecked && <span style={{ color: 'white', fontSize: 11, fontWeight: 800, lineHeight: 1 }}>✓</span>}
                    </div>

                    <div style={{ flex: 1, textAlign: 'left' }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#2C2C2C' }}>{item.name}</span>
                      {item.isInsurance && (
                        <span style={{ marginLeft: 4, fontSize: 12, fontWeight: 700, color: '#6DC030' }}>🛡️ pojištění</span>
                      )}
                      {item.isFixed && (
                        <span style={{ marginLeft: 4, fontSize: 12, color: '#9CA3AF' }}>(povinné)</span>
                      )}
                    </div>

                    <span style={{ fontSize: 14, fontWeight: 700, color: '#6B7280', marginLeft: 8 }}>
                      {item.defaultAmount.toLocaleString('cs-CZ')} Kč
                    </span>
                  </button>
                )
              })}
            </div>
          )
        })}

        {/* ── REZERVY ── */}
        <div className="card flex justify-between items-center">
          <span className="font-bold" style={{ color: '#2C2C2C' }}>🏦 REZERVY (zbytek)</span>
          <span className="font-extrabold text-xl" style={{ color: remainder >= 0 ? '#6DC030' : '#FF4B4B' }}>
            {remainder.toLocaleString('cs-CZ')} Kč
          </span>
        </div>
      </div>

      {/* ── Fixed bottom bar ── */}
      <div className="fixed bottom-0 left-0 right-0 px-4 py-3"
        style={{ backgroundColor: '#FFF4C9', borderTop: '2px solid #E5E7EB' }}>
        <div className="max-w-sm mx-auto">
          <div className="flex justify-between text-sm font-bold mb-2">
            <span style={{ color: '#6B7280' }}>
              Výdaje: <span style={{ color: '#2C2C2C' }}>{spent.toLocaleString('cs-CZ')} Kč</span>
            </span>
            <span style={{ color: remainder >= 0 ? '#6DC030' : '#FF4B4B' }}>
              Zbývá: {remainder.toLocaleString('cs-CZ')} Kč
            </span>
          </div>
          <button onClick={confirm} disabled={confirming || (!!optFuckupDef && optionalDecision === null)} className="btn-primary text-lg">
            {m === 12 ? 'Dokončit rok 🏁' : `Potvrdit ${MONTHS[m]} →`}
          </button>
        </div>
      </div>
    </div>
  )
}
