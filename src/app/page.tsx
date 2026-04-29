'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Scenario } from '@/types'

export default function HomePage() {
  const router = useRouter()
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [selected, setSelected] = useState<Scenario | null>(null)
  const [playerName, setPlayerName] = useState('')
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.from('scenarios').select('*').then(({ data }) => {
      setScenarios(data ?? [])
      setLoading(false)
    })
  }, [])

  async function startGame() {
    if (!selected || !playerName.trim()) return
    setStarting(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('sessions')
      .insert({ scenario_id: selected.id, player_name: playerName.trim(), current_month: 1 })
      .select()
      .single()
    if (data) {
      localStorage.setItem('session_id', String(data.id))
      router.push('/game')
    }
    setStarting(false)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
      <p className="text-gray-500 text-lg">Načítám...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-2xl mx-auto py-8">
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">🦸</div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Budget Hero</h1>
          <p className="text-gray-500">Nauč se hospodařit s penězi. Vyber rodinu a zkus to!</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Vyber rodinu</h2>
          <div className="space-y-3">
            {scenarios.map(s => (
              <button
                key={s.id}
                onClick={() => setSelected(s)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  selected?.id === s.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-100 hover:border-blue-200 hover:bg-gray-50'
                }`}
              >
                <div className="font-semibold text-gray-800">{s.name}</div>
                <div className="text-sm text-gray-500 mt-1">
                  Příjem: <span className="text-green-600 font-medium">{s.monthly_income.toLocaleString('cs-CZ')} Kč/měs</span>
                  {' · '}
                  Fixní výdaje: <span className="text-red-500 font-medium">{s.fixed_expenses.toLocaleString('cs-CZ')} Kč/měs</span>
                </div>
                <div className="text-sm text-blue-600 mt-1">
                  🎯 Cíl: {s.goal_name} — {s.goal_amount.toLocaleString('cs-CZ')} Kč
                </div>
              </button>
            ))}
          </div>
        </div>

        {selected && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Jak se jmenuješ?</h2>
            <input
              type="text"
              value={playerName}
              onChange={e => setPlayerName(e.target.value)}
              placeholder="Tvoje jméno..."
              className="w-full border-2 border-gray-100 rounded-xl p-3 text-gray-800 focus:outline-none focus:border-blue-400"
              onKeyDown={e => e.key === 'Enter' && startGame()}
            />
          </div>
        )}

        <button
          onClick={startGame}
          disabled={!selected || !playerName.trim() || starting}
          className="w-full py-4 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold text-lg rounded-2xl transition-colors"
        >
          {starting ? 'Začínám...' : 'Začít hrát 🚀'}
        </button>
      </div>
    </div>
  )
}
