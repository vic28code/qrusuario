import supabase from './supabase'

export interface TurnData {
  id?: string
  numero: string | null
  estado: string | null
  tiempo_espera: number | null
  fecha_llamado: string | null
  fecha_creacion?: string | null
  categoria_nombre?: string | null
  categoria_tiempo?: number | null
}

/**
 * Helper para extraer datos de la categoría de forma segura
 */
function extractCategoryData(row: any) {
  const cat = row.categorias ?? row.categoria ?? null;
  const data = Array.isArray(cat) ? cat[0] : cat;
  return {
    nombre: data?.nombre ?? null,
    tiempo: data?.tiempo_estimado ?? null
  };
}

/**
 * Obtiene un turno específico por su número.
 * MEJORA: Busca siempre el registro más reciente para evitar conflictos 
 * con turnos antiguos que tengan el mismo número.
 */
export async function getTurnByNumber(turnNumber: string): Promise<TurnData | null> {
  try {
    const { data, error } = await supabase
      .from('turnos')
      .select('*, categorias(nombre, tiempo_estimado)')
      .eq('numero', turnNumber)
      // IMPORTANTE: Ordenamos por fecha de creación descendente.
      // Así, si hay un "A-01" de ayer y uno de hoy, toma el de hoy.
      .order('created_at', { ascending: false }) 
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    const catData = extractCategoryData(data);

    return {
      id: data.id,
      numero: data.numero ?? null,
      estado: data.estado ?? null,
      tiempo_espera: data.tiempo_espera ?? null,
      fecha_llamado: data.fecha_llamado ?? null,
      fecha_creacion: data.fecha_creacion ?? data.created_at ?? null,
      categoria_nombre: catData.nombre,
      categoria_tiempo: catData.tiempo,
    };
  } catch (err) {
    console.error('getTurnByNumber error:', err);
    return null;
  }
}

/**
 * Obtiene un turno aleatorio (Ideal para pruebas/demo)
 */
export async function getRandomTurn(): Promise<TurnData | null> {
  try {
    const { data, error } = await supabase
      .from('turnos')
      .select('*, categorias(nombre, tiempo_estimado)')
      // Ordenamos por random o reciente para variar los datos
      .order('created_at', { ascending: false }) 
      .limit(100)

    if (error) throw error
    if (!data || !Array.isArray(data) || data.length === 0) throw new Error('No turnos')

    const rows = data as any[]
    let idx: number
    
    // Lógica criptográfica segura para random
    if (typeof crypto !== 'undefined' && 'getRandomValues' in crypto) {
      const arr = new Uint32Array(1)
      crypto.getRandomValues(arr)
      idx = arr[0] % rows.length
    } else {
      idx = Math.floor(Math.random() * rows.length)
    }

    const row = rows[idx]
    const catData = extractCategoryData(row);

    return {
      numero: row.numero ?? null,
      estado: row.estado ?? null,
      tiempo_espera: row.tiempo_espera ?? null,
      fecha_llamado: row.fecha_llamado ?? null,
      fecha_creacion: row.fecha_creacion ?? row.created_at ?? null,
      categoria_nombre: catData.nombre,
      categoria_tiempo: catData.tiempo,
    }
  } catch (err) {
    console.warn('getRandomTurn: fallo al leer DB, usando fallback', err)
    
    const sample: TurnData[] = [
      { numero: 'SAMPLE-100', estado: 'pendiente', tiempo_espera: 15, fecha_llamado: null, categoria_nombre: 'Atención general', categoria_tiempo: 15 },
      { numero: 'SAMPLE-200', estado: 'atendido', tiempo_espera: 0, fecha_llamado: '2024-01-01T10:00:00Z', categoria_nombre: 'Soporte', categoria_tiempo: 20 },
      { numero: 'SAMPLE-300', estado: 'en_atencion', tiempo_espera: 5, fecha_llamado: '2024-01-01T10:05:00Z', categoria_nombre: 'Técnico', categoria_tiempo: 30 },
    ]
    return sample[Math.floor(Math.random() * sample.length)]
  }
}

/**
 * Obtiene el turno que está siendo atendido actualmente en pantalla
 */
export async function getActiveTurn(): Promise<TurnData | null> {
  try {
    const { data, error } = await supabase
      .from('turnos')
      .select('*, categorias(nombre, tiempo_estimado)')
      .in('estado', ['en_atencion'])
      .order('fecha_llamado', { ascending: false })
      .limit(1)
      .maybeSingle()

    let row: any = null

    if (!error && data) {
      row = data;
    } else {
      // Fallback: si no hay nadie "en atencion", mostramos el último creado
      const res = await supabase
        .from('turnos')
        .select('*, categorias(nombre, tiempo_estimado)')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
        
      if (res.error || !res.data) return null
      row = res.data
    }

    const catData = extractCategoryData(row);

    return {
      numero: row.numero ?? null,
      estado: row.estado ?? null,
      tiempo_espera: row.tiempo_espera ?? null,
      fecha_llamado: row.fecha_llamado ?? null,
      fecha_creacion: row.fecha_creacion ?? row.created_at ?? null,
      categoria_nombre: catData.nombre,
      categoria_tiempo: catData.tiempo,
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
  getTurnByNumber,
}