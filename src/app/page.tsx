'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { loadState, clearState, GameState } from '@/lib/gameState'

export default function SplashPage() {
  const router = useRouter()
  const [existing, setExisting] = useState<GameState | null | undefined>(undefined)

  useEffect(() => {
    setExisting(loadState())
  }, [])

  function handleContinue() {
    if (!existing) { router.push('/setup'); return }
    router.push(existing.currentMonth > 12 ? '/summary' : '/game')
  }

  function handleNew() {
    clearState()
    router.push('/setup')
  }

  const hasGame = existing !== null && existing !== undefined
  const gameFinished = hasGame && existing!.currentMonth > 12

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ backgroundColor: '#FFF4C9' }}>
      <div className="w-full max-w-xs text-center">

        {/* Mascot */}
        <div className="text-9xl mb-2" style={{ lineHeight: 1 }}>🦸</div>
        <div className="w-24 h-3 mx-auto rounded-full mb-6" style={{ background: 'rgba(0,0,0,0.08)' }} />

        {/* Title */}
        <h1 className="text-5xl font-extrabold mb-2" style={{ color: '#2C2C2C' }}>
          Budget<br />Hero
        </h1>
        <p className="font-semibold mb-10" style={{ color: '#6B7280' }}>
          Tvůj rok v životě — vystačí ti peníze?
        </p>

        {/* Buttons */}
        {existing === undefined ? (
          <div className="h-14 rounded-full bg-gray-200 animate-pulse" />
        ) : (
          <div className="space-y-3">
            <button onClick={handleContinue} className="btn-primary text-lg">
              {!hasGame ? '🚀 Začít hrát' : gameFinished ? '🏁 Zobrazit výsledky' : '▶ Pokračovat ve hře'}
            </button>
            {hasGame && (
              <button onClick={handleNew} className="btn-secondary text-lg">
                Nová hra
              </button>
            )}
          </div>
        )}

        {hasGame && !gameFinished && existing && (
          <p className="text-sm font-semibold mt-4" style={{ color: '#6B7280' }}>
            {existing.playerName} · Měsíc {existing.currentMonth}/12
          </p>
        )}

        <p className="text-xs mt-10" style={{ color: '#9CA3AF' }}>
          Simulace rodinného rozpočtu · 8–15 let
        </p>
      </div>
    </div>
  )
}
