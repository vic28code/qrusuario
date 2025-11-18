import { useEffect, useState } from 'react'
import { getCurrentTurn } from '@/lib/supabaseQueries'

interface TurnDisplayProps {
  // Si se pasa `turnNumber`, se muestra directamente; si no, intentamos
  // obtener el turno desde Supabase (código real comentado y stub).
  turnNumber?: string;
}

const TurnDisplay = ({ turnNumber }: { turnNumber?: string }) => (
  <div className="bg-secondary rounded-3xl px-8 py-6 mb-6 shadow-sm">
    <p className="text-foreground text-xl mb-2 font-medium">Su turno:</p>
    <p className="text-6xl md:text-7xl font-bold text-foreground tracking-tight">
      {turnNumber ?? '---'}
    </p>
  </div>
);
export default TurnDisplay;
