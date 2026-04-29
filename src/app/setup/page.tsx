'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { GOALS } from '@/lib/gameData'
import { saveState, selectFuckups, clearState } from '@/lib/gameState'

function NumInput({ label, value, onChange, hint }: {
  label: string; value: number; onChange: (v: number) => void; hint?: string
}) {
  return (
    <div>
      <label className="block text-sm font-bold mb-1" style={{ color: '#6B7280' }}>{label}</label>
      <input
        type="number"
        inputMode="numeric"
        min={0}
        value={value || ''}
        onChange={e => onChange(Number(e.target.value) || 0)}
        placeholder="0"
        className="w-full rounded-xl p-3 text-base font-semibold focus:outline-none"
        style={{
          border: '2px solid #E5E7EB',
          color: '#2C2C2C',
          fontFamily: 'inherit',
        }}
        onFocus={e => { e.target.style.borderColor = '#6DC030'; e.target.style.boxShadow = '0 0 0 3px rgba(109,192,48,0.2)' }}
        onBlur={e => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none' }}
      />
      {hint && <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>{hint}</p>}
    </div>
  )
}

const DIFFICULTY_LABELS = ['', 'Snadná', 'Lehká', 'Střední', 'Těžká', 'Hardcore']
const DIFFICULTY_EMOJIS = ['', '😊', '🙂', '😐', '😰', '💀']

function fuckupCount(n: number) {
  if (n === 1) return '1 náhodný fuckup'
  if (n < 5) return `${n} náhodné fuckupy`
  return `${n} náhodných fuckupů`
}

export default function SetupPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [goalId, setGoalId] = useState('')
  const [difficulty, setDifficulty] = useState(3)
  const [playerName, setPlayerName] = useState('')
  const [incomeWork, setIncomeWork] = useState(0)
  const [incomeJob, setIncomeJob] = useState(0)
  const [incomeFamily, setIncomeFamily] = useState(0)
  const [savingsStart, setSavingsStart] = useState(0)

  const selectedGoal = GOALS.find(g => g.id === goalId)
  const totalMonthly = incomeWork + incomeJob + incomeFamily

  function startGame() {
    if (!selectedGoal || !playerName.trim() || totalMonthly === 0) return
    clearState()
    saveState({
      playerName: playerName.trim(),
      goalId: selectedGoal.id,
      goalName: selectedGoal.name,
      goalEmoji: selectedGoal.emoji,
      goalTarget: selectedGoal.targetAmount,
      difficulty,
      incomeWork,
      incomeJob,
      incomeFamily,
      savingsStart,
      currentMonth: 1,
      activeFuckups: selectFuckups(difficulty),
      monthChoices: [],
    })
    router.push('/game')
  }

  function back() {
    if (step > 1) setStep(s => s - 1)
    else router.push('/')
  }

  return (
    <div className="min-h-screen p-4" style={{ backgroundColor: '#FFF4C9' }}>
      <div className="max-w-sm mx-auto py-4">

        {/* Back + progress */}
        <button onClick={back} className="mb-4 text-sm font-bold" style={{ color: '#6B7280', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
          ← Zpět
        </button>
        <div className="flex gap-2 mb-6">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex-1 rounded-full transition-all"
              style={{ height: 8, backgroundColor: step >= s ? '#6DC030' : '#E5E7EB' }} />
          ))}
        </div>

        {/* ── Step 1: Goal ── */}
        {step === 1 && (
          <div>
            <div className="text-center mb-6">
              <div className="text-5xl mb-2">🎯</div>
              <h1 className="text-2xl font-extrabold" style={{ color: '#2C2C2C' }}>Co chceš letos koupit?</h1>
              <p className="text-sm font-semibold mt-1" style={{ color: '#6B7280' }}>Vyber si svůj roční cíl</p>
            </div>
            <div className="space-y-3 mb-6">
              {GOALS.map(g => {
                const selected = goalId === g.id
                return (
                  <button key={g.id} onClick={() => setGoalId(g.id)}
                    className="w-full text-left flex items-center gap-4 p-4 rounded-[20px] transition-all"
                    style={{
                      backgroundColor: selected ? '#E5F9CC' : 'white',
                      border: `2px solid ${selected ? '#6DC030' : '#E5E7EB'}`,
                      borderBottom: `4px solid ${selected ? '#4E9A20' : '#D1D5DB'}`,
                      fontFamily: 'inherit',
                      cursor: 'pointer',
                    }}>
                    <span className="text-4xl">{g.emoji}</span>
                    <div className="flex-1">
                      <div className="font-bold" style={{ color: '#2C2C2C' }}>{g.name}</div>
                      <div className="text-sm font-bold" style={{ color: '#6DC030' }}>
                        {g.targetAmount.toLocaleString('cs-CZ')} Kč
                      </div>
                    </div>
                    {selected && <span className="text-xl">✅</span>}
                  </button>
                )
              })}
            </div>
            <button onClick={() => setStep(2)} disabled={!goalId} className="btn-primary text-lg">
              Pokračovat →
            </button>
          </div>
        )}

        {/* ── Step 2: Difficulty ── */}
        {step === 2 && (
          <div>
            <div className="text-center mb-6">
              <div className="text-5xl mb-2">⚡</div>
              <h1 className="text-2xl font-extrabold" style={{ color: '#2C2C2C' }}>Kolik fuckupů uneseš?</h1>
              <p className="text-sm font-semibold mt-1" style={{ color: '#6B7280' }}>
                Obtížnost = počet nečekaných událostí v průběhu roku
              </p>
            </div>

            <div className="flex gap-2 mb-4">
              {[1, 2, 3, 4, 5].map(d => {
                const sel = difficulty === d
                return (
                  <button key={d} onClick={() => setDifficulty(d)}
                    className="flex-1 py-4 rounded-[16px] text-xl font-extrabold transition-all"
                    style={{
                      backgroundColor: sel ? '#6DC030' : 'white',
                      color: sel ? 'white' : '#2C2C2C',
                      border: `2px solid ${sel ? '#4E9A20' : '#E5E7EB'}`,
                      borderBottom: `4px solid ${sel ? '#3D7A18' : '#D1D5DB'}`,
                      fontFamily: 'inherit',
                      cursor: 'pointer',
                    }}>
                    {d}
                  </button>
                )
              })}
            </div>

            <div className="card text-center mb-6">
              <div className="text-4xl mb-2">{DIFFICULTY_EMOJIS[difficulty]}</div>
              <div className="font-extrabold text-lg" style={{ color: '#2C2C2C' }}>{DIFFICULTY_LABELS[difficulty]}</div>
              <div className="text-sm font-semibold mt-1" style={{ color: '#6B7280' }}>
                {fuckupCount(difficulty)} tě čeká v náhodných měsících
              </div>
            </div>

            <button onClick={() => setStep(3)} className="btn-primary text-lg">
              Pokračovat →
            </button>
          </div>
        )}

        {/* ── Step 3: Income ── */}
        {step === 3 && (
          <div>
            <div className="text-center mb-6">
              <div className="text-5xl mb-2">💰</div>
              <h1 className="text-2xl font-extrabold" style={{ color: '#2C2C2C' }}>Kolik má rodina peněz?</h1>
              <p className="text-sm font-semibold mt-1" style={{ color: '#6B7280' }}>Pravidelné příjmy každý měsíc</p>
            </div>

            <div className="card space-y-4 mb-4">
              <div>
                <label className="block text-sm font-bold mb-1" style={{ color: '#6B7280' }}>Tvoje jméno</label>
                <input
                  type="text"
                  value={playerName}
                  onChange={e => setPlayerName(e.target.value)}
                  placeholder="Jak se jmenuješ?"
                  className="w-full rounded-xl p-3 text-base font-semibold focus:outline-none"
                  style={{ border: '2px solid #E5E7EB', color: '#2C2C2C', fontFamily: 'inherit' }}
                  onFocus={e => { e.target.style.borderColor = '#6DC030' }}
                  onBlur={e => { e.target.style.borderColor = '#E5E7EB' }}
                />
              </div>

              <div className="pt-3" style={{ borderTop: '2px solid #F3F4F6' }}>
                <p className="text-xs font-extrabold uppercase tracking-widest mb-3" style={{ color: '#6B7280', letterSpacing: '0.08em' }}>
                  Příjmy (Kč / měsíc)
                </p>
                <div className="space-y-3">
                  <NumInput label="Výdělek rodičů" value={incomeWork} onChange={setIncomeWork} hint="30 000 – 100 000 Kč" />
                  <NumInput label="Brigáda" value={incomeJob} onChange={setIncomeJob} hint="0 – 2 000 Kč" />
                  <NumInput label="Příspěvky od babiček" value={incomeFamily} onChange={setIncomeFamily} />
                </div>
                {totalMonthly > 0 && (
                  <div className="mt-3 p-3 rounded-xl text-center font-bold" style={{ backgroundColor: '#E5F9CC', color: '#4E9A20' }}>
                    Celkem: {totalMonthly.toLocaleString('cs-CZ')} Kč / měs
                  </div>
                )}
              </div>

              <div className="pt-3" style={{ borderTop: '2px solid #F3F4F6' }}>
                <p className="text-xs font-extrabold uppercase tracking-widest mb-3" style={{ color: '#6B7280', letterSpacing: '0.08em' }}>
                  Počáteční úspory
                </p>
                <NumInput label="Kolik máte na účtu?" value={savingsStart} onChange={setSavingsStart} hint="Peníze na začátku roku" />
              </div>
            </div>

            <button onClick={startGame} disabled={!playerName.trim() || totalMonthly === 0} className="btn-primary text-lg">
              Hrát! 🚀
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
