import { createClient } from '@supabase/supabase-js'

// URL por defecto proporcionada por el usuario
const DEFAULT_SUPABASE_URL = 'https://alxniogydwddgtuywksy.supabase.co'

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || DEFAULT_SUPABASE_URL
// Leer la clave ANON estándar o la PUBLISHABLE_KEY si ese es el nombre en .env
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string) || ''

let supabase: any

if (!supabaseAnonKey) {
	// Si no hay clave, no crear client real para evitar que la app explote.
		console.warn('VITE_SUPABASE_ANON_KEY / VITE_SUPABASE_PUBLISHABLE_KEY no está definida. Algunas llamadas a Supabase pueden fallar.')

			// Stub mínimo con las operaciones que usamos en la app para evitar crash.
				supabase = {
						from: (_table: string) => ({ select: async () => ({ data: null, error: null }) }),
								storage: { from: (_bucket: string) => ({ getPublicUrl: (_path: string) => ({ data: { publicUrl: '' } }) }) },
									}
									} else {
										supabase = createClient(supabaseUrl, supabaseAnonKey)
										}

										export { supabase }
										export default supabase
										