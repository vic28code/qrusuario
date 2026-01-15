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
 * Normalizamos el estado tal cual viene de la BD
 */
function normalizeEstado(estadoDb: string | null): string | null {
  if (!estadoDb) return null;
  return estadoDb.toLowerCase();
}

/**
 * Extrae datos de la categoría y calcula tiempo promedio en minutos
 */
function extractCategoryData(row: any) {
  const cat = row.categoria ?? row.categorias ?? null;
  const data = Array.isArray(cat) ? cat[0] : cat;

  let minutos = 15;
  if (data?.tiempo_prom_seg) {
    minutos = Math.ceil(data.tiempo_prom_seg / 60);
  }
  return {
    nombre: data?.nombre ?? "Turno Regular",
    tiempo: minutos
  };
}

/**
 * FUNCIÓN NUEVA: Centraliza la lógica de conversión de tiempo.
 * Recibe el tiempo de la BD (segundos) y el tiempo de la categoría (minutos).
 * Devuelve siempre MINUTOS.
 */
function calculateWaitTime(tiempoDbSeconds: number | null, categoriaMinutos: number): number {
  // Si el turno tiene un tiempo específico en la BD (ej: 200 seg), lo convertimos
  if (tiempoDbSeconds && tiempoDbSeconds > 0) {
    return Math.ceil(tiempoDbSeconds / 60);
  }
  // Si no, devolvemos el tiempo promedio de la categoría
  return categoriaMinutos;
}

export async function getTurnByNumber(turnCode: string): Promise<TurnData | null> {
  try {
    const { data, error } = await supabase
      .from('turno')
      .select(`
        *,
        categoria:categoria_id ( nombre, tiempo_prom_seg ) 
      `)
      .eq('codigo', turnCode)
      .order('emitido_en', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    const catData = extractCategoryData(data);
    
    // USAMOS LA FUNCIÓN CENTRALIZADA
    const tiempoFinal = calculateWaitTime(data.tiempo_espera, catData.tiempo);

    return {
      id: data.id,
      numero: data.codigo,
      estado: normalizeEstado(data.estado),
      tiempo_espera: tiempoFinal, 
      fecha_llamado: data.llamado_en,
      fecha_creacion: data.emitido_en,
      categoria_nombre: catData.nombre,
      categoria_tiempo: catData.tiempo,
    };
  } catch (err) {
    console.error('getTurnByNumber error:', err);
    return null;
  }
}

/**
 * Obtiene turno aleatorio (para demos)
 */
export async function getRandomTurn(): Promise<TurnData | null> {
  try {
    const { data, error } = await supabase
      .from('turno')
      .select('*, categoria:categoria_id(nombre, tiempo_prom_seg)')
      .order('emitido_en', { ascending: false })
      .limit(50)

    if (error) throw error
    if (!data || !Array.isArray(data) || data.length === 0) throw new Error('No turnos')

    const rows = data as any[]
    const idx = Math.floor(Math.random() * rows.length)
    const row = rows[idx]
    const catData = extractCategoryData(row);
    
    // CORRECCIÓN APLICADA AQUÍ TAMBIÉN
    const tiempoFinal = calculateWaitTime(row.tiempo_espera, catData.tiempo);

    return {
      numero: row.codigo,
      estado: normalizeEstado(row.estado),
      tiempo_espera: tiempoFinal, 
      fecha_llamado: row.llamado_en,
      fecha_creacion: row.emitido_en,
      categoria_nombre: catData.nombre,
      categoria_tiempo: catData.tiempo,
    }
  } catch (err) {
    console.warn('getRandomTurn: fallo al leer DB', err)
    return {
      numero: 'SAMPLE-100',
      estado: 'pendiente',
      tiempo_espera: 15,
      fecha_llamado: null,
      categoria_nombre: 'General'
    };
  }
}

/**
 * Obtiene el turno activo en pantalla
 */
export async function getActiveTurn(): Promise<TurnData | null> {
  try {
    const { data, error } = await supabase
      .from('turno')
      .select('*, categoria:categoria_id(nombre, tiempo_prom_seg)')
      .eq('estado', 'llamado')
      .order('llamado_en', { ascending: false })
      .limit(1)
      .maybeSingle()

    let row: any = null

    if (!error && data) {
      row = data;
    } else {
      const res = await supabase
        .from('turno')
        .select('*, categoria:categoria_id(nombre, tiempo_prom_seg)')
        .order('emitido_en', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (res.error || !res.data) return null
      row = res.data
    }

    const catData = extractCategoryData(row);

    // CORRECCIÓN APLICADA AQUÍ TAMBIÉN
    const tiempoFinal = calculateWaitTime(row.tiempo_espera, catData.tiempo);

    return {
      numero: row.codigo,
      estado: normalizeEstado(row.estado),
      tiempo_espera: tiempoFinal,
      fecha_llamado: row.llamado_en,
      fecha_creacion: row.emitido_en,
      categoria_nombre: catData.nombre,
      categoria_tiempo: catData.tiempo,
    }
  } catch (err) {
    console.error('getActiveTurn error', err)
    return null;
  }
}

export async function getCurrentTurn(): Promise<string | null> {
  try {
    const active = await getActiveTurn()
    return active?.numero ?? null
  } catch (err) {
    return null
  }
}

export default {
  getCurrentTurn,
  getActiveTurn,
  getRandomTurn,
  getTurnByNumber,
}