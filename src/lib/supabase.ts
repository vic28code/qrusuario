import { createClient } from '@supabase/supabase-js'

// URL por defecto proporcionada por el usuario
const DEFAULT_SUPABASE_URL = 'https://alxniogydwddgtuywksy.supabase.co'

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || DEFAULT_SUPABASE_URL
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || ''

if (!supabaseAnonKey) {
	// Aviso: la clave anónima debe definirse en `.env` para que las peticiones funcionen.
	// Puedes crear un archivo `.env` con:
	// VITE_SUPABASE_URL=https://alxniogydwddgtuywksy.supabase.co
	// VITE_SUPABASE_ANON_KEY=<tu-anon-key>
	console.warn('VITE_SUPABASE_ANON_KEY no está definida. Algunas llamadas a Supabase pueden fallar.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default supabase
