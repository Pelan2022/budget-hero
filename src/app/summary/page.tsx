'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { loadState, clearState, computeBalance, getTier, GameState } from '@/lib/gameState'
import { EXPENSE_ITEMS, FUCKUPS, CATEGORIES, CATEGORY_COLORS, CATEGORY_EMOJIS } from '@/lib/gameData'

export default function SummaryPage() {
  const router = useRouter()
  const [state, setState] = useState<GameState | null>(null)

  useEffect(() => {
    const s = loadState()
    if (!s) { router.push('/'); return }
    setState(s)
  }, [router])

  if (!state) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FFF4C9' }}>
      <p className="font-semibold" style={{ color: '#6B7280' }}>Načítám výsledky...</p>
    </div>
  )

  const finalBalance = computeBalance(state, 12)
  const tier = getTier(finalBalance, state.goalTarget)
  const goalProgress = Math.min(100, Math.max(0, Math.round((finalBalance / state.goalTarget) * 100)))

  const totalSpent = state.monthChoices.reduce((s, mc) =>
    s + mc.itemIds.reduce((ms, id) => {
      const item = EXPENSE_ITEMS.find(i => i.id === id)
      return ms + (item?.defaultAmount ?? 0)
    }, 0), 0)

  const byCategory: Record<string, number> = {}
  state.monthChoices.forEach(mc =>
    mc.itemIds.forEach(id => {
      const item = EXPENSE_ITEMS.find(i => i.id === id)
      if (item) byCategory[item.category] = (byCategory[item.category] ?? 0) + item.defaultAmount
    })
  )

  return (
    <div className="min-h-screen p-4" style={{ backgroundColor: '#FFF4C9' }}>
      <div className="max-w-sm mx-auto py-8">

        {/* ── Tier banner ── */}
        <div className="rounded-[28px] p-6 mb-6 text-center"
          style={{ backgroundColor: tier.bg, border: `2px solid ${tier.color}`, borderBottom: `6px solid ${tier.color}` }}>
          <div className="text-7xl mb-3">{tier.emoji}</div>
          <div className="text-4xl font-extrabold mb-2" style={{ color: tier.color }}>{tier.label}</div>
          <p className="text-sm font-semibold" style={{ color: '#6B7280' }}>{tier.desc}</p>
        </div>

        {/* ── Stats grid ── */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="card text-center">
            <div className="text-xl font-extrabold" style={{ color: finalBalance >= 0 ? '#6DC030' : '#FF4B4B' }}>
              {finalBalance.toLocaleString('cs-CZ')} Kč
            </div>
            <div className="text-xs font-semibold mt-1" style={{ color: '#6B7280' }}>Konečný zůstatek</div>
          </div>
          <div className="card text-center">
            <div className="text-xl font-extrabold" style={{ color: '#FF4B4B' }}>
              {totalSpent.toLocaleString('cs-CZ')} Kč
            </div>
            <div className="text-xs font-semibold mt-1" style={{ color: '#6B7280' }}>Celkem utraceno</div>
          </div>
        </div>

        {/* ── Goal progress ── */}
        <div className="card mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="font-bold text-sm" style={{ color: '#2C2C2C' }}>{state.goalEmoji} {state.goalName}</span>
            <span className="font-extrabold text-sm" style={{ color: tier.color }}>{goalProgress}%</span>
          </div>
          <div className="w-full rounded-full" style={{ height: 16, backgroundColor: '#E5E7EB', border: '2px solid rgba(0,0,0,0.06)' }}>
            <div className="h-full rounded-full transition-all duration-1000"
              style={{ width: `${goalProgress}%`, backgroundColor: tier.color }} />
          </div>
          <div className="text-xs font-semibold mt-1.5" style={{ color: '#9CA3AF' }}>
            {Math.max(0, finalBalance).toLocaleString('cs-CZ')} / {state.goalTarget.toLocaleString('cs-CZ')} Kč
          </div>
        </div>

        {/* ── Fuckups recap ── */}
        {state.activeFuckups.length > 0 && (
          <div className="card mb-4">
            <h2 className="font-extrabold mb-3" style={{ color: '#2C2C2C' }}>⚡ Tvoje fuckupy</h2>
            <div className="space-y-2">
              {state.activeFuckups
                .sort((a, b) => a.month - b.month)
                .map(af => {
                  const def = FUCKUPS.find(fd => fd.id === af.fuckupId)!
                  const mc = state.monthChoices.find(m => m.month === af.month)
                  const hasInsurance = state.monthChoices
                    .filter(m => m.month < af.month)
                    .some(m => m.itemIds.includes('insurance'))
                  const covered = def.isInsuranceProtected && hasInsurance
                  const optPaid = def.effectType === 'optional_cost' && mc?.optionalPaid

                  return (
                    <div key={af.fuckupId} className="flex items-start gap-3 py-2"
                      style={{ borderBottom: '1px solid #F3F4F6' }}>
                      <span className="text-xs font-extrabold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: '#E5E7EB', color: '#6B7280', flexShrink: 0 }}>
                        M{af.month}
                      </span>
                      <div className="flex-1">
                        <span className="text-sm font-bold" style={{ color: '#2C2C2C' }}>{def.name}</span>
                        {covered && <span className="ml-2 text-xs font-bold" style={{ color: '#6DC030' }}>🛡️ pojištění</span>}
                        {def.effectType === 'income_reduction' && <span className="ml-2 text-xs font-bold" style={{ color: '#FF9B3B' }}>−50% příjmů</span>}
                        {def.effectType !== 'income_reduction' && !covered && (
                          <span className="ml-2 text-xs font-bold" style={{ color: optPaid ? '#FF9B3B' : '#FF4B4B' }}>
                            {def.effectType === 'optional_cost' && !optPaid ? '🚶 chodili pěšky' : `−${def.effectValue.toLocaleString('cs-CZ')} Kč`}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        )}

        {/* ── Category breakdown ── */}
        {Object.keys(byCategory).length > 0 && (
          <div className="card mb-6">
            <h2 className="font-extrabold mb-3" style={{ color: '#2C2C2C' }}>Výdaje podle kategorií</h2>
            <div className="space-y-3">
              {CATEGORIES.filter(cat => byCategory[cat] > 0).map(cat => (
                <div key={cat}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-semibold" style={{ color: '#2C2C2C' }}>{CATEGORY_EMOJIS[cat]} {cat}</span>
                    <span className="font-bold" style={{ color: '#2C2C2C' }}>{byCategory[cat].toLocaleString('cs-CZ')} Kč</span>
                  </div>
                  <div className="w-full rounded-full" style={{ height: 10, backgroundColor: '#E5E7EB' }}>
                    <div className="h-full rounded-full"
                      style={{ width: `${Math.round((byCategory[cat] / totalSpent) * 100)}%`, backgroundColor: CATEGORY_COLORS[cat] }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Actions ── */}
        <div className="space-y-3">
          <button onClick={() => { clearState(); router.push('/setup') }} className="btn-primary text-lg">
            Zkusit znovu 🔄
          </button>
          <button onClick={() => { clearState(); router.push('/') }} className="btn-secondary text-lg">
            Na úvod
          </button>
        </div>
      </div>
    </div>
  )
}
