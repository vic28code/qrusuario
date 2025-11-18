
import supabase from './supabase'

export async function getCurrentTurn(): Promise<string | null> {
  try {
    // Intentamos obtener el turno marcado como 'current'
    let { data, error } = await supabase
      .from('turns')
      .select('number')
      .eq('status', 'current')
      .limit(1)
      .single()

    if (error || !data) {
      // Fallback: obtener el último turno por fecha (si no hay status)
      const res = await supabase.from('turns').select('number').order('created_at', { ascending: false }).limit(1).single()
      data = res.data
      error = res.error
    }

    if (error || !data) return null
    return data.number ?? null
  } catch (err) {
    console.error('getCurrentTurn error', err)
    return null
  }
}

/**
 * Obtiene el turno activo con campos extendidos: numero, estado,
 * tiempo_espera (minutos) y fecha_llamado (ISO string).
 */
export async function getActiveTurn(): Promise<{
  numero: string | null;
  estado: string | null;
  tiempo_espera: number | null;
  fecha_llamado: string | null;
} | null> {
  try {
    // Ajusta los nombres de columna si tu esquema difiere
    const { data, error } = await supabase
      .from('turns')
      .select('number, status, tiempo_espera, fecha_llamado')
      .eq('status', 'current')
      .limit(1)
      .single()

    if (error || !data) {
      // Fallback: obtener el último turno por fecha
      const res = await supabase
        .from('turns')
        .select('number, status, tiempo_espera, fecha_llamado')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      if (res.error || !res.data) return null
      return {
        numero: res.data.number ?? null,
        estado: res.data.status ?? null,
        tiempo_espera: res.data.tiempo_espera ?? null,
        fecha_llamado: res.data.fecha_llamado ?? null,
      }
    }

    return {
      numero: data.number ?? null,
      estado: data.status ?? null,
      tiempo_espera: data.tiempo_espera ?? null,
      fecha_llamado: data.fecha_llamado ?? null,
    }
  } catch (err) {
    console.error('getActiveTurn error', err)
    return null
  }
}

/**
 * Convierte una ruta de storage conocida en una URL pública usando Supabase
 * Storage. Ejemplo real:
 *
 * const { data } = supabase.storage.from(bucket).getPublicUrl(path)
 * return data?.publicUrl ?? null
 */
// NOTE: se eliminaron las funciones relacionadas con logos/storage porque
// el proyecto ahora usará una imagen directa. Este archivo mantiene sólo
// las consultas necesarias (p. ej. `getCurrentTurn`).

export default {
  getCurrentTurn,
}
