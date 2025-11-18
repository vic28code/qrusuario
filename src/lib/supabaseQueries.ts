import supabase from './supabase'

export interface TurnData {
  numero: string | null
  estado: string | null
  tiempo_espera: number | null
  fecha_llamado: string | null
  categoria_nombre?: string | null
}
/**
 * Obtiene un turno aleatorio leyendo hasta 100 filas y seleccionando
 * una aleatoriamente en el cliente para asegurar la aleatoriedad.
 */
export async function getRandomTurn(): Promise<TurnData | null> {
  // Eliminamos el intento fallido de .order('random()') en el servidor.
  try {
    const { data, error } = await supabase
      .from('turnos')
      .select('numero, estado, tiempo_espera, fecha_llamado, categorias(nombre)')
      .limit(100) // Leer hasta 100 filas

    if (error) throw error
    if (!data || !Array.isArray(data) || data.length === 0) throw new Error('No turnos')

    const rows = data as any[]

    // 1. Determinar el índice aleatorio (mejorado con crypto si está disponible)
    let idx: number
    if (typeof crypto !== 'undefined' && 'getRandomValues' in crypto) {
      const arr = new Uint32Array(1)
      crypto.getRandomValues(arr)
      idx = arr[0] % rows.length
    } else {
      idx = Math.floor(Math.random() * rows.length)
    }

    const row = rows[idx]

    // 2. Extracción segura del nombre de la categoría
    const cat = row.categorias ?? row.categoria ?? null
    const categoriaNombre = Array.isArray(cat) ? cat[0]?.nombre ?? null : cat?.nombre ?? null

    // console.debug('getRandomTurn: selected index', idx, 'numero', row.numero) // Mantener o quitar el log si no lo necesitas

    return {
      numero: row.numero ?? null,
      estado: row.estado ?? null,
      tiempo_espera: row.tiempo_espera ?? null,
      fecha_llamado: row.fecha_llamado ?? null,
      categoria_nombre: categoriaNombre,
    }
  } catch (err) {
    console.warn('getRandomTurn: fallo al leer desde DB, usando fallback estático', err)
    // Fallback estático con datos de muestra
    const sample: TurnData[] = [
      { numero: 'SAMPLE-100', estado: 'pendiente', tiempo_espera: 15, fecha_llamado: null, categoria_nombre: 'Atención general' },
      { numero: 'SAMPLE-200', estado: 'atendido', tiempo_espera: 0, fecha_llamado: '2024-01-01T10:00:00Z', categoria_nombre: 'Soporte' },
      { numero: 'SAMPLE-300', estado: 'en_atencion', tiempo_espera: 5, fecha_llamado: '2024-01-01T10:05:00Z', categoria_nombre: 'Técnico' },
      { numero: 'SAMPLE-400', estado: 'pendiente', tiempo_espera: 20, fecha_llamado: null, categoria_nombre: 'Información' },
    ]
    return sample[Math.floor(Math.random() * sample.length)]
  }
}

export async function getActiveTurn(): Promise<TurnData | null> {
  try {
    const { data, error } = await supabase
      .from('turnos')
      .select('numero, estado, tiempo_espera, fecha_llamado, categorias(nombre)')
      .in('estado', ['en_atencion'])
      .order('fecha_llamado', { ascending: false })
      .limit(1)
      .single()

    let row: any = null
    if (error || !data) {
      const res = await supabase
        .from('turnos')
        .select('numero, estado, tiempo_espera, fecha_llamado, categorias(nombre)')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      if (res.error || !res.data) return null
      row = res.data as any
    } else {
      row = data as any
    }

    const cat = row.categorias ?? row.categoria ?? null
    const categoriaNombre = Array.isArray(cat) ? cat[0]?.nombre ?? null : cat?.nombre ?? null

    return {
      numero: row.numero ?? null,
      estado: row.estado ?? null,
      tiempo_espera: row.tiempo_espera ?? null,
      fecha_llamado: row.fecha_llamado ?? null,
      categoria_nombre: categoriaNombre,
    }
  } catch (err) {
    console.error('getActiveTurn error', err)
    return null
  }
}

export async function getCurrentTurn(): Promise<string | null> {
  try {
    const active = await getActiveTurn()
    return active?.numero ?? null
  } catch (err) {
    console.error('getCurrentTurn error', err)
    return null
  }
}

export default {
  getCurrentTurn,
  getActiveTurn,
  getRandomTurn,
}