/**
 * Helpers para consultas a Supabase.
 *
 * Este archivo contiene ejemplos comentados de cómo realizar consultas a
 * tablas y Storage en Supabase. Mantiene además stubs que devuelven `null`
 * o valores por defecto para que la app no falle mientras no exista el
 * proyecto Supabase.
 *
 * Pasos para activar:
 * 1. Reactivar el cliente en `src/lib/supabase.ts` (descomentar).
 * 2. Instalar `@supabase/supabase-js` si es necesario.
 * 3. Adaptar los nombres de tabla/bucket/columnas a tu esquema.
 */

// Import real cuando Supabase esté disponible
import supabase from './supabase'

/**
 * Obtiene la URL pública del logo de un usuario buscando la ruta en la tabla
 * `users` (columna `avatar_path`) y luego pidiendo `getPublicUrl` al bucket
 * `avatars`.
 *
 * Ejemplo real (descomentar para usar):
 *
 * const { data, error } = await supabase
 *   .from('users')
 *   .select('avatar_path')
 *   .eq('id', userId)
 *   .single()
 * if (error || !data?.avatar_path) return null
 * const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(data.avatar_path)
 * return urlData?.publicUrl ?? null
 */
export async function getUserLogoUrl(_userId: string): Promise<string | null> {
  if (!_userId) return null
  try {
    const { data, error } = await supabase
      .from('users')
      .select('avatar_path')
      .eq('id', _userId)
      .single()

    if (error || !data?.avatar_path) return null

    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(data.avatar_path)
    return urlData?.publicUrl ?? null
  } catch (err) {
    console.error('getUserLogoUrl error', err)
    return null
  }
}

/**
 * Obtiene una URL de logo genérica del sitio (por ejemplo, desde una tabla
 * `settings`). Ejemplo de query real (comentada):
 *
 * const { data, error } = await supabase.from('settings').select('logo_path').single()
 * if (error || !data?.logo_path) return null
 * const { data: urlData } = supabase.storage.from('public').getPublicUrl(data.logo_path)
 * return urlData?.publicUrl ?? null
 */
export async function getSiteLogoUrl(): Promise<string | null> {
  try {
    const { data, error } = await supabase.from('settings').select('logo_path').limit(1).single()
    if (error || !data?.logo_path) return null
    const { data: urlData } = supabase.storage.from('public').getPublicUrl(data.logo_path)
    return urlData?.publicUrl ?? null
  } catch (err) {
    console.error('getSiteLogoUrl error', err)
    return null
  }
}

/**
 * Obtiene el turno actual desde una tabla `turns` o similar.
 *
 * Ejemplo real (descomentar y adaptar):
 *
 * // Supongamos una tabla `turns` con columnas { id, number, status }
 * const { data, error } = await supabase.from('turns')
 *   .select('number,status')
 *   .eq('status', 'current')
 *   .limit(1)
 *   .single()
 * if (error || !data) return null
 * return data.number
 */
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
 * Convierte una ruta de storage conocida en una URL pública usando Supabase
 * Storage. Ejemplo real:
 *
 * const { data } = supabase.storage.from(bucket).getPublicUrl(path)
 * return data?.publicUrl ?? null
 */
export function getPublicUrlFromStorage(_bucket: string, _path: string): string | null {
  if (!_bucket || !_path) return null
  try {
    const { data } = supabase.storage.from(_bucket).getPublicUrl(_path)
    return data?.publicUrl ?? null
  } catch (err) {
    console.error('getPublicUrlFromStorage error', err)
    return null
  }
}

export default {
  getUserLogoUrl,
  getSiteLogoUrl,
  getPublicUrlFromStorage,
  getCurrentTurn,
}
