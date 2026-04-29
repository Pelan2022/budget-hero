'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Goal, RealityEvent } from '@/types'

function NumberInput({ label, value, onChange, hint }: { label: string; value: number; onChange: (v: number) => void; hint?: string }) {
  return (
    <div>
      <label className="block text-sm text-gray-600 mb-1">{label}</label>
      <input
        type="number"
        min={0}
        value={value || ''}
        onChange={e => onChange(Number(e.target.value) || 0)}
        placeholder="0"
        className="w-full border-2 border-gray-100 rounded-xl p-3 text-gray-800 focus:outline-none focus:border-blue-400"
      />
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  )
}

export default function HomePage() {
  const router = useRouter()
  const [goals, setGoals] = useState<Goal[]>([])
  const [events, setEvents] = useState<RealityEvent[]>([])
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<RealityEvent | null>(null)
  const [playerName, setPlayerName] = useState('')
  const [incomeWork, setIncomeWork] = useState(0)
  const [incomeJob, setIncomeJob] = useState(0)
  const [incomeFamily, setIncomeFamily] = useState(0)
  const [savingsStart, setSavingsStart] = useState(0)
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)
  const [step, setStep] = useState(1) // 1=goal, 2=event, 3=income

  useEffect(() => {
    const supabase = createClient()
    Promise.all([
      supabase.from('goals').select('*'),
      supabase.from('reality_events').select('*'),
    ]).then(([g, e]) => {
      setGoals(g.data ?? [])
      setEvents(e.data ?? [])
      setLoading(false)
    })
  }, [])

  async function startGame() {
    if (!selectedGoal || !selectedEvent || !playerName.trim()) return
    setStarting(true)
    const supabase = createClient()
    const { data } = await supabase.from('sessions').insert({
      player_name: playerName.trim(),
      goal_id: selectedGoal.id,
      reality_event_id: selectedEvent.id,
      income_work: incomeWork,
      income_job: incomeJob,
      income_family: incomeFamily,
      savings_start: savingsStart,
      current_month: 1,
    }).select().single()
    if (data) {
      localStorage.setItem('session_id', String(data.id))
      router.push('/game')
    }
    setStarting(false)
  }

  const totalMonthly = incomeWork + incomeJob + incomeFamily

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
      <p className="text-gray-500">Načítám...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
      <div className="max-w-xl mx-auto py-8">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🦸</div>
          <h1 className="text-3xl font-bold text-gray-800">Budget Hero</h1>
          <p className="text-gray-500 text-sm mt-1">Tvůj rok v životě — vystačí ti peníze?</p>
        </div>

        {/* Progress steps */}
        <div className="flex gap-2 mb-6">
          {[1,2,3].map(s => (
            <div key={s} className={`flex-1 h-1.5 rounded-full ${step >= s ? 'bg-blue-400' : 'bg-gray-200'}`} />
          ))}
        </div>

        {/* Step 1: Goal */}
        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
            <h2 className="font-semibold text-gray-700 mb-4">🎯 Co chceš letos koupit?</h2>
            <div className="space-y-3">
              {goals.map(g => (
                <button key={g.id} onClick={() => setSelectedGoal(g)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                    selectedGoal?.id === g.id ? 'border-blue-500 bg-blue-50' : 'border-gray-100 hover:border-blue-200'
                  }`}>
                  <span className="text-3xl">{g.emoji}</span>
                  <div>
                    <div className="font-semibold text-gray-800">{g.name}</div>
                    <div className="text-sm text-blue-600">{g.target_amount.toLocaleString('cs-CZ')} Kč</div>
                  </div>
                </button>
              ))}
            </div>
            <button onClick={() => setStep(2)} disabled={!selectedGoal}
              className="w-full mt-4 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold rounded-xl transition-colors">
              Pokračovat →
            </button>
          </div>
        )}

        {/* Step 2: Reality event */}
        {step === 2 && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
            <h2 className="font-semibold text-gray-700 mb-1">⚡ Jaký fuckup tě letos čeká?</h2>
            <p className="text-xs text-gray-400 mb-4">Zvol svou &quot;realitu&quot; — zjistíš, jestli jsi na ni připravený</p>
            <div className="space-y-2">
              {events.map(e => (
                <button key={e.id} onClick={() => setSelectedEvent(e)}
                  className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                    selectedEvent?.id === e.id ? 'border-orange-400 bg-orange-50' : 'border-gray-100 hover:border-orange-200'
                  }`}>
                  <div className="font-semibold text-gray-800 text-sm">{e.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{e.description}</div>
                </button>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setStep(1)} className="flex-1 py-3 border-2 border-gray-200 text-gray-600 font-semibold rounded-xl">← Zpět</button>
              <button onClick={() => setStep(3)} disabled={!selectedEvent}
                className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold rounded-xl transition-colors">
                Pokračovat →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Income + name */}
        {step === 3 && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
            <h2 className="font-semibold text-gray-700 mb-4">💰 Kolik máš na začátku roku?</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Tvoje jméno</label>
                <input type="text" value={playerName} onChange={e => setPlayerName(e.target.value)}
                  placeholder="Jak se jmenuješ?"
                  className="w-full border-2 border-gray-100 rounded-xl p-3 text-gray-800 focus:outline-none focus:border-blue-400" />
              </div>
              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-medium text-gray-500 uppercase mb-3">Pravidelné příjmy (Kč/měsíc)</p>
                <div className="space-y-3">
                  <NumberInput label="Výdělek rodičů" value={incomeWork} onChange={setIncomeWork} hint="Plat / mzda rodiny" />
                  <NumberInput label="Brigáda" value={incomeJob} onChange={setIncomeJob} />
                  <NumberInput label="Příspěvky od babiček" value={incomeFamily} onChange={setIncomeFamily} />
                </div>
                {totalMonthly > 0 && (
                  <div className="mt-3 p-3 bg-green-50 rounded-xl text-sm text-green-700 font-medium">
                    Celkem: {totalMonthly.toLocaleString('cs-CZ')} Kč/měs
                  </div>
                )}
              </div>
              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-medium text-gray-500 uppercase mb-3">Počáteční úspory</p>
                <NumberInput label="Kolik máš našetřeno?" value={savingsStart} onChange={setSavingsStart} hint="Peníze na účtu na začátku roku" />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setStep(2)} className="flex-1 py-3 border-2 border-gray-200 text-gray-600 font-semibold rounded-xl">← Zpět</button>
              <button onClick={startGame} disabled={!playerName.trim() || totalMonthly === 0 || starting}
                className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold rounded-xl transition-colors">
                {starting ? 'Spouštím...' : 'Hrát! 🚀'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
