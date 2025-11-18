import { useEffect, useState } from 'react'
import { getCurrentTurn } from '@/lib/supabaseQueries'

interface TurnDisplayProps {
  // Si se pasa `turnNumber`, se muestra directamente; si no, intentamos
  // obtener el turno desde Supabase (código real comentado y stub).
  turnNumber?: string;
}

const TurnDisplay = ({ turnNumber: propTurn }: TurnDisplayProps) => {
  const [turnNumber, setTurnNumber] = useState<string | null>(propTurn ?? null)

  useEffect(() => {
    let mounted = true

    // Si ya recibimos el turno por prop, no hacemos fetch.
    if (propTurn) return

    const load = async () => {
      try {
        const current = await getCurrentTurn()
        if (mounted) setTurnNumber(current)
      } catch (err) {
        console.error('Error fetching current turn from Supabase', err)
        if (mounted) setTurnNumber(null)
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [propTurn])

  return (
    <div className="bg-secondary rounded-3xl px-8 py-6 mb-6 shadow-sm">
      <p className="text-foreground text-xl mb-2 font-medium">Su turno:</p>
      <p className="text-6xl md:text-7xl font-bold text-foreground tracking-tight">
        {turnNumber ?? '---'}
      </p>
    </div>
  )
}

export default TurnDisplay
